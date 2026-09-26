// ================= NEC-2 engine (nec2c compiled to WebAssembly) =================
const NEC_B64='__NEC_WASM__';
const NEC_WORKER_SRC=`__NEC_RUNNER__
let MOD=null;
onmessage=async e=>{const d=e.data;
  try{ if(d.module){MOD=d.module;postMessage({id:d.id,ok:true});return;}
       postMessage({id:d.id,out:runNec(MOD,d.deck)}); }
  catch(err){postMessage({id:d.id,err:String(err&&err.message||err)});}
};`;
const NEC={ok:false,err:null,worker:null,seq:0,pending:{},cache:new Map()};
async function necInit(){
  try{
    const bin=Uint8Array.from(atob(NEC_B64),c=>c.charCodeAt(0));
    const mod=await WebAssembly.compile(bin);
    try{
      const w=new Worker(URL.createObjectURL(new Blob([NEC_WORKER_SRC],{type:'text/javascript'})));
      w.onmessage=e=>{const p=NEC.pending[e.data.id];if(!p)return;delete NEC.pending[e.data.id];e.data.err?p.rej(new Error(e.data.err)):p.res(e.data.out);};
      NEC.worker=w; await necCall({module:mod});
    }catch(e){NEC.worker=null;NEC.mod=mod;} // no workers: run on main thread
    NEC.mod=mod; NEC.ok=true;
  }catch(e){NEC.err=String(e&&e.message||e);NEC.ok=false;}
}
function necCall(msg){
  if(!NEC.worker)return Promise.resolve(runNec(NEC.mod,msg.deck));
  return new Promise((res,rej)=>{const id=++NEC.seq;NEC.pending[id]={res,rej};NEC.worker.postMessage({...msg,id});});
}
const necRun=deck=>necCall({deck});
const fx=v=>(Math.abs(v)<1e-9?0:v).toFixed(5);

// ---- geometry → NEC deck. Antenna frame: main beam toward +y (north), z up.
function wiresToDeck(wires,feed,f,gr,tail,loads,free){
  const L=['CM JO90HH','CE'];
  wires.forEach((w,i)=>L.push(`GW ${i+1} ${w.n} ${fx(w.a[0])} ${fx(w.a[1])} ${fx(w.a[2])} ${fx(w.b[0])} ${fx(w.b[1])} ${fx(w.b[2])} ${fx(w.r)}`));
  L.push(free?'GE 0':'GE 1',...(loads||[]),...(free?[]:[`GN 2 0 0 0 ${gr.er} ${gr.sig}`]),...(NEC.ek?['EK 0']:[]),`EX 0 ${feed.tag} ${feed.seg} 0 1 0`,`FR 0 1 0 0 ${f.toFixed(5)} 0`,...tail,'EN');
  return L.join('\n')+'\n';
}
function segCount(len,lam,min){return Math.max(min,Math.ceil(len/(lam/60)));}
function deltaDims(Pe,apex,bottom){
  bottom=Math.min(bottom,apex-0.5);
  const hEq=Pe/3*Math.sqrt(3)/2; let h=apex-bottom,b,s;
  if(h>=hEq){h=hEq;b=Pe/3;s=Pe/3;} else {b=(Pe*Pe-4*h*h)/(2*Pe); s=(Pe-b)/2;}
  return {b,s,h,apex:bottom+h,bottom,Pe};
}
function necGeomDelta(p,scale,r){
  const lam=299.8/p.f, d=deltaDims(306/p.f*scale,p.apex,p.bottom);
  const A=[0,0,d.apex],R=[d.b/2,0,d.bottom],L=[-d.b/2,0,d.bottom];
  const ns=segCount(d.s,lam,7), nb=segCount(d.b,lam,9)|1;
  const wires=[{a:A,b:R,n:ns,r},{a:R,b:L,n:nb,r},{a:L,b:A,n:ns,r}];
  let feed;
  if(p.feed==='corner')feed={tag:2,seg:1};
  else if(p.feed==='base')feed={tag:2,seg:(nb+1)/2};
  else feed={tag:1,seg:Math.min(ns,Math.max(1,Math.ceil((d.Pe/4)/d.s*ns)))};
  return {wires,feed,info:{...d,kind:'delta'}};
}
function necGeomDipole(p,scale,r){
  const lam=299.8/p.f, Le=143/p.f*scale, half=Le/2;
  let droop=0; if(p.shape==='invv')droop=Math.min(30*Math.PI/180,Math.asin(Math.min(1,Math.max(0,(p.height-2)/half))));
  const nl=segCount(half,lam,10), segL=half/nl, c=segL/2;  // centre feed wire has the same length as one leg segment
  const endX=c+(half-c)*Math.cos(droop), endZ=p.height-(half-c)*Math.sin(droop);
  const wires=[{a:[-endX,0,endZ],b:[-c,0,p.height],n:nl,r},{a:[-c,0,p.height],b:[c,0,p.height],n:1,r},{a:[c,0,p.height],b:[endX,0,endZ],n:nl,r}];
  if(p.feedSys==='atu'||p.feedSys==='nobalun'){ // coax shield outer surface without balun: down to 0.3 m, then 15 m along the ground (toward the shack, behind the main beam)
    const rc=p.coaxR||0.0025, zB=0.3, drop=p.height-zB, run=Math.max(1,(p.coaxLen||20)-drop), nv=Math.max(3,Math.ceil((p.height-zB)/(lam/40))), nh=Math.max(3,Math.ceil(run/(lam/40)));
    wires.push({a:[c,0,p.height],b:[c,0,zB],n:nv,r:rc},{a:[c,0,zB],b:[c,-run,zB],n:nh,r:rc});
  }
  return {wires,feed:{tag:2,seg:1},info:{kind:'dipole',Le,droop:droop*180/Math.PI,endH:endZ,height:p.height}};
}
// Yagi dimensions tuned with NEC-2 in free space (positions from reflector, element lengths, tube radius) [m]
const NEC_YAGI={
  y15_4el:{pos:[0,1.70,3.82,6.36],len:[7.003,6.722,6.427,5.793],r:0.010},
  y15_5el:{pos:[0,1.98,3.82,7.07,10.75],len:[6.975,6.692,6.476,6.421,6.293],r:0.010},
  y10_5el:{pos:[0,1.47,2.84,5.26,8.00],len:[5.184,4.963,4.786,4.761,4.684],r:0.008},
  a3s20:{pos:[0,1.83,4.27],len:[10.497,10.296,9.691],r:0.012},
  a3s15:{pos:[0,1.83,4.27],len:[7.035,6.716,6.353],r:0.012},
  a3s10:{pos:[0,1.83,4.27],len:[5.162,4.876,4.591],r:0.012}
};
function yagiKey(t,p){return t==='y15'?'y15_'+p.design:t==='y10'?'y10_5el':'a3s'+p.band;}
function necGeomYagi(t,p){
  const Y=NEC_YAGI[yagiKey(t,p)], boom=Y.pos[Y.pos.length-1], n=21;
  const wires=Y.pos.map((y,i)=>({a:[-Y.len[i]/2,y-boom/2,p.height],b:[Y.len[i]/2,y-boom/2,p.height],n,r:Y.r}));
  const lam=299.8/p.f;
  return {wires,feed:{tag:2,seg:11},info:{kind:'yagi',height:p.height,boom,lam,des:Y.pos.map((y,i)=>[y/lam,Y.len[i]/lam]),posM:Y.pos,lenM:Y.len}};
}

// ---- output parsers
function parseZ(out){const m=out.match(/ANTENNA INPUT PARAMETERS[\s\S]*?\n\s+\d+\s+\d+\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/);
  if(!m)throw new Error('brak impedancji w wyniku NEC');return {R:parseFloat(m[5]),X:parseFloat(m[6])};}
function parseCurrents(out,nseg){
  const i=out.indexOf('CURRENTS AND LOCATION');const lines=out.slice(i).split('\n');const cur=[];
  for(const l of lines){const t=l.trim().split(/\s+/);if(t.length>=10&&/^\d+$/.test(t[0])&&/^\d+$/.test(t[1])){cur.push([parseFloat(t[6]),parseFloat(t[7])]);if(cur.length===nseg)break;}}
  return cur;
}
function parsePattern(out){ // → G[phiIndex 0..71][thetaIndex 0..90]
  const i=out.indexOf('RADIATION PATTERNS');const G=Array.from({length:72},()=>new Array(91).fill(-99));
  for(const l of out.slice(i).split('\n')){const t=l.trim().split(/\s+/);
    if(t.length>=5&&/^-?\d+\.\d+$/.test(t[0])&&/^-?\d+\.\d+$/.test(t[1])){const th=Math.round(parseFloat(t[0])),ph=Math.round(parseFloat(t[1]));
      if(th>=0&&th<=90&&ph%5===0&&ph>=0&&ph<360)G[ph/5][th]=parseFloat(t[4]);}}
  const m=out.match(/AVERAGE POWER GAIN:\s*(\S+)\s*-\s*SOLID ANGLE USED IN AVERAGING:\s*\(\s*\+?(\S+)\)\*PI/);
  const eff=m?parseFloat(m[1])*parseFloat(m[2])/4:null;
  return {G,eff};
}
function wireSegs(wires){const segs=[];
  for(const w of wires)for(let k=0;k<w.n;k++){const t0=k/w.n,t1=(k+1)/w.n;
    const p0=w.a.map((v,j)=>v+(w.b[j]-v)*t0),p1=w.a.map((v,j)=>v+(w.b[j]-v)*t1);
    segs.push({r:p0.map((v,j)=>(v+p1[j])/2),dl:p1.map((v,j)=>v-p0[j])});}
  return segs;}

// ---- analysis: tune to resonance (wire antennas), then pattern over Sommerfeld-Norton ground
async function necAnalyze(t,p,wireR,ground,extra){
  const gr={er:ground.er,sig:ground.sig};
  const key=JSON.stringify([extra?extra.key:0,NEC.ek,t,p.tune,p.f,p.apex,p.bottom,p.feed,p.feedSys,(p.feedSys==='atu'||p.feedSys==='nobalun')?[p.coaxLen,p.coaxR]:0,p.height,p.shape,p.design,p.band,wireR,gr]);
  if(NEC.cache.has(key))return NEC.cache.get(key);
  let scale=1, tuned=false; const geomOf=s=>necGeom(t,p,s,wireR);
  if(t==='delta'||t==='dipole'||(t==='hex'&&p.tune)){ // secant search for X=0 at the resonance frequency
    const X=async s=>{const g=geomOf(s);return parseZ(await necRun(wiresToDeck(g.wires,g.feed,p.f,gr,['XQ']))).X;};
    let s0=1,x0=await X(s0),s1=t==='hex'?0.98:0.97,x1=await X(s1);
    for(let k=0;k<6&&Math.abs(x1)>1;k++){if(x1===x0)break;const s2=Math.min(1.3,Math.max(0.75,s1-x1*(s1-s0)/(x1-x0)));s0=s1;x0=x1;s1=s2;x1=await X(s1);}
    scale=s1; tuned=true;
  }
  const g=geomOf(scale); let metalSkipped=false;
  if(extra){if(minWireDist(g.wires,extra.wires)<0.3){metalSkipped=true;extra=null;}else g.wires=g.wires.concat(extra.wires);}
  const out=await necRun(wiresToDeck(g.wires,g.feed,p.f,gr,['RP 0 91 72 1001 0 0 1 5']));
  const Z=parseZ(out), segs=wireSegs(g.wires), cur=parseCurrents(out,segs.length), pat=parsePattern(out);
  segs.forEach((s,i)=>{s.I=1;s.Ic=cur[i]||[0,0];});
  const nAnt=extra?segs.length-wireSegs(extra.wires).length:segs.length;
  let wz=0,ws=0;segs.slice(0,nAnt).forEach(s=>{const a=Math.hypot(...s.Ic)*Math.hypot(...s.dl);wz+=a*s.r[2];ws+=a;});
  const res={Z,segs,zc:wz/ws,pat,info:g.info,scale,tuned,metalSkipped};
  NEC.cache.set(key,res); if(NEC.cache.size>60)NEC.cache.delete(NEC.cache.keys().next().value);
  return res;
}
// NEC pattern in the antenna frame → gain toward compass azimuth az (deg) after rotating the antenna to 'beam'
function necGain(res,az,el){
  const a=((az%360)+360)%360, phi=((90-a)%360+360)%360;   // NEC phi from +x (east) counter-clockwise
  const f=phi/5,i0=Math.floor(f)%72,i1=(i0+1)%72,w=f-Math.floor(f);
  const th=Math.max(0,Math.min(90,90-el)),t0=Math.floor(th),t1=Math.min(90,t0+1),v=th-t0;
  const G=res.pat.G, g=(i,t)=>Math.max(-60,G[i][t]);
  return (g(i0,t0)*(1-v)+g(i0,t1)*v)*(1-w)+(g(i1,t0)*(1-v)+g(i1,t1)*v)*w;
}
function rotateSegs(segs,beam){const b=beam*Math.PI/180,c=Math.cos(b),s=Math.sin(b);
  const R=v=>[v[0]*c+v[1]*s,-v[0]*s+v[1]*c,v[2]];
  return segs.map(g=>({r:R(g.r),dl:R(g.dl),I:g.I,Ic:g.Ic}));}

function necGeom(t,p,s,r){return t==='delta'?necGeomDelta(p,s,r):t==='dipole'?necGeomDipole(p,s,r):t==='hex'?necGeomHex(p,s):necGeomYagi(t,p);}
function geomRadius(g){let m=0;g.wires.forEach(w=>[w.a,w.b].forEach(v=>m=Math.max(m,Math.hypot(v[0],v[1]))));return m;}
// Main antenna with a second (passive) antenna nearby. nb:{type,p,beam,dist,brg,term}; mainBeam = compass azimuth of main beam.
async function necAnalyzeNb(t,p,wireR,ground,mainBeam,nb,extra){
  const gr={er:ground.er,sig:ground.sig};
  const base=await necAnalyze(t,p,wireR,ground,extra);
  const nbBase=await necAnalyze(nb.type,nb.p,wireR,ground);
  const g1=necGeom(t,p,base.scale,wireR), g2=necGeom(nb.type,nb.p,nbBase.scale,wireR);

  const key=JSON.stringify(['nb',extra?extra.key:0,NEC.ek,t,p.f,p.apex,p.bottom,p.feed,p.feedSys,(p.feedSys==='atu'||p.feedSys==='nobalun')?[p.coaxLen,p.coaxR]:0,p.height,p.shape,p.design,p.band,wireR,gr,mainBeam,nb.type,nb.p,nb.beam,nb.dist,nb.brg,nb.term]);
  if(NEC.cache.has(key))return NEC.cache.get(key);
  // neighbour: rotate by (its beam − main beam) clockwise, then place at its position expressed in the main antenna frame
  const rel=(nb.beam-mainBeam)*Math.PI/180, c=Math.cos(rel), sn=Math.sin(rel);
  const rot=v=>[v[0]*c+v[1]*sn,-v[0]*sn+v[1]*c,v[2]];
  const pb=(nb.brg-mainBeam)*Math.PI/180, off=[nb.dist*Math.sin(pb),nb.dist*Math.cos(pb),0];
  const w2=g2.wires.map(w=>({a:rot(w.a).map((v,i)=>v+off[i]),b:rot(w.b).map((v,i)=>v+off[i]),n:w.n,r:w.r}));
  const minD=minWireDist(g1.wires,w2); if(minD<0.5)return {overlap:true,minD};
  if(extra&&(base.metalSkipped||minWireDist(w2,extra.wires)<0.3))extra=null;
  const wires=g1.wires.concat(w2,extra?extra.wires:[]), nbTag=g1.wires.length+g2.feed.tag;
  const Rl=nb.term==='50'?50:1e9;
  const out=await necRun(wiresToDeck(wires,g1.feed,p.f,gr,['RP 0 91 72 1001 0 0 1 5'],[`LD 4 ${nbTag} ${g2.feed.seg} ${g2.feed.seg} ${Rl} 0`]));
  const Z=parseZ(out), segs=wireSegs(wires), cur=parseCurrents(out,segs.length), pat=parsePattern(out);
  segs.forEach((q,i)=>{q.I=1;q.Ic=cur[i]||[0,0];});
  let wz=0,ws=0;segs.slice(0,wireSegs(g1.wires).length).forEach(q=>{const a=Math.hypot(...q.Ic)*Math.hypot(...q.dl);wz+=a*q.r[2];ws+=a;});
  const res={Z,segs,zc:wz/ws,pat,info:base.info,scale:base.scale,tuned:base.tuned,base,nbWires:w2};
  NEC.cache.set(key,res); if(NEC.cache.size>60)NEC.cache.delete(NEC.cache.keys().next().value);
  return res;
}

function minWireDist(A,B){ // approximate minimum 3D distance between two wire sets (sampled)
  const pts=ws=>{const o=[];ws.forEach(w=>{const n=Math.max(4,Math.ceil(Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1],w.b[2]-w.a[2])/0.25));for(let k=0;k<=n;k++)o.push(w.a.map((v,j)=>v+(w.b[j]-v)*k/n));});return o;};
  const a=pts(A),b=pts(B);let m=1e9;for(const p of a)for(const q of b){const d=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);if(d<m)m=d;}return m;}

// L-network (series L + shunt C, as in typical automatic tuners) matching Z = R+jX to R0.
function lNetwork(Z,f,R0=50,QL=100){
  const w=2*Math.PI*f*1e6, R=Z.R, X=Z.X, sols=[];
  // shunt C on antenna side, series L toward TX
  {const d=R*R+X*X, G=R/d, B=-X/d, v=G/R0-G*G; if(v>=0)for(const sg of [1,-1]){const Bt=sg*Math.sqrt(v), Bp=Bt-B, zr=G/(G*G+Bt*Bt), zi=-Bt/(G*G+Bt*Bt), Xs=-zi;
      sols.push({side:'antenna',Xs,Bp,eff:1-(Math.abs(Xs)/QL)/R0});}}
  // series L at antenna, shunt C on TX side
  {const v=R*R0-R*R; if(v>=0)for(const sg of [1,-1]){const Xt=sg*Math.sqrt(v), Xs=Xt-X, d=R*R+Xt*Xt, Bp=Xt/d;
      sols.push({side:'tx',Xs,Bp,eff:R/(R+Math.abs(Xs)/QL)});}}
  const ok=sols.filter(s=>s.Xs>=-1e-9&&s.Bp>=-1e-12);
  const pick=(ok.length?ok:sols).sort((a,b)=>b.eff-a.eff)[0];
  if(!pick)return null;
  return {side:pick.side,L:Math.max(0,pick.Xs)/w*1e6,C:Math.max(0,pick.Bp)/w*1e12,lossDb:-10*Math.log10(Math.max(1e-3,pick.eff)),valid:ok.length>0};
}

// Coax feeder: attenuation α(f)=a·√f+b·f [dB/100 m], f in MHz (fitted to catalogue values)
const COAX={
  rg58:{n:'RG-58 Flex',a:1.503,b:0.0247,vf:0.66,r:0.0025,src:'typowo 5,0 dB/100 m przy 10 MHz, 17,5 dB/100 m przy 100 MHz'},
  rf7:{n:'RF-7',a:0.629,b:0.0011,vf:0.84,r:0.00365,src:'2,0 dB/100 m przy 10 MHz, 6,4 dB/100 m przy 100 MHz (katalog)'}
};
function coaxLoss(type,f,len,gamma){ // matched loss, total loss with mismatch, SWR at the radio end
  const c=COAX[type], ML=(c.a*Math.sqrt(f)+c.b*f)*len/100, A=Math.pow(10,ML/10), g2=gamma*gamma;
  const TL=10*Math.log10((A*A-g2)/(A*(1-g2))), gin=gamma/A;
  return {ML,TL,swrIn:(1+gin)/(1-gin),name:c.n};
}

// ---- G3TXQ broadband hexbeam (as built by SP7IDX), one band at a time. Dimensions [m]:
// half driver, half reflector, end gap, height of this band's wires relative to the 10 m wires.
// 20–10 m: G3TXQ table (inches → m); 6 m scaled from 10 m by frequency (no published table used).
const HEX={
  '20':{f:14.175,d:5.537,r:5.232,g:0.610,z:0.965},
  '17':{f:18.118,d:4.305,r:4.077,g:0.470,z:0.381},
  '15':{f:21.225,d:3.670,r:3.485,g:0.406,z:0.229},
  '12':{f:24.940,d:3.091,r:2.946,g:0.343,z:0.127},
  '10':{f:28.500,d:2.713,r:2.596,g:0.305,z:0.000},
  '6': {f:50.150,d:1.542,r:1.475,g:0.173,z:-0.10}
};
function necGeomHex(p,scale=1){
  const H=HEX[p.band], R=(H.d+H.r+H.g)/3, z=p.height-(0.965-H.z), wr=0.00065, lam=299.8/H.f;
  const V=a=>[R*Math.sin(a*Math.PI/180),R*Math.cos(a*Math.PI/180),z];            // hexagon vertex, beam toward +y (0°)
  const along=(A,B,t)=>A.map((v,i)=>v+(B[i]-v)*t/R);
  const n=L=>Math.max(3,Math.ceil(L/(lam/50)));
  const td=Math.max(0.05,H.d*scale-R), tr=H.r-R, c=0.05;
  const hubL=[-c,0,z], hubR=[c,0,z];
  const wires=[
    {a:hubL,b:hubR,n:1,r:wr},                                        // feed segment at the centre post
    {a:hubR,b:V(60),n:n(R),r:wr},{a:V(60),b:along(V(60),V(120),td),n:n(td),r:wr},     // driver, right half ("W")
    {a:hubL,b:V(300),n:n(R),r:wr},{a:V(300),b:along(V(300),V(240),td),n:n(td),r:wr},  // driver, left half
    {a:along(V(120),V(60),tr),b:V(120),n:n(tr),r:wr},{a:V(120),b:V(180),n:n(R),r:wr}, // reflector ("M"), right
    {a:V(180),b:V(240),n:n(R),r:wr},{a:V(240),b:along(V(240),V(300),tr),n:n(tr),r:wr} // reflector, left
  ];
  return {wires,feed:{tag:1,seg:1},info:{kind:'hex',height:p.height,zBand:z,R,band:p.band,lam,dims:H,dHalf:R+td,tail:td,gap:R-td-tr}};
}

// Metal objects (e.g. a steel trailer, a tin garage) as NEC wire grids. poly: 4 corners in the antenna frame [m], z0..z1 height.
function wireBox(poly,z0,z1,step=1.0,r=0.005){
  const len=i=>{const a=poly[i],b=poly[(i+1)%4];return Math.hypot(b[0]-a[0],b[1]-a[1]);};
  const nA=Math.max(1,Math.round(Math.max(len(0),len(2))/step)), nB=Math.max(1,Math.round(Math.max(len(1),len(3))/step)), ns=[nA,nB,nA,nB];
  const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const per=[];for(let i=0;i<4;i++)for(let k=0;k<ns[i];k++)per.push(lerp(poly[i],poly[(i+1)%4],k/ns[i]));
  const nz=Math.max(1,Math.round((z1-z0)/step)),zs=[...Array(nz+1)].map((_,i)=>z0+(z1-z0)*i/nz),w=[];
  const P=(q,z)=>[q[0],q[1],z];
  for(const z of zs)for(let i=0;i<per.length;i++)w.push({a:P(per[i],z),b:P(per[(i+1)%per.length],z),n:1,r});   // rings
  for(const q of per)for(let j=0;j<nz;j++)w.push({a:P(q,zs[j]),b:P(q,zs[j+1]),n:1,r});                          // posts
  for(let k=1;k<nA;k++){const a=lerp(poly[0],poly[1],k/nA),b=lerp(poly[3],poly[2],k/nA);                          // roof ribs
    w.push({a:P(a,z1),b:P(b,z1),n:Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/step)),r});}
  return w;
}

// "Catalogue" gain: the same antenna alone in free space (no ground, no metal, no neighbour).
async function necFreeSpace(t,p,wireR,scale){
  const key=JSON.stringify(['fs',NEC.ek,t,p.tune,p.f,p.apex,p.bottom,p.feed,p.height,p.shape,p.design,p.band,wireR,scale]);
  if(NEC.cache.has(key))return NEC.cache.get(key);
  const g=necGeom(t,p,scale,wireR);
  const out=await necRun(wiresToDeck(g.wires,g.feed,p.f,{er:1,sig:0},['RP 0 37 72 1000 0 0 5 5'],null,true));
  let best={g:-999,th:90,ph:90},fwd=null,back=null;const i=out.indexOf('RADIATION PATTERNS');
  for(const l of out.slice(i).split('\n')){const q=l.trim().split(/\s+/);if(q.length>=5&&/^-?\d+\.\d+$/.test(q[0])&&/^-?\d+\.\d+$/.test(q[1])){
    const th=parseFloat(q[0]),ph=parseFloat(q[1]),gv=parseFloat(q[4]);if(gv>best.g)best={g:gv,th,ph};
    if(Math.abs(th-90)<0.01&&Math.abs(ph-90)<0.01)fwd=gv;if(Math.abs(th-90)<0.01&&Math.abs(ph-270)<0.01)back=gv;}}
  const res={max:best.g,fwd,fb:(fwd!=null&&back!=null)?fwd-back:null};
  NEC.cache.set(key,res);return res;
}

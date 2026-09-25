// Minimal in-memory WASI shim to run nec2c.wasm: runNec(module, deckText) -> output text
function runNec(module, deck){
  const files={'in.nec':new TextEncoder().encode(deck),'out.txt':new Uint8Array(0)};
  const fds={}; let nextFd=4; let mem=null; let stderr='';
  const dv=()=>new DataView(mem.buffer), u8=()=>new Uint8Array(mem.buffer);
  const args=['nec2c','-i','in.nec','-o','out.txt'];
  const enc=s=>new TextEncoder().encode(s);
  class Exit{constructor(c){this.code=c;}}
  const grow=(f,need)=>{const a=files[f.name];if(need<=a.length)return;let n=Math.max(need,a.length*2,4096);const b=new Uint8Array(n);b.set(a);files[f.name]=b;};
  const wasi={
    args_sizes_get(pc,ps){const d=dv();d.setUint32(pc,args.length,true);d.setUint32(ps,args.reduce((s,a)=>s+enc(a).length+1,0),true);return 0;},
    args_get(pa,pb){const d=dv(),m=u8();let o=pb;args.forEach((a,i)=>{d.setUint32(pa+4*i,o,true);const e=enc(a);m.set(e,o);m[o+e.length]=0;o+=e.length+1;});return 0;},
    clock_time_get(id,prec,p){dv().setBigUint64(p,BigInt(Math.round(performance.now()*1e6)),true);return 0;},
    fd_close(fd){const f=fds[fd];if(f&&f.write)files[f.name]=files[f.name].slice(0,f.size);delete fds[fd];return 0;},
    fd_fdstat_get(fd,p){const d=dv();d.setUint8(p,fd===3?3:(fd<3?2:4));d.setUint16(p+2,0,true);d.setBigUint64(p+8,0xffffffffn,true);d.setBigUint64(p+16,0xffffffffn,true);return 0;},
    fd_fdstat_set_flags(){return 0;},
    fd_prestat_get(fd,p){if(fd!==3)return 8;const d=dv();d.setUint8(p,0);d.setUint32(p+4,1,true);return 0;},
    fd_prestat_dir_name(fd,p,l){if(fd!==3)return 8;u8()[p]=46;return 0;}, // "."
    path_open(dirfd,df,pp,pl,oflags,rb,ri,fdflags,pfd){
      let name=new TextDecoder().decode(u8().slice(pp,pp+pl)).replace(/^\.\//,'');
      const creat=oflags&1, trunc=oflags&8;
      if(!(name in files)){if(!creat)return 44;files[name]=new Uint8Array(0);}
      const f={name,pos:0,size:files[name].length,write:!!(creat||trunc)};
      if(trunc){f.size=0;}
      const fd=nextFd++;fds[fd]=f;dv().setUint32(pfd,fd,true);return 0;},
    fd_read(fd,iovs,n,pr){const f=fds[fd];if(!f){dv().setUint32(pr,0,true);return 0;}const d=dv(),m=u8();let tot=0;
      for(let i=0;i<n;i++){const b=d.getUint32(iovs+8*i,true),l=d.getUint32(iovs+8*i+4,true);const src=files[f.name];const k=Math.max(0,Math.min(l,f.size-f.pos));m.set(src.subarray(f.pos,f.pos+k),b);f.pos+=k;tot+=k;if(k<l)break;}
      d.setUint32(pr,tot,true);return 0;},
    fd_write(fd,iovs,n,pw){const d=dv();let tot=0;
      for(let i=0;i<n;i++){const b=d.getUint32(iovs+8*i,true),l=d.getUint32(iovs+8*i+4,true);const chunk=u8().slice(b,b+l);
        if(fd<=2){stderr+=new TextDecoder().decode(chunk);}
        else{const f=fds[fd];grow(f,f.pos+l);files[f.name].set(chunk,f.pos);f.pos+=l;f.size=Math.max(f.size,f.pos);}
        tot+=l;}
      d.setUint32(pw,tot,true);return 0;},
    fd_seek(fd,off,wh,pn){const f=fds[fd];if(!f)return 8;const o=Number(off);f.pos=wh===0?o:wh===1?f.pos+o:f.size+o;dv().setBigUint64(pn,BigInt(f.pos),true);return 0;},
    proc_exit(c){throw new Exit(c);}
  };
  const inst=new WebAssembly.Instance(module,{wasi_snapshot_preview1:wasi});
  mem=inst.exports.memory;
  let code=0;
  try{inst.exports._start();}catch(e){if(e instanceof Exit)code=e.code;else throw e;}
  for(const fd in fds){const f=fds[fd];if(f.write)files[f.name]=files[f.name].slice(0,f.size);}
  const out=new TextDecoder().decode(files['out.txt']);
  if(code!==0&&!out)throw new Error('nec2c exit '+code+': '+stderr);
  return out;
}
if(typeof module!=='undefined')module.exports={runNec};

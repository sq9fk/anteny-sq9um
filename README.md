# Anteny JO90HH — symulator anten KF nad rzeczywistym terenem

**[▶ Otwórz symulator: sq9fk.github.io/anteny-sq9um](https://sq9fk.github.io/anteny-sq9um/)**

Przeglądarkowy symulator anten krótkofalowych dla konkretnej lokalizacji. Liczy charakterystyki promieniowania silnikiem **NEC-2**, z rzeczywistym gruntem, i dodaje wpływ **ukształtowania terenu** z numerycznego modelu terenu **GUGiK (Geoportal)**. Działa w całości w przeglądarce, bez instalacji i bez serwera.

Projekt powstał przy planowaniu anten DX na działce w lokatorze **JO90HH** (okolice Gliwic) dla stacji **SQ9UM**.

Siostrzany projekt dla działki SQ9FK w JO90HI: [sq9fk.github.io/anteny-sq9fk](https://sq9fk.github.io/anteny-sq9fk/).

![Zakładka Yagi 15 m: mapa nieba, charakterystyka pozioma, wskaźniki](docs/screenshot.png)

---

## Co potrafi

**Anteny (zakładki):**

| Zakładka | Pasma | Parametry |
|---|---|---|
| **Delta** (pionowa polaryzacja) | 80 m, 40 m, dowolny rezonans | wysokość wierzchołka i dolnego drutu, punkt zasilania (narożnik, ¼λ od góry, środek dołu), azymut co 1°; tryb wielopasmowy: pętla pełnofalowa na 80 albo 40 m, praca na pasmach 80–10 m z balunem 4:1 i tunerem przy radiu albo eATU przy antenie; najlepsze ułożenie liczone w NEC-2 |
| **Delta pozioma** | 80–10 m z tunerem | pętla rozpięta na trzech punktach (maszty albo dowolne miejsca na działce, z wysokością każdego narożnika), zasilanie w narożniku albo na środku boku, balun 4:1 z tunerem przy radiu albo eATU przy antenie |
| **Dipol** | 80 / 40 / 20 m, dowolny rezonans | wysokość, płaski lub odwrócone V, obrót co 1°, kąt między ramionami w rzucie z góry 30–180° (dipol zgięty w V), dopasowanie do działki |
| **Yagi 15 m** | 21,2 MHz | 4 lub 5 elementów, wysokość, azymut co 1° |
| **Yagi 10 m** | 28,5 MHz | 5 elementów, wysokość, azymut co 1° |
| **Cushcraft A3S** | 20 / 15 / 10 m | wysokość, azymut co 1° |
| **Hexbeam** G3TXQ (SP7IDX) | 20 / 17 / 15 / 12 / 10 / 6 m | wysokość, azymut co 1°, opcjonalne dostrojenie drivera do rezonansu |
| **Quad Cubex SkyMaster III** | 20 / 17 / 15 / 12 / 10 m | 3 el., wymiary z instrukcji Cubex, wysokość boomu, azymut co 1°, dopasowanie wg instrukcji (λ/4 RG-11) albo kabel 50 Ω wprost, opcjonalnie z pętlami pozostałych pasm |

**Zysk katalogowy:** zysk w wolnej przestrzeni (dBi i dBd, dla anten kierunkowych także F/B) liczony w NEC-2, dla porównania z danymi producentów i z zyskiem nad gruntem.

**Wyniki:**

- mapa nieba (zysk w każdym kierunku i przy każdym kącie elewacji),
- charakterystyka pozioma dla wybranego kąta i pionowa dla wybranego azymutu,
- profil terenu w wybranym kierunku (z krzywizną Ziemi),
- tabela kierunków DX (USA, Karaiby, PY, ZS, VK, JA) z zyskiem przy 5°, 10° i 20° oraz wpływem terenu,
- impedancja wejściowa, SWR przy 50 Ω, sprawność i straty w gruncie,
- F/R dla anten kierunkowych,
- dostrojenie delty i dipola do rezonansu oraz **długość do cięcia** dla wybranego drutu.

**Dodatkowo:**

- **Zasilanie:** delta z balunem 4:1 albo 1:1 (SWR liczony względem 200 Ω albo 50 Ω). Dipol w trzech wariantach: balun 1:1, bez baluna z automatycznym tunerem eATU (SP9MK) przy antenie albo bez baluna. W wariantach bez baluna NEC-2 modeluje ekran kabla, po którym płynie prąd wspólny. Dla eATU strona podaje potrzebne L i C oraz straty w dopasowaniu.
- **Odbiór: RDF i SNR.** RDF (Receiving Directivity Factor) to zysk w kierunku stacji minus średni zysk anteny w górnej półprzestrzeni, z charakterystyki NEC-2 z terenem. SNR jest liczony dla sygnału 1 µV/m w paśmie SSB 2,5 kHz. Szum zewnętrzny pochodzi z ITU-R P.372 (miasto, osiedle, wieś, cicha wieś; szum z działalności człowieka i galaktyczny), a szumy radia z podanej liczby szumowej. Opcjonalnie część zakłóceń przychodzi nisko z kierunku domów w promieniu 100 m (z modeli LoD1). Strona pokazuje też, o ile szum z zewnątrz przewyższa szumy radia, czyli czy straty anteny w ogóle mają znaczenie przy odbiorze. RDF i SNR są w tabeli DX i we wskaźnikach. To przybliżenie do porównywania anten na tej samej działce.
- **Kabel zasilający:** RG-58 Flex albo RF-7 o wybranej długości. Strona liczy tłumienie, dodatkowe straty od niedopasowania i SWR przy radiu, a wykresy uwzględniają straty w kablu. W wariantach bez baluna długość kabla jest też długością ekranu, po którym płynie prąd wspólny.
- **Najlepsze ułożenie delty (NEC-2):** wierzchołek zostaje na maszcie na wybranej wysokości, a strona sprawdza w NEC-2 wysokość dolnego drutu (co 0,5 m), punkt zasilania, balun 1:1 lub 4:1 i obrót co 3° (potem co 1°), z poprawką od terenu i budynków. Kryterium to średni zysk przy 5–15° w wybranym kierunku DX. Pod uwagę idą tylko układy, w których oba narożniki mieszczą się w działce, i opcjonalnie tylko z SWR ≤ 2. Plan działki pokazuje podstawę delty.
- **Najlepsze ułożenie na kierunki DX (dipol, delta pionowa, delta pozioma):** przycisk „policz dla wszystkich kierunków” liczy w NEC-2 warianty anteny dla ośmiu głównych kierunków DX (W1, W6, Karaiby, PY, ZS, VK6, VK2, JA) i pokazuje listę przycisków. Strona sama wybiera, skąd pociągnąć drut: z masztu M1–M3 albo z nowego punktu na działce (siatka co 2,5 m, podany jako odległość i azymut od najbliższego masztu). Istniejący maszt wygrywa, jeśli traci do najlepszego nowego punktu najwyżej 0,3 dB; w przeciwnym razie pod wynikiem widać, ile daje najlepszy istniejący maszt. Dipol nie wisi na maszcie z deltą, a delta na zajętym maszcie pokazuje, co trzeba z niego zdjąć. Każdy przycisk podaje układ drutu, średni zysk przy 5–15° w tym kierunku (z terenem, budynkami, drzewami i stratami w kablu albo eATU) i straty w zasilaniu. Kliknięcie ustawia antenę w tym układzie i wybiera ten azymut. Dipol: kąt między ramionami od 180° (prosty) do 30° (wąskie V) co 5°, obrót co 1°. Delta pionowa: dolny drut 1–5 m nad ziemią, trzy punkty zasilania i linia dolnego drutu co 5°. Delta pozioma: punkt zasilania w każdym z trzech narożników albo na środku każdego boku. Drut musi się zmieścić w działce (0,5 m od granicy) i ominąć przeszkody na działce: nad altaną, szopą czy domkiem musi przejść co najmniej 1 m wyżej niż dach (i 1 m obok), a nad koroną drzewa co najmniej 0,5 m wyżej. Punkt zawieszenia nie może stać w budynku ani w koronie drzewa. Wyniki liczone są bez pozostałych anten na działce; po zmianie pasma, wysokości, gruntu albo kabla lista znika i trzeba ją policzyć jeszcze raz. Dipol liczy się ok. 15 s, delta ok. 7 s.
- **Dipol w działce:** oba ramiona można obracać razem, zmieniać kąt między nimi w rzucie z góry (180° = prosty dipol, mniej = litera V) albo wpisać azymuty ramion wprost. Plan pokazuje ramiona od masztu (albo od wybranego punktu na działce) i ostrzega, gdy któreś wychodzi poza granicę. Przyciski „dopasuj kąt ramion” (przy zachowanym kierunku) i „najlepsze ułożenie” szukają najbardziej rozwartego układu, który mieści się w działce z zapasem 0,5 m. Zgięty dipol ma w NEC-2 własny rezonans, niższą impedancję i bardziej dookólną charakterystykę.
- **Zakładka „Maszty”** (`#maszty`): rzut działki z masztami M1–M3 i lista masztów, na której ustawiasz, co na którym stoi, wraz z wysokością i kierunkiem wiązki. Zasady: na jednym maszcie jedna antena kierunkowa (Yagi 15 m 4 lub 5 el., Yagi 10 m, A3S, hexbeam, quad) albo delta. Dipol może wisieć na tym samym maszcie co Yagi, A3S, hexbeam lub quad, ale nie razem z deltą. Dla dipola pod anteną kierunkową strona podaje najmniejszy odstęp drutów i ostrzega, gdy spada poniżej 0,5 m. Obie Yagi 15 m (4 i 5 el.) mają osobne wysokości i azymuty, więc mogą stać na różnych masztach.
- **Plan działki SQ9UM:** granica działki (ok. 33 × 17 m), trzy maszty (M1: Yagi 5 el. 15 m, M2: A3S, M3: Yagi 4 el. 15 m) oraz przyczepa, altana i garaż. Położenie wzięte ze zrzutu z Geoportalu. Wiązka rysowana jest od masztu danej anteny (odległości między masztami: M1–M2 11 m, 169°; M1–M3 24 m, 91°). Plan ma trzy skale: działka, 150 m i 500 m. Maszty mają regulowaną wysokość, domyślnie 7 m. Każdą antenę (także deltę, dipol, Yagi 10 m, hexbeam i quad) można przypisać do dowolnego masztu albo do środka działki. Od masztu liczone są odległości do pozostałych anten i do metalowych obiektów.
- **Metal na działce:** domek (metalowa przyczepa holenderska, ok. 3 m) i garaż blaszany (2,15 m) są liczone w NEC jako siatki przewodów, dla anten na masztach M1–M3. Drewniana altana nie jest liczona. Przykład: przy Yagi 4 el. na M3, 4–5 m od domku, F/R spada z 21 do 20 dB.
- **Budynki 3D:** zabudowa w promieniu 500 m z modeli LoD1 2024 GUGiK, z wysokościami pomierzonymi lidarem, wliczona do poprawki od otoczenia. Do tego plan otoczenia z zaznaczoną wiązką.
- **Akweny:** stawy na wschód, południe i zachód od działki oraz rzeka na zachodzie (obrysy z OpenStreetMap, sprawdzone z ortofotomapą). W poprawce od terenu tam, gdzie pierwsza strefa Fresnela odbicia wypada na wodzie, odbicie liczone jest od wody (εr 80, σ 0,01 S/m), proporcjonalnie do tej części strefy. Na 40 m przy 7 m wysokości daje to do ok. +1 dB dla polaryzacji pionowej przy 10–20° w stronę stawów, przy najniższych kątach prawie nic, bo strefa odbicia leży wtedy dalej niż stawy.
- **Altany ROD:** działka leży w ogrodach działkowych, a altan i szop nie ma w modelach LoD1. 220 obiektów w promieniu ok. 250 m obrysowałem ręcznie na ortofotomapie GUGiK (WMS HighResolution), jako prostokąty obrócone zgodnie z układem działek ROD (boki w liniach ok. 77° i 167°, tak jak domek na działce SQ9UM). Dla 88 z nich wysokość pochodzi z lidaru GUGiK (numeryczny model pokrycia terenu 0,5 m minus model terenu); pozostałych lidar nie widzi (nowsze albo niskie), więc wysokość jest szacowana z powierzchni: do 12 m² 2,2 m, do 40 m² 3 m, większe 4 m. Są na planie, w poprawce od otoczenia i w modelu szumu (z wagą 0,3 domu). Najbliższa stoi ok. 8 m od środka działki, przy jej północnej granicy. Domyślne otoczenie szumowe dla tej działki to „wieś”.
- **Drzewa:** korony drzew z lidaru GUGiK (model pokrycia terenu 0,5 m minus model terenu 1 m, bez budynków z 1 m zapasem, altan, akwenów i masztów), zwykle 5–17 m. W kwadracie ±250 m wokół działki pola mają 2,5 × 2,5 m i są ułożone w osiach działek ROD (azymut 76,8°), tak jak altany; dalej, do 500 m, zostają pola 5 × 5 m w osiach N–S. Na samej działce usunąłem pola do 7 m od masztów, bo na tych wysokościach lidar widzi Yagi, a nie drzewa. Lidar i ortofotomapa pochodzą z różnych nalotów, więc drzewo wycięte albo posadzone niedawno może się nie zgadzać z tym, co jest dziś. W poprawce od otoczenia drzewa są częściowo przezroczystymi przeszkodami: strata to mniejsza z dwóch wartości, dyfrakcji na koronie i tłumienia przez pas drzew, przyjętego orientacyjnie na ok. 0,05 dB/m przy 30 MHz i mniej na niższych pasmach. Od tej działki drzewa zasłaniają głównie kierunki zachodnie i południowo-zachodnie (pas przy stawie i rzece, las za dużym stawem), przy 10–15° do kilku dB.
- **Druty DX-Wire:** UL, FL, FS, HDL, PREMIUM, goły drut albo własny współczynnik skrócenia izolacji.
- **Grunt:** słaby, przeciętny albo dobry.
- **Promień analizy terenu:** 3 km (dane wbudowane) albo 5, 10, 15 lub 20 km (pobierane na żywo z Geoportalu).
- **Pozostałe anteny na masztach:** NEC-2 liczy antenę z otwartej zakładki razem ze wszystkimi antenami przypisanymi do masztów, z odległościami i kierunkami z planu działki, i pokazuje, ile dB zabiera sprzężenie. Anteny na tym samym maszcie też się liczą (np. dipol pod Yagi), o ile druty są co najmniej 0,5 m od siebie. Pozostałe anteny mogą być podłączone (50 Ω) albo rozwarte. Wyłączenie opcji liczy samą antenę.
- **Linki do zakładek:** np. `#delta`, `#hdelta`, `#dipole`, `#y15`, `#y10`, `#a3s`, `#hex`, `#quad`, `#maszty`.

![Charakterystyka pionowa z profilem terenu](docs/przekroj.png)

![Plan działki z masztami](docs/plan.png)

---

## Jak to jest liczone

### 1. Antena i grunt: NEC-2

Charakterystyki, impedancje, rezonans i straty w gruncie liczy **nec2c**: implementacja NEC-2 w C, ten sam silnik obliczeniowy, którego używa 4nec2. Program jest skompilowany do **WebAssembly** i uruchamiany w Web Workerze.

- grunt **Sommerfelda-Nortona** (`GN 2`) o wybranych εr i σ,
- charakterystyka co 1° w elewacji i co 5° w azymucie (`RP 0 91 72 1001`),
- sprawność z uśrednionego zysku (straty w gruncie),
- delta i dipol dostrajane metodą siecznych do X = 0 na zadanej częstotliwości,
- opcjonalnie rozszerzone jądro cienkiego drutu (`EK`).

### 2. Rzeźba terenu: poprawka w stylu HFTA

NEC-2 obsługuje tylko płaski grunt. Wpływ ukształtowania terenu jest więc dodawany jako **poprawka** do wyniku NEC. Liczy ją osobny model odbić dla prądów wziętych z NEC:

- odbicie od płaszczyzny dopasowanej do terenu w **pierwszej strefie Fresnela**, ze współczynnikami Fresnela dla polaryzacji pionowej i poziomej,
- wzniesienia dalej niż 300 m liczone jako przeszkoda typu **ostrze noża**,
- **krzywizna Ziemi** ze współczynnikiem refrakcji 4/3,
- wynik: `G = G_NEC(płaski) + [G_teren − G_płaski]` z modelu odbić.

Linia przerywana „płaski grunt” na wykresach to czysty wynik NEC-2.

### 3. Dane terenu

Numeryczny model terenu (NMT) **GUGiK** jest pobierany usługą `services.gugik.gov.pl/nmt` w układzie PUWG 1992 (EPSG:2180): 72 profile co 5°, próbka co 25–100 m. Usługa zwraca nagłówki CORS, więc strona pobiera dane bezpośrednio w przeglądarce. Profile do 3 km są wbudowane w stronę, a większe promienie przeglądarka zapamiętuje po pierwszym pobraniu.

---

## Ograniczenia

- Terenu nie liczy NEC. Poprawka od rzeźby terenu jest przybliżeniem, podobnie jak w HFTA. Najmniej pewna jest dla anten zawieszonych bardzo nisko (poniżej ~0,1 λ).
- Budynki wchodzą tylko do poprawki od terenu, jako przeszkody z dyfrakcją na krawędzi (od 30 m), a nie do obliczeń NEC. Najbliższy budynek z LoD1 stoi ok. 115 m od działki. Altany ROD są bliżej, ale to małe, niskie, przeważnie drewniane obiekty, więc też są liczone tylko jako przeszkody. Wysokości pochodzą z pomiaru lidarowego (LoD1 2024).
- NEC-2 nie uwzględnia drzew (są tylko w poprawce od otoczenia i przy doborze ułożenia drutu), masztów, odciągów, kabla przy antenie z balunem ani altany, strat w materiale elementów ani układów dopasowania (hairpin, gamma).
- NEC-2 nie modeluje izolacji drutu. Uwzględnia ją współczynnik skrócenia liczony z geometrii przewodu, bo producent DX-Wire go nie podaje. Zostaw 3–5% zapasu i dotnij analizatorem.
- Wymiary Yagi dobrano w NEC-2 dla rurek Ø 20 mm (15 m) i Ø 16 mm (10 m). Przed budową uwzględnij mocowania elementów do boomu.
- Hexbeam: wymiary 20–10 m z tabeli G3TXQ, 6 m przeskalowane z 10 m. Model liczy jedno pasmo naraz, bez drutów pozostałych pasm, dlatego driver jest domyślnie dostrajany do rezonansu.
- Quad Cubex: boki pętli z tabeli IIb instrukcji, drut Ø 1,6 mm (AWG 14; instrukcja nie podaje średnicy), boom i maszt pominięte. Z pętlami pozostałych pasm ich drivery są zamknięte 50 Ω, jak przy osobnych kablach albo przełączniku; transformatora MT-3 nie modeluję. Opcja 6 m nie jest liczona, bo instrukcja nie podaje wymiarów.
- A3S jest modelowana jako elementy pełnowymiarowe z 0,5 dB strat w trapach. Rozstaw elementów jest przybliżony.
- Azymuty kierunków DX są orientacyjne.

---

## Użycie lokalne

To jedna samodzielna strona. Wystarczy otworzyć `index.html` w przeglądarce. Do pobierania terenu dla promienia większego niż 3 km potrzebny jest internet.

Publikacja na GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.

### Przeniesienie na inną lokalizację

Współrzędne działki są w `index.html`:

- `SITE = {N: …, E: …}` to punkt w PUWG 1992 (x = północ, y = wschód),
- `TERRAIN_LINES` to wbudowane profile 3 km; po zmianie lokalizacji wybierz promień 5 km lub więcej, żeby pobrać świeże dane,
- tekst w nagłówku strony.

---

## Struktura repozytorium

```
index.html          symulator (HTML + JS; wbudowany nec2c.wasm w base64)
nec2c-wasm/         źródła nec2c i opis kompilacji do WebAssembly (GPL-3.0)
docs/               zrzuty ekranu do README
```

Kompilacja silnika opisana jest w `nec2c-wasm/BUILD-WASM.txt`: clang 18 z celem `wasm32-wasi`, `wasi-sysroot` 24, jedna zmiana w `main.c` (wyłączona obsługa sygnałów pod WASI).

---

## Licencja i źródła

- **Silnik NEC-2:** [nec2c](https://github.com/KJ7LNW/nec2c), autor Neoklis Kyriazis 5B4AZ, obecnie rozwijany przez KJ7LNW. Licencja **GPL-3.0**. Źródła użyte do kompilacji są w katalogu `nec2c-wasm/`.
- **Dane wysokościowe:** NMT © [Główny Urząd Geodezji i Kartografii](https://www.geoportal.gov.pl/).
- **Budynki:** modele 3D budynków LoD1 2024 © [GUGiK](https://www.geoportal.gov.pl/), licencja CC BY 4.0.
- **Kable:** tłumienie RF-7 według katalogu (2,0 dB/100 m przy 10 MHz). Dla RG-58 Flex przyjęto typowe wartości katalogowe.
- **Quad:** wymiary z instrukcji Cubex SkyMaster III (Cubex Co., Inc., rev. 05-06).
- **Dane drutów:** tabela przewodów [DX-Wire](https://www.dx-wire.de/).
- **Kod strony:** GPL-3.0, zgodnie z licencją wbudowanego silnika nec2c.

---

73 de **SQ9UM**

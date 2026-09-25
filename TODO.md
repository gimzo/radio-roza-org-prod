# Ručni zadaci

Stvari koje traže tvoju odluku, pristup računima ili stvarni uređaj — ostatak optimizacija je
odrađen u kodu (vidi git log).

## Sadržaj i računi

1. **CMS — regeneriraj varijante slika za starije uploade.** Noviji uploadi u Media kolekciji
   imaju small/medium/og varijante, stariji samo original. Kod sada koristi varijante s
   fallbackom na original, pa stare slike i dalje idu u punoj veličini. U Payload adminu ponovno
   spremi (ili re-uploadaj) starije slike.

2. **Default OG slika (1200×630).** Stranice bez vlastite slike (naslovnica, program, kontakt…)
   nemaju og:image pri dijeljenju na društvenim mrežama. Treba brendirana slika 1200×630 —
   stavi je u `static/images/og-default.png` i javi da je uvežem u Seo komponentu.

3. **Potvrdi kanonsku domenu.** U `svelte.config.js` (prerender.origin) i `static/robots.txt`
   postavljeno je `https://radio-roza.org` (bez www). Ako je kanonska verzija drukčija,
   promijeni na oba mjesta. Provjeri i redirect www → apex (na Cloudflareu je to
   Redirect Rule na zoni, `_redirects` pokriva samo statiku).

4. **CC BY-SA linija u footeru** — i dalje placeholder dok ekipa ne potvrdi licenciju.

5. **Google Search Console** — dodaj property i pošalji `https://radio-roza.org/sitemap.xml`.
   Dok si tamo, možeš prijaviti i RSS feed: `https://radio-roza.org/citaj-radio/rss.xml`.

## Cloudflare (postavke na zoni, ne iz repoa)

6. **Cache Rule za HTML — bez nje nema keša.** Cloudflare po defaultu kešira samo
   poznate statične ekstenzije; `.html` nije među njima, pa svaki posjet budi Pages
   funkciju i s njom CMS. Provjereno na trenutnom CF deployu: odgovor uopće nema
   `cf-cache-status`. Kad domena sjedne na zonu, dodaj Cache Rule koja pokriva
   stranice (sve osim statike koju Pages ionako poslužuje izravno):
   - _Eligible for cache_: Yes
   - _Edge TTL_: "Use cache-control header if present" — kod šalje
     `Cloudflare-CDN-Cache-Control` po ruti (300 s naslovnica, Čitaj radio i članci;
     1800 s emisije, tagovi, arhiva i pretraga; 3600 s sitemap i RSS), svugdje uz
     `stale-while-revalidate` koji Cloudflare poštuje.
   - _Browser TTL_: "Respect origin" — kod šalje `Cache-Control: max-age=60`.

   Provjeri i da je **Origin Cache Control** uključen na zoni, inače se ti headeri
   ignoriraju. Cloudflare upozorava da keširanje na Pages custom domeni zna doći u
   sukob s Pages redirectima — ako se nešto čudno ponaša, suzi pravilo na konkretne
   putanje.

7. **Runtime env varijable.** `LISTENNOTES_API_KEY` mora biti pod Settings →
   Environment variables za **Production** _i_ **Preview**, inače deploy preview
   tiho vraća prazan popis epizoda. Provjereno da na trenutnom deployu radi.

## Provjere nakon deploya

8. **Cloudflare cache radi:** otvori članak dvaput i pogledaj response header
   `cf-cache-status` — drugi put treba pisati HIT (ili UPDATING dok traje SWR).
   Isto za `/emisije/<slug>`. Ako headera uopće nema, Cache Rule iz točke 6
   nije postavljena.

9. **Prerender radi:** `/kontakt`, `/emisije` i `o-nama/*` više se ne renderiraju kroz funkciju
   nego kao statične datoteke — u `_routes.json` moraju biti pod `exclude`.

10. **Player na stvarnom uređaju.** Player na Safariju/iOS-u koristi nativni HLS (ne skida
    hls.js uopće), a na ostalim preglednicima hls.js se učitava tek na prvi klik play.
    Provjeri: play/pause/lock-screen na iPhoneu, te u Chrome/Firefox Network tabu da se hls.js
    chunk pojavi tek nakon klika.

11. **ListenNotes kvota** — CDN keširanje (30 min + SWR) bitno smanjuje potrošnju API poziva,
    ali baci oko na mjesečnu potrošnju na listennotes.com dashboardu.

12. **PWA instalacija.** Dodan je `manifest.webmanifest` + ikone (generirane iz logo.svg u
    `static/icons/`), pa se stranica na mobitelu može instalirati kao aplikacija ("Dodaj na
    početni zaslon"). Provjeri na stvarnom Androidu/iPhoneu da instalacija radi i da ti se
    ikone sviđaju — ako želiš drukčije, zamijeni PNG-ove u `static/icons/` i
    `static/apple-touch-icon.png` (192/512/512-maskable/180 px). Service workera namjerno
    nema — radio ionako ne radi offline, a stale cache zna raditi probleme.

13. **Pretraga na stvarnom sadržaju.** Novi botun (povećalo) u navigaciji otvara pretragu
    preko emisija, članaka i Mixcloud arhive (zadnjih 300 snimki). Prođi kroz par upita
    (dijakritici tipa "roza"/"roža" bi trebali raditi isto) i javi ako želiš drukčiji
    redoslijed grupa ili više rezultata po grupi.

14. **RSS feed radi:** `https://radio-roza.org/citaj-radio/rss.xml` — provjeri nakon deploya
    (npr. dodaj u neki RSS čitač). Link na feed je i u `<head>`u svih stranica.

## Odluka za kasnije

15. **Galerija studija na /o-nama.** Link „\* \* \* posjeti studio" vodio je na `#studio` koji ne
    postoji (galerija studija je zakomentirana dok ne stignu fotografije). Kad dobiješ fotke:
    odkomentiraj photo grid 2 i pripadajuće stilove (u istoj datoteci, označeni komentarom
    "TODO #15"), dodaj `id="studio"` i vrati link.

## Riješeno u kodu (za referencu)

- ~~Coveri emisija hostani na mar-com.hr~~ — svih 20 covera skinuto, konvertirano u webp
  (max 800px) u `static/images/shows/` i prespojeno u `shows.ts`. Vanjske ovisnosti više nema.
- ~~Nereferencirane datoteke u static/images/~~ — obrisane (`popi_cover_edit.png`, `2.png`,
  `3.png`, `kk_logo.png`, `mix.png`); u git povijesti su ako ikad zatrebaju.
- ~~ArticleGrid layout shift~~ — CSS stupci + outline linije, bez JS-a (varijanta C).

<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Lightbox from '$lib/components/Lightbox.svelte';
  import CtaSection from '$lib/components/CtaSection.svelte';
  import type { LightboxImage } from '$lib/components/Lightbox.svelte';

  // Mock gallery images — replace with CMS
  const gallery1: LightboxImage[] = Array.from({ length: 8 }, (_, i) => ({
    src: `/images/o-nama/roza-${i + 1}.jpg`,
    alt: `Fotografija ${i + 1}`,
  }));

  // const gallery2: LightboxImage[] = Array.from({ length: 8 }, (_, i) => ({
  //   src: '',
  //   alt: `Fotografija studija ${i + 9}`,
  // }));

  let lightboxImages: LightboxImage[] = $state([]);
  let lightboxIndex = $state(0);
  let lightboxOpen = $state(false);

  function openLightbox(images: LightboxImage[], index: number) {
    lightboxImages = images;
    lightboxIndex = index;
    lightboxOpen = true;
  }
</script>

<svelte:head>
  <title>O nama — Radio Roža</title>
  <meta
    name="description"
    content="Tko je Radio Roža — community radio zajednice nastao iz ljubavi prema nezavisnoj sceni i gramofonskim pločama, sa studijem u riječkom OKC Palachu."
  />
</svelte:head>

<Lightbox
  images={lightboxImages}
  open={lightboxOpen}
  startIndex={lightboxIndex}
  onclose={() => (lightboxOpen = false)}
/>

<main class="page">
  <!-- ── Title + intro ── -->
  <PageHeader title="o nama" />

  <p class="intro-text">
    Radio Roža je community internet radio nastao iz želje i potrebe za praćenjem nezavisne kulturne
    scene i raznih kulturnih aktera u Rijeci, promocijom najrazličitijih (underground) žanrova, te
    ljubavi prema gramofonskim pločama.
  </p>

  <!-- ── Photo grid 1 ── -->
  <div class="photo-grid photo-grid--portrait" aria-label="Galerija fotografija studija">
    {#each gallery1 as image, i (i)}
      <button
        class="photo-item"
        onclick={() => openLightbox(gallery1, i)}
        aria-label="Otvori fotografiju: {image.alt}"
      >
        {#if image.src}
          <img src={image.src} alt={image.alt} class="photo-img" loading="lazy" decoding="async" />
        {:else}
          <div class="photo-placeholder" aria-hidden="true"></div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- ── Kakav smo + gdje smo ── -->
  <section class="two-col-section">
    <div class="two-col-block">
      <h2 class="block-title">kakav smo mi radio</h2>
      <div class="block-text">
        <p>
          Osnovan od strane nekolicine prijatelja i entuzijasta ponaprije iz zabave, ali i revolta
          prema komercijalnim sadržajima, istodobno se počelo djelovati kao internet radio, ali i
          kao grupa selektora koja s vinila vrti mahom ex yu funk, disco, rock, uz poneki izlet u
          reggae, dub, gipsy i mnoge druge vode. Ubrzo su uslijedili nastupi po riječkim klubovima,
          ulicama, sajmovima i kinima, nekoliko festivala u regiji – Komšilook (Rijeka), Velvet
          festival (Krk), Trk u šumu (Platak), pa čak i u Domu za starije i nemoćne osobe Mali
          Kartec – Krk.
        </p>
        <p>
          Uz nastupe, počeli su se organizirati i prijenosi uživo s raznih koncerata i nastupa, te
          se polako razvijala potreba za prostorom za rad i stvaranjem radija zajednice. Nakon
          prijave i dobivanja projekta „Žiroskop - Civilno-javno partnerstvo u upravljanju
          prostorima kulture u Rijeci“ Radio Roža službeno postaje radio zajednice u sklopu Udruge
          Ri Rock, a zajedno s partnerima na projektu – Drugo More, Filmaktiv, Prostor +, Savez
          udruga Molekula i Grad Rijeka, započelo je novo poglavlje djelovanja gdje će glavna zadaća
          biti pratiti i stvarati sadržaj u prostorima Palacha, Filodrammatice i HKD-a na Sušaku.
        </p>
      </div>
    </div>

    <div class="two-col-block">
      <h2 class="block-title">gdje se nalazi naš studio</h2>
      <div class="block-text">
        <p>
          Radio svoj dom dobiva u Omladinskom kulturnom centru Palach, te od siječnja 2019. godine
          započinje s uređenjem i opremanjem prostora koji će služiti kao radio zajednice,
          promovirajući razne bendove, izvođače, selektore i druge umjetnike koji djeluju ili
          gostuju u Rijeci.
        </p>
      </div>
      <!-- Cilja galeriju studija (photo grid 2) koja je zakomentirana dok ne stignu
           fotografije — vrati zajedno s njom i dodaj id="studio" na sekciju -->
      <!-- <a href="#studio" class="studio-link">* * * posjeti studio</a> -->
    </div>
  </section>

  <!-- ── Photo grid 2 ── -->
  <!-- <div class="photo-grid photo-grid--landscape" aria-label="Galerija fotografija ekipe">
    {#each gallery2 as image, i (i)}
      <button
        class="photo-item"
        onclick={() => openLightbox(gallery2, i)}
        aria-label="Otvori fotografiju: {image.alt}"
      >
        {#if image.src}
          <img src={image.src} alt={image.alt} class="photo-img" loading="lazy" decoding="async" />
        {:else}
          <div class="photo-placeholder" aria-hidden="true"></div>
        {/if}
      </button>
    {/each}
  </div> -->

  <!-- ── Crew / Projekti ── -->
  <section class="link-section">
    <div class="link-block">
      <h2 class="block-title"><a href="/o-nama/crew">→→→ crew</a></h2>
      <p class="block-body">
        Upoznaj ekipu radija. Selektori, novinari, tehničari, informatičari... Svatko ima svoju
        ulogu, često i više njih. Jesmo li već negdje spomenuli da nam se možeš pridružiti i ti?
      </p>
    </div>

    <div class="link-block">
      <h2 class="block-title"><a href="/o-nama/projekti">→→→ projekti</a></h2>
      <p class="block-body">
        Vidi kakve smo sve projekte provodili u ovom našem kratkom postojanju u suradnji s našim
        dragim partnerima!
      </p>
    </div>
  </section>
</main>

<!-- ── CTAs ── -->
<CtaSection />

<style>
  .page {
    padding: 1.5rem 1rem 4rem;
  }

  .intro-text {
    font-size: var(--text-body);
    font-weight: 400;
    line-height: 1.7;
    max-width: 600px;
    margin-bottom: 1rem;
  }

  /* ── Photo grids ── */
  .photo-grid {
    display: grid;
    gap: 2px;
    grid-template-columns: repeat(2, 1fr);
  }

  /* Stilovi za zakomentiranu galeriju studija (TODO #15) — odkomentiraj s markupom:
  .photo-grid--landscape {
    grid-template-columns: repeat(2, 1fr);
  }

  .photo-grid--landscape .photo-placeholder {
    aspect-ratio: 4 / 3;
  }

  .studio-link {
    font-family: var(--font-mono);
    font-size: var(--text-meta);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-black);
    text-decoration: none;
    margin-top: auto;
  }

  .studio-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  */

  .photo-item {
    display: block;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
    cursor: zoom-in;
    width: 100%;
    overflow: hidden;
  }

  .photo-item:focus-visible {
    outline: 3px solid var(--color-brand);
    outline-offset: -3px;
    z-index: 1;
    position: relative;
  }

  .photo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .photo-placeholder {
    background: rgb(0 0 0 / 0.08);
    aspect-ratio: 3 / 4;
    width: 100%;
    transition: background 0.2s;
  }

  .photo-item:hover .photo-placeholder {
    background: rgb(0 0 0 / 0.13);
  }

  /* ── Two-col section ── */
  .two-col-section {
    display: grid;
    grid-template-columns: 1fr;
    padding: 0 1rem;
    margin: 3rem 0;
  }

  .two-col-block {
    padding: 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .block-title {
    font-family: var(--font-display);
    font-size: var(--text-title);
    font-weight: 400;
    line-height: 1;
  }

  .link-block .block-title {
    font-size: var(--text-display);
  }

  .block-title a {
    text-decoration: none;
    color: inherit;
  }

  .block-title a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .block-text {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .block-text p,
  .block-body {
    font-size: var(--text-body);
    line-height: 2;
  }

  /* ── Link section (crew / projekti) ── */
  .link-section {
    display: grid;
    grid-template-columns: 1fr;
    padding: 0 1rem;
    margin-bottom: 3rem;
  }

  .link-block {
    padding: 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-bottom: 2px solid var(--color-black, #000);
  }

  /* ── Tablet (640px+) ── */
  @media (min-width: 640px) {
    .page {
      padding: 2rem 1.5rem 5rem;
    }

    .photo-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .two-col-section {
      grid-template-columns: 1fr 1fr;
      padding: 0 1.5rem;
      gap: 2rem;
      margin: 4rem 0;
    }

    .link-section {
      grid-template-columns: repeat(2, 1fr);
      padding: 1.5rem;
      margin-bottom: 4rem;
    }

    .link-block {
      border-bottom: none;
      padding: 1.5rem;
    }

    .link-block:not(:last-child) {
      border-right: 2px solid var(--color-black, #000);
    }
  }

  /* ── Desktop (1024px+) ── */
  @media (min-width: 1024px) {
    .page {
      padding: 2.5rem 2rem 6rem;
    }

    .two-col-section {
      padding: 0 2rem;
      gap: 3rem;
      margin: 5rem 0;
    }

    .link-section {
      padding: 2rem;
      margin-bottom: 5rem;
    }

    .link-block {
      padding: 2rem;
    }
  }

  /* ── Big Desktop (1600x+) ── */
  @media (min-width: 1600px) {
    .link-block {
      padding: 3rem;
    }
  }
</style>

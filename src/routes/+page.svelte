<script lang="ts" module>
  import type { PageData } from './$types';

  type CitajData = Awaited<PageData['citaj']>;

  interface Show {
    href: string;
    title: string;
    date: string;
    image?: string;
    tags: string[];
    mixcloudKey: string;
  }

  interface MixcloudCloudcast {
    key: string;
    url: string;
    name: string;
    created_time: string;
    pictures: { extra_large?: string; '640wx640h'?: string; large?: string };
    tags: Array<{ name: string }>;
  }

  // Survives client-side navigations — returning to the homepage renders the
  // last result instantly (refreshed in the background) instead of flashing
  // skeletons while Mixcloud answers again.
  let cachedShows: Show[] | null = null;

  // Isti trik za CMS postove: dok streamani promise iz loada ne stigne,
  // povratak na naslovnicu prikaže zadnji rezultat umjesto skeletona.
  let cachedCitaj = $state<CitajData | null>(null);
</script>

<script lang="ts">
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import ArticleCardSkeleton from '$lib/components/ArticleCardSkeleton.svelte';
  import ArticleGrid from '$lib/components/ArticleGrid.svelte';
  import ShowsGrid from '$lib/components/ShowsGrid.svelte';
  import ShowCard from '$lib/components/ShowCard.svelte';
  import ShowCardSkeleton from '$lib/components/ShowCardSkeleton.svelte';
  import SeeAll from '$lib/components/SeeAll.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import CtaSection from '$lib/components/CtaSection.svelte';
  import JsonLd from '$lib/components/JsonLd.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import {
    program,
    airsOn,
    currentEntry,
    durationLabel,
    isInsert,
    showInfo,
    upcomingEntries,
  } from '$lib/utils/program';
  import { stationWeekday, stationMinutes } from '$lib/utils/time';

  let { data }: { data: PageData } = $props();

  // --- Mixcloud shows (client-side fetch, so the CDN-cached HTML stays fresh) ---
  // 16 pokriva i najširi raspored ShowsGrida (8 stupaca × 2 reda)
  const SKELETON_COUNT = 16;
  const skeletonItems = Array.from({ length: SKELETON_COUNT }, (_, i) => ({
    href: `__skeleton__${i}`,
  }));

  let shows = $state<Show[]>(cachedShows ?? []);
  let showsLoading = $state(cachedShows === null);

  $effect(() => {
    fetch('https://api.mixcloud.com/RadioRoza/cloudcasts/?limit=16&metadata=1')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: { data: MixcloudCloudcast[] }) => {
        cachedShows = json.data.map((c) => ({
          href: c.url,
          title: c.name,
          date: new Date(c.created_time).toLocaleDateString('hr-HR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          image: c.pictures['640wx640h'] ?? c.pictures.extra_large ?? c.pictures.large,
          tags: c.tags.slice(0, 3).map((t) => t.name),
          mixcloudKey: c.key,
        }));
        shows = cachedShows;
      })
      .catch(() => {
        if (!cachedShows) shows = [];
      })
      .finally(() => {
        showsLoading = false;
      });
  });

  // --- Program danas ---
  let now = $state(new Date());

  $effect(() => {
    if (!browser) return;
    const id = setInterval(() => {
      now = new Date();
    }, 60_000);
    return () => clearInterval(id);
  });

  const today = $derived(stationWeekday(now));
  const currentTime = $derived(stationMinutes(now));

  const todayShows = $derived(
    program.filter((s) => airsOn(s, now)).sort((a, b) => a.show_start.localeCompare(b.show_start))
  );

  const currentShow = $derived(currentEntry(todayShows, currentTime));

  // Uvijek 6 redaka: lista se prelijeva na iduće dane, bez oznake dana.
  const programPreview = $derived(
    [...(currentShow ? [currentShow] : []), ...upcomingEntries(now, 6)].slice(0, 6)
  );

  // --- Čitaj radio (streamano iz +page.server.ts pri klijentskoj navigaciji) ---
  const citajSkeletonItems = Array.from({ length: 8 }, (_, i) => ({
    href: `__citaj_skeleton__${i}`,
  }));

  $effect(() => {
    Promise.resolve(data.citaj).then((citaj) => {
      cachedCitaj = citaj;
    });
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://api.mixcloud.com" />
  <link rel="preconnect" href="https://thumbnailer.mixcloud.com" />
</svelte:head>

<Seo
  title="Radio Roža"
  description="Nezavisna riječka internetska radio stanica — community radio iz Rijeke. Emisije, program i glazba koju ne biraju algoritmi."
/>

<JsonLd
  data={{
    '@context': 'https://schema.org',
    '@type': 'RadioStation',
    name: 'Radio Roža',
    url: page.url.origin,
    logo: `${page.url.origin}/logo.svg`,
    description:
      'Nezavisna riječka internetska radio stanica — community radio iz Rijeke. Emisije, program i glazba koju ne biraju algoritmi.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kružna ulica 6',
      addressLocality: 'Rijeka',
      addressCountry: 'HR',
    },
    sameAs: [
      'https://facebook.com/radiorozha',
      'https://www.instagram.com/radio.rozari/',
      'https://www.mixcloud.com/RadioRoza/',
      'https://youtube.com/@radioroza9811',
    ],
  }}
/>

<!-- ── novo novo novo ─────────────────────────────── -->
<section class="home-section">
  <div class="section-header">
    <h2 class="section-title">novo novo novo</h2>
  </div>
  <ShowsGrid items={showsLoading ? skeletonItems : shows}>
    {#snippet card(item)}
      {#if showsLoading}
        <ShowCardSkeleton />
      {:else}
        <ShowCard {...item as Show} />
      {/if}
    {/snippet}
  </ShowsGrid>
  <div class="section-link">
    <SeeAll href="/arhiva" label="Vidi cijelu arhivu" />
  </div>
</section>

<!-- ── program danas + čitaj radio ───────────────── -->
<div class="mid-section">
  <!-- Program danas -->
  <section class="mid-col mid-col--program">
    <div class="section-header">
      <h2 class="section-title">program danas</h2>
    </div>
    <p class="section-note">vremena su okvirna</p>

    <ul class="program-list">
      {#each programPreview as show (show.day + show.show_start + show.title)}
        {@const isNow = show === currentShow}
        {@const info = showInfo(show)}
        <li class="program-row" class:is-now={isNow}>
          <span class="program-time">{show.show_start}</span>
          <div class="program-info">
            <span class="program-name">{show.title}</span>
            {#if isInsert(show)}
              <span class="program-meta">emisija · {durationLabel(show)}</span>
            {/if}
            {#if info}
              <p class="program-desc">{info.description}</p>
              <div class="program-tags">
                {#each info.tags as tag (tag)}
                  <Tag label={tag} />
                {/each}
              </div>
            {/if}
          </div>
          {#if isNow}
            <span class="now-badge">sada</span>
          {/if}
        </li>
      {/each}
    </ul>
    <div class="section-link">
      <SeeAll href="/program" label="Pogledaj cijeli program" />
    </div>
  </section>

  <!-- Čitaj radio preview -->
  {#snippet citajPreview(citaj: CitajData)}
    {#if citaj.albumTjedna}
      {@const albumTjedna = citaj.albumTjedna}
      <a href={albumTjedna.href} class="album-card">
        {#if albumTjedna.image}
          <img
            src={albumTjedna.image}
            alt={albumTjedna.title}
            class="album-image"
            loading="lazy"
            decoding="async"
          />
        {/if}
        <div class="album-body">
          <p class="album-meta">
            {albumTjedna.date}
          </p>
          <h3 class="album-title">{albumTjedna.title}</h3>
          {#if albumTjedna.author}
            <p class="album-meta">{albumTjedna.author}</p>
          {/if}
          {#if albumTjedna.excerpt}
            <p class="album-excerpt">{albumTjedna.excerpt}</p>
          {/if}
          <div class="album-tag">
            <Tag label="album tjedna" color="red" />
          </div>
        </div>
      </a>
    {/if}

    <ArticleGrid items={citaj.previewPosts} maxCols={4} class="citaj-grid">
      {#snippet card(item)}
        <ArticleCard {...item} />
      {/snippet}
    </ArticleGrid>
  {/snippet}

  <section class="mid-col mid-col--citaj">
    <div class="section-header">
      <h2 class="section-title">čitaj radio</h2>
    </div>

    {#await data.citaj}
      {#if cachedCitaj}
        {@render citajPreview(cachedCitaj)}
      {:else}
        <div class="album-skeleton" aria-hidden="true">
          <div class="album-skeleton-image"></div>
          <div class="album-skeleton-body">
            <div class="skeleton-line skeleton-line--meta"></div>
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="skeleton-line"></div>
          </div>
        </div>
        <ArticleGrid items={citajSkeletonItems} maxCols={4} class="citaj-grid">
          {#snippet card(item)}
            <ArticleCardSkeleton />
          {/snippet}
        </ArticleGrid>
      {/if}
    {:then citaj}
      {@render citajPreview(citaj)}
    {/await}

    <div class="section-link">
      <SeeAll href="/citaj-radio" label="Pročitaj radio" />
    </div>
  </section>
</div>

<!-- ── najbolje iz arhive ─────────────────────────── -->
<!-- <section class="home-section">
  <div class="section-header">
    <h2 class="section-title">najbolje iz arhive</h2>
  </div>
  <ArticleGrid items={archiveArticles}>
    {#snippet card(item)}
      <ArticleCard {...item} />
    {/snippet}
  </ArticleGrid>
  <div class="section-link">
    <SeeAll href="/citaj-radio" label="Vidi sve iz arhive" />
  </div>
</section> -->

<!-- ── CTAs ───────────────────────────────────────── -->
<CtaSection />

<style>
  /* ── Shared section styles ── */
  .home-section {
    padding: 0 1rem;
    margin-bottom: 3rem;
  }

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.5rem;
    margin-bottom: 0;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: var(--text-display);
    font-weight: 400;
    line-height: 1;
  }

  .section-note {
    font-family: var(--font-mono);
    font-size: var(--text-meta);
    color: rgb(0 0 0 / 0.55);
    padding-bottom: 0.5rem;
  }

  .section-link {
    margin: 0.75rem 0;
  }

  /* ── Mid section (program danas + čitaj radio) ── */
  .mid-section {
    display: grid;
    grid-template-columns: 1fr;
    margin-bottom: 3rem;
    padding: 0 1rem;
  }

  .mid-col--program {
    margin-bottom: 3rem;
  }

  .mid-col--citaj {
    container-type: inline-size;
  }

  /* Server šalje do 8 članaka, a broj stupaca raste sa širinom kolone
     (auto-fill, min 18em, najviše 4). Dva pravila po rasponu drže mrežu punom:

     1. gornja granica broja kartica da zadnji red bude pun — 1–2 stupca → 4,
        3 stupca → 6, 4 stupca → 8;
     2. rez nepotpunog zadnjeg reda kad CMS vrati manje članaka (npr. 6 u 4
        stupca): prva kartica reda koja je među zadnjih (stupci − 1) znači da
        joj je red krnj, pa nestaje ona i sve iza nje. :first-child je izuzet
        da jedini, nepotpun red ne nestane cijeli.

     Skrivene kartice ostaju u DOM-u (i u SSR HTML-u), ali bez okvira ne
     povlače slike jer su lazy. */
  @container (width < 54em) {
    :global(.citaj-grid > :nth-child(n + 5)) {
      display: none;
    }
  }

  @container (36em <= width < 54em) {
    :global(.citaj-grid > :nth-child(2n + 1):not(:first-child):nth-last-child(-n + 1)),
    :global(.citaj-grid > :nth-child(2n + 1):not(:first-child):nth-last-child(-n + 1) ~ *) {
      display: none;
    }
  }

  @container (54em <= width < 72em) {
    :global(.citaj-grid > :nth-child(n + 7)),
    :global(.citaj-grid > :nth-child(3n + 1):not(:first-child):nth-last-child(-n + 2)),
    :global(.citaj-grid > :nth-child(3n + 1):not(:first-child):nth-last-child(-n + 2) ~ *) {
      display: none;
    }
  }

  @container (width >= 72em) {
    :global(.citaj-grid > :nth-child(4n + 1):not(:first-child):nth-last-child(-n + 3)),
    :global(.citaj-grid > :nth-child(4n + 1):not(:first-child):nth-last-child(-n + 3) ~ *) {
      display: none;
    }
  }

  /* Program list */
  .program-list {
    list-style: none;
  }

  .program-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 2px solid black;
  }

  .program-time {
    font-family: var(--font-display);
    font-size: var(--text-title);
    flex-shrink: 0;
    line-height: 1.2;
    width: 2.5em;
  }

  .program-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .program-name {
    font-family: var(--font-display);
    font-size: var(--text-title);
    line-height: 1.2;
  }

  .program-meta {
    font-family: var(--font-mono);
    font-size: var(--text-meta);
    color: rgb(0 0 0 / 0.55);
  }

  .program-desc {
    font-size: var(--text-body);
    line-height: 1.5;
    display: none;
  }

  .program-tags {
    display: none;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .now-badge {
    font-family: var(--font-mono);
    font-size: var(--text-meta);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-brand);
    flex-shrink: 0;
    padding-top: 0.15em;
  }

  .program-row.is-now .program-name {
    color: var(--color-brand);
  }

  .album-card {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    border-bottom: 2px solid var(--color-black);
    padding: 12px;
    background-color: white;
  }

  .album-image {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
    margin-bottom: 0.75rem;
    flex-shrink: 0;
  }

  @container (min-width: 400px) {
    .album-card {
      flex-direction: row;
      align-items: flex-start;
      gap: 1rem;
    }

    .album-image {
      width: 45%;
      margin-bottom: 0;
    }
  }

  .album-body {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
    height: stretch;
  }

  .album-title {
    font-family: var(--font-display);
    font-size: var(--text-title);
    font-weight: 400;
    line-height: 1.2;
  }

  .album-card:hover .album-title {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .album-meta {
    font-family: var(--font-mono);
    font-size: var(--text-meta);
    font-weight: 700;
  }

  .album-excerpt {
    font-size: var(--text-body);
    line-height: 1.5;
  }

  .album-tag {
    margin-top: auto;
  }

  /* Skeleton varijanta album kartice — dimenzije prate .album-card. */
  .album-skeleton {
    display: flex;
    flex-direction: column;
    border-bottom: 2px solid var(--color-black);
    padding: 12px;
    background-color: white;
  }

  .album-skeleton-image {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
    margin-bottom: 0.75rem;
  }

  .album-skeleton-body {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
  }

  .skeleton-line {
    border-radius: 2px;
    height: var(--text-body, 1rem);
    width: 100%;
  }

  .skeleton-line--meta {
    height: var(--text-meta, 0.75rem);
    width: 5rem;
  }

  .skeleton-line--title {
    height: var(--text-title, 1.25rem);
    width: 80%;
  }

  .skeleton-line,
  .album-skeleton-image {
    background: linear-gradient(
      90deg,
      rgb(0 0 0 / 0.08) 25%,
      rgb(0 0 0 / 0.14) 50%,
      rgb(0 0 0 / 0.08) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
  }

  @container (min-width: 400px) {
    .album-skeleton {
      flex-direction: row;
      align-items: flex-start;
      gap: 1rem;
    }

    .album-skeleton-image {
      width: 45%;
      margin-bottom: 0;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* ── Tablet (640px+) ── */
  @media (min-width: 640px) {
    .home-section {
      padding: 0 1.5rem;
      margin-bottom: 4rem;
    }

    .program-desc {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      overflow: hidden;
    }

    .program-tags {
      display: flex;
    }
  }

  /* ── Desktop (1024px+) ── */
  @media (min-width: 1024px) {
    .home-section {
      padding: 0 2rem;
      margin-bottom: 5rem;
    }

    /* Program + čitaj radio side by side */
    .mid-section {
      grid-template-columns: minmax(0, 32em) 1fr;
      margin-bottom: 5rem;
      padding: 0 2rem;
    }

    .mid-col--program {
      margin-bottom: 0;
      border-right: 2px solid black;
    }

    .program-row {
      padding-right: 2rem;
    }

    .mid-col--citaj .section-header,
    .mid-col--citaj .section-link {
      padding-left: 12px;
    }

    .mid-col .section-header {
      border-bottom: none;
      border-top: none;
      padding-top: 1rem;
    }
  }
</style>

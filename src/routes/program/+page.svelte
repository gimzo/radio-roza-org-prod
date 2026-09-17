<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import {
    program,
    airsOn,
    authorsLabel,
    currentEntry,
    durationLabel,
    isInsert,
    showInfo,
    type Day,
    type Show,
  } from '$lib/utils/program';
  import {
    DAYS_ORDER,
    stationWeekday,
    stationMinutes,
    stationWeekDates,
    stationWeekDateLabels,
  } from '$lib/utils/time';
  import Seo from '$lib/components/Seo.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import { browser } from '$app/environment';
  import { downloadShowIcs } from '$lib/utils/ics';
  import { tagChips } from '$lib/data/tags';
  import ScrollTopButton from '$lib/components/ScrollTopButton.svelte';

  const DAY_NAMES_HR: Record<Day, string> = {
    Monday: 'ponedjeljak',
    Tuesday: 'utorak',
    Wednesday: 'srijeda',
    Thursday: 'četvrtak',
    Friday: 'petak',
    Saturday: 'subota',
    Sunday: 'nedjelja',
  };

  const weekDates = stationWeekDateLabels();
  const weekDays = stationWeekDates();

  // Ide li emisija ovaj tjedan — povremene emisije neke tjedne preskaču
  const airsThisWeek = (show: Show) => airsOn(show, weekDays[show.day]);

  // Group shows by day, sorted by start time; u istom terminu prvo ona koja ide ovaj tjedan
  const showsByDay = Object.fromEntries(
    DAYS_ORDER.map((day) => [
      day,
      program
        .filter((s) => s.day === day)
        .sort(
          (a, b) =>
            a.show_start.localeCompare(b.show_start) ||
            Number(airsThisWeek(b)) - Number(airsThisWeek(a))
        ),
    ])
  ) as Record<Day, typeof program>;

  function frequencyLabel(show: Show): string | null {
    const f = show.frequency;
    if (!f) return null;
    if (f.type === 'biweekly') return 'svaki drugi tjedan';
    const weeks = f.weeks.map((w) => (w === -1 ? 'zadnji' : `${w}.`)).join(' i ');
    return `${weeks} ${DAY_NAMES_HR[show.day]} u mjesecu`;
  }

  // "emisija · 15 min · svaki drugi tjedan" — blokovi bez oznake osim učestalosti
  function metaLabel(show: Show): string {
    const parts = isInsert(show) ? ['emisija', durationLabel(show)] : [];
    return [...parts, frequencyLabel(show)].filter(Boolean).join(' · ');
  }

  // --- trenutna emisija ---
  let now = $state(new Date());

  $effect(() => {
    const id = setInterval(() => {
      now = new Date();
    }, 60_000);
    return () => clearInterval(id);
  });

  const today = $derived(stationWeekday(now));
  const currentTime = $derived(stationMinutes(now));

  // Samo u pregledniku — SSR HTML se kešira pa bi zapečena "sada" oznaka
  // vrlo brzo postala kriva; nakon hidratacije računa se iz stvarnog vremena.
  const currentShow = $derived(
    browser
      ? currentEntry(
          showsByDay[today].filter((s) => airsOn(s, now)),
          currentTime
        )
      : null
  );

  function scrollToNow() {
    const row = currentShow ? document.getElementById('trenutno') : null;
    if (row) {
      // center: uz tekuću emisiju vidi se i što je bilo prije / što slijedi
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // prije prve emisije dana — na vrh današnje sekcije
      const section = document.getElementById(today.toLowerCase());
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Dropdown
  let detailsEl: HTMLDetailsElement | undefined = $state();

  function onDayClick() {
    if (detailsEl) detailsEl.open = false;
  }
</script>

<Seo
  title="Program — Radio Roža"
  description="Tjedni raspored emisija Radio Rože — što je danas u eteru i što slijedi."
/>

<main class="page">
  <PageHeader title="program">
    <div class="header-actions">
      <button class="now-btn" onclick={scrollToNow}>trenutno</button>

      <details class="pick-date" bind:this={detailsEl}>
        <summary class="pick-date-btn">odaberi dan</summary>
        <ul class="day-dropdown">
          {#each DAYS_ORDER as day (day)}
            <li>
              <a href="#{day.toLowerCase()}" onclick={onDayClick}>
                <span class="dropdown-day">{DAY_NAMES_HR[day]}</span>
                <span class="dropdown-date">{weekDates[day]}</span>
              </a>
            </li>
          {/each}
        </ul>
      </details>
    </div>
  </PageHeader>

  <div class="content">
    {#each DAYS_ORDER as day (day)}
      <section
        class="day-section"
        id={day.toLowerCase()}
        aria-current={day === today ? 'true' : undefined}
      >
        <div class="day-header">
          <h2 class="day-name">
            {DAY_NAMES_HR[day]}<span class="day-date">{weekDates[day]}</span>
          </h2>
        </div>

        <ul class="show-list">
          {#each showsByDay[day] as show (show.title + show.show_start)}
            {@const info = showInfo(show)}
            {@const isNow = show === currentShow}
            {@const meta = metaLabel(show)}
            {@const authors = authorsLabel(show)}
            {@const isOff = !airsThisWeek(show)}
            <li
              class="show-row"
              class:is-now={isNow}
              class:is-off={isOff}
              class:is-insert={isInsert(show)}
              id={isNow ? 'trenutno' : undefined}
            >
              <span class="show-time">{show.show_start}</span>
              <div class="show-info">
                <h3 class="show-title">
                  {#if show.href}
                    <a href={show.href}>{show.title}</a>
                  {:else}
                    {show.title}
                  {/if}
                </h3>
                {#if meta}
                  <p class="show-meta">
                    {meta}{#if isOff}<span class="show-off">{' · ne ide ovaj tjedan'}</span>{/if}
                  </p>
                {/if}
                {#if authors}
                  <p class="show-authors">{authors}</p>
                {/if}
                {#if info}
                  <p class="show-desc">{info.description}</p>
                  {@const blockChips = tagChips(info.tags)}
                  {#if blockChips.length > 0}
                    <div class="show-tags">
                      {#each blockChips as tag (tag.label)}
                        <Tag label={tag.label} href={tag.href} color="black" />
                      {/each}
                    </div>
                  {/if}
                {/if}
              </div>
              {#if isNow}
                <span class="now-badge">sada</span>
              {/if}
              <button
                class="cal-btn"
                onclick={() => downloadShowIcs(show)}
                aria-label="Dodaj u kalendar: {show.title}"
                title="Dodaj u kalendar"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  aria-hidden="true"
                >
                  <rect x="1.5" y="2.5" width="13" height="12" />
                  <line x1="1.5" y1="6" x2="14.5" y2="6" />
                  <line x1="5" y1="1" x2="5" y2="4" />
                  <line x1="11" y1="1" x2="11" y2="4" />
                  <line x1="8" y1="8.5" x2="8" y2="12.5" />
                  <line x1="6" y1="10.5" x2="10" y2="10.5" />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
</main>

<ScrollTopButton />

<style>
  .page {
    padding: 1.5rem 1rem 4rem;
    /* donji rub playera — Player.svelte mjeri stvarnu visinu bara (live mod može
       dodati status redak); fallback za SSR: 60px bar + 1px border */
    --stack-top: var(--player-offset, calc(var(--nav-offset, 70px) + 61px));
  }

  .content {
    max-width: 640px;
    margin-inline: auto;
    /* clip umjesto hidden: hidden bi pretvorio .content u scrollport i
       ubio position: sticky na day-headerima */
    overflow-x: hidden;
    overflow-x: clip;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .now-btn {
    font: inherit;
    font-weight: 600;
    color: var(--color-brand);
    background: none;
    border: 2px solid var(--color-brand);
    border-radius: 2em;
    padding: 0.5em 1em;
    cursor: pointer;
    white-space: nowrap;
  }

  .now-btn:hover {
    background: var(--color-brand);
    color: var(--color-bg);
  }

  /* pick a date — <details> */
  .pick-date {
    position: relative;
  }

  .pick-date-btn {
    background: none;
    border: 2px solid var(--color-black);
    font-weight: 600;
    border-radius: 2em;
    padding: 0.5em 1em;
    cursor: pointer;
    list-style: none;
    white-space: nowrap;
    user-select: none;
  }

  .pick-date-btn::-webkit-details-marker {
    display: none;
  }

  .day-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    /* iznad sticky day-headera (z-index 10, kasnije u DOM-u) */
    z-index: 20;
    list-style: none;
    background: var(--color-bg);
    border: 2px solid var(--color-black);
    min-width: 11rem;
  }

  .day-dropdown a {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5em 0.75em;
    text-decoration: none;
    color: var(--color-black);
    font-size: var(--text-body);
  }

  .day-dropdown a:hover {
    background: rgb(0 0 0 / 0.06);
  }

  .dropdown-day {
    text-transform: lowercase;
  }

  .dropdown-date {
    color: rgb(0 0 0 / 0.45);
  }

  /* Day section */
  .day-section {
    margin-top: 3rem;
    /* anchor skokovi moraju sletjeti ispod playera */
    scroll-margin-top: calc(var(--stack-top) + 0.5rem);
  }

  .day-header {
    position: sticky;
    top: var(--stack-top);
    transition: top 0.3s ease; /* prati animaciju skrivanja nava, kao player */
    z-index: 10;
    background: var(--color-bg);
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--color-black);
  }

  .day-name {
    font-family: var(--font-display);
    font-size: var(--text-display); /* clamp(1.75rem, 7vw, 5rem); */
    font-weight: 400;
    line-height: 1.1;
    display: flex;
    align-items: baseline;
    gap: 0.35em;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .day-date {
    font-family: var(--font-mono);
    font-size: clamp(0.875rem, 2vw, 1.5rem);
    font-weight: 400;
    color: rgb(0 0 0 / 0.45);
  }

  /* Highlight today */
  .day-section[aria-current='true'] .day-name {
    color: var(--color-brand);
  }

  /* Show list */
  .show-list {
    list-style: none;
  }

  .show-row {
    display: flex;
    gap: 1rem;
    padding: 0.875rem 0;
    border-bottom: 1px solid rgb(0 0 0 / 0.1);
  }

  .show-row.is-now .show-time,
  .show-row.is-now .show-title {
    color: var(--color-brand);
  }

  .now-badge {
    font-family: var(--font-mono);
    font-size: var(--text-meta);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-brand);
    flex-shrink: 0;
    padding-top: 0.3em;
  }

  .cal-btn {
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2em 0 0;
    color: rgb(0 0 0 / 0.35);
  }

  .cal-btn:hover,
  .cal-btn:focus-visible {
    color: var(--color-black);
  }

  .show-time {
    /*font-family: var(--font-mono);*/
    font-size: var(--text-card);
    /*color: rgb(0 0 0 / 0.45);*/
    flex-shrink: 0;
    width: 3.25em;
    white-space: nowrap;
    /*padding-top: 0.2em;*/
  }

  .show-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .show-title {
    font-family: var(--font-display);
    font-size: var(--text-card);
    font-weight: 400;
  }

  .show-title a {
    color: inherit;
    text-decoration: none;
  }

  .show-title a:hover {
    text-decoration: underline;
  }

  .show-meta,
  .show-authors {
    font-family: var(--font-mono);
    font-size: var(--text-meta);
    color: rgb(0 0 0 / 0.55);
  }

  /* emisije su kratki umetci preko bloka — opis s njihove stranice zna biti dug */
  .show-row.is-insert .show-desc {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .show-off {
    color: var(--color-brand);
  }

  .show-row.is-off .show-time,
  .show-row.is-off .show-title,
  .show-row.is-off .show-desc {
    opacity: 0.45;
  }

  .show-desc {
    font-size: var(--text-body);
    line-height: 1.5;
  }

  .show-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  /* Tablet+ */
  @media (min-width: 640px) {
    .page {
      padding: 2rem 1.5rem 5rem;
    }

    .show-row {
      gap: 2rem;
    }

    .show-time {
      width: 3.5em;
    }
  }

  /* Desktop */
  @media (min-width: 1024px) {
    .page {
      padding: 2.5rem 2rem 6rem;
    }

    .show-row {
      padding: 1rem 0;
    }
  }

  @media (min-width: 1400px) {
    .content {
      /* povuci kolonu gore, uz naslov (botuni su u redu s naslovom,
         pa header zauzima samo visinu naslova + 1rem paddinga) */
      margin-top: -9.5rem;
    }
  }
</style>

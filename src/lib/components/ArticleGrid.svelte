<script lang="ts" generics="T extends { href: string }">
  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    cardMinEm?: number;
    /** Gornja granica broja stupaca; bez nje auto-fill slaže koliko god stane. */
    maxCols?: number;
    class?: string;
    card: Snippet<[T]>;
  }

  let { items, cardMinEm = 18, maxCols, class: className, card }: Props = $props();

  // Uz maxCols minimalna širina staze ne smije pasti ispod 1/maxCols širine
  // mreže (gapovi odbijeni), pa auto-fill ne može složiti više stupaca od toga.
  const trackMin = $derived(
    maxCols
      ? `min(max(${cardMinEm}em, (100% - ${(maxCols - 1) * 2}px) / ${maxCols}), 100%)`
      : `min(${cardMinEm}em, 100%)`
  );
</script>

<div class={['article-grid', className]} style:--track-min={trackMin}>
  {#each items as item (item.href)}
    {@render card(item)}
  {/each}
</div>

<style>
  /* Stupce određuje CSS (auto-fill), pa SSR i klijent renderiraju isto —
     bez skoka nakon hidratacije. Linije crta 2px outline svake kartice:
     u 2px gapu susjedni se outlinei preklope u jednu liniju, vanjski rub
     odreže overflow, a prazan prostor nepotpunog zadnjeg reda ostaje boje
     pozadine, s uredno zatvorenim karticama. */
  .article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--track-min), 1fr));
    gap: 2px;
    overflow: hidden;
  }

  .article-grid > :global(*) {
    outline: 2px solid var(--color-black);
  }
</style>

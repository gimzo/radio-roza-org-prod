import type { PageServerLoad } from './$types';
import { canonicalTags, type TagKind } from '$lib/data/tags';
import { collectTagHits } from '$lib/utils/tagHits';

export interface TagIndexEntry {
  title: string;
  slug: string;
  hits: number;
}

export interface TagGroup {
  kind: TagKind;
  label: string;
  tags: TagIndexEntry[];
}

const GROUP_LABELS: Record<TagKind, string> = {
  genre: 'žanrovi',
  theme: 'teme',
  place: 'mjesta',
};

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  setHeaders({
    'Cache-Control': 'public, max-age=300',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
  });

  const hitMap = await collectTagHits(fetch);

  const groups: TagGroup[] = (['genre', 'theme', 'place'] as TagKind[]).map((kind) => ({
    kind,
    label: GROUP_LABELS[kind],
    tags: canonicalTags
      .filter((t) => t.kind === kind)
      .map((t) => {
        const h = hitMap.get(t.slug);
        return { title: t.title, slug: t.slug, hits: (h?.shows ?? 0) + (h?.articles ?? 0) };
      }),
  }));

  return { groups, filled: hitMap.size };
};

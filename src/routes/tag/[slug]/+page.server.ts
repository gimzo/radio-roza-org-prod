import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchPostsByTag, cardImageUrl } from '$lib/api/cms';
import { lexicalExcerpt } from '$lib/utils/lexical';
import { tagBySlug, normalizeTag } from '$lib/data/tags';
import { shows } from '$lib/data/shows';
import categoriesJson from '$lib/data/categories.json';

const categoryMap = new Map(
  categoriesJson.docs.map((c) => [c.id, { title: c.title, slug: c.slug }])
);

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
  const slug = params.slug;
  const canonical = tagBySlug(slug);

  setHeaders({
    'Cache-Control': 'public, max-age=60',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
  });

  // Emisije s ovim tagom (statični podaci, normalizirano po slugu).
  const showHits = shows
    .filter((s) => s.tags.some((t) => normalizeTag(t)?.slug === slug))
    .map((s) => ({ href: s.href, title: s.title, image: s.image, tags: s.tags }));

  // Članci s ovim tagom (CMS). Ako CMS padne — prazno, stranica preživi.
  let articles: Array<{
    href: string;
    title: string;
    date: string;
    author?: string;
    image?: string;
    excerpt: string;
    category?: string;
  }> = [];
  try {
    const { docs } = await fetchPostsByTag(fetch, slug, { limit: 24 });
    articles = docs.map((post) => {
      const rawCat = post.categories[0];
      const cat =
        rawCat === undefined
          ? undefined
          : typeof rawCat === 'number'
            ? categoryMap.get(rawCat)
            : { title: rawCat.title, slug: rawCat.slug };

      return {
        href: `/citaj-radio/${post.slug}`,
        title: post.title,
        date: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString('hr-HR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '',
        author: post.populatedAuthors[0]?.name ?? undefined,
        image: post.heroImage ? cardImageUrl(post.heroImage) : undefined,
        excerpt: lexicalExcerpt(post.content),
        category: cat?.title ?? undefined,
      };
    });
  } catch {
    articles = [];
  }

  // Nepoznat slug bez ijednog pogotka — 404. Kanonski tag uvijek postoji
  // (i kad je prazan), jer na njega vode chipovi po cijelom siteu.
  if (!canonical && showHits.length === 0 && articles.length === 0) {
    error(404, 'Tag nije pronađen');
  }

  return {
    slug,
    title: canonical?.title ?? slug,
    articles,
    shows: showHits,
  };
};

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import {
  fetchPostBySlug,
  fetchPostsByIds,
  cardImageUrl,
  focalPosition,
  heroAspectRatio,
  heroImageUrl,
  ogImageUrl,
} from '$lib/api/cms';
import type { CmsPost } from '$lib/api/cms';
import { lexicalToHtml, lexicalExcerpt, captionHtml } from '$lib/utils/lexical';
import categoriesJson from '$lib/data/categories.json';

const categoryMap = new Map(
  categoriesJson.docs.map((c) => [c.id, { title: c.title, slug: c.slug }])
);

function formatDate(iso: string | null | undefined): string {
  return iso
    ? new Date(iso).toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';
}

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
  const post = await fetchPostBySlug(fetch, params.slug);
  if (!post) error(404, 'Članak nije pronađen');

  // Set after the 404 check so missing slugs don't get cached on the CDN
  setHeaders({
    'Cache-Control': 'public, max-age=60',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
  });

  const date = formatDate(post.publishedAt);

  const cats = post.categories
    .map((rawCat) =>
      typeof rawCat === 'number'
        ? categoryMap.get(rawCat)
        : { title: rawCat.title, slug: rawCat.slug }
    )
    .filter(Boolean) as { title: string; slug: string }[];

  // Tagovi dolaze kao objekti (depth 2). Slug iz CMS-a je isti kao frontend
  // kanonski slug, pa vode izravno na /tag/[slug].
  const articleTags = (post.tags ?? [])
    .map((raw) => (typeof raw === 'number' ? null : { title: raw.title, slug: raw.slug }))
    .filter(Boolean) as { title: string; slug: string }[];

  // Redoslijed iz CMS-a; članci koje javni API ne vrati (npr. nacrti) ispadaju.
  // Ako dohvat padne, članak se prikazuje bez vezanih.
  const relatedIds = post.relatedPosts.map((r) => (typeof r === 'number' ? r : r.id));
  const relatedPosts = await fetchPostsByIds(fetch, relatedIds).catch(() => []);
  const relatedById = new Map(relatedPosts.map((r) => [r.id, r]));

  const related = relatedIds
    .map((id) => relatedById.get(id))
    .filter((r): r is CmsPost => r !== undefined)
    .map((r) => {
      const rawCat = r.categories[0];
      const cat = typeof rawCat === 'number' ? categoryMap.get(rawCat) : rawCat;
      return {
        href: `/citaj-radio/${r.slug}`,
        title: r.title,
        date: formatDate(r.publishedAt),
        author: r.populatedAuthors[0]?.name ?? undefined,
        image: r.heroImage ? cardImageUrl(r.heroImage) : undefined,
        excerpt: lexicalExcerpt(r.content),
        category: cat?.title ?? undefined,
      };
    });

  return {
    article: {
      title: post.title,
      date,
      publishedAt: post.publishedAt ?? undefined,
      updatedAt: post.updatedAt,
      author: post.populatedAuthors[0]?.name ?? undefined,
      image: post.heroImage ? heroImageUrl(post.heroImage) : undefined,
      imageAlt: post.heroImage?.alt ?? post.title,
      imageRatio: post.heroImage ? heroAspectRatio(post.heroImage) : undefined,
      imagePosition: post.heroImage ? focalPosition(post.heroImage) : undefined,
      imageCaption: captionHtml(post.heroImage?.caption),
      ogImage: post.heroImage ? ogImageUrl(post.heroImage) : undefined,
      excerpt: lexicalExcerpt(post.content, 160),
      categories: cats,
      tags: articleTags,
      contentHtml: lexicalToHtml(post.content),
    },
    related,
  };
};

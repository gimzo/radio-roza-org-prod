import { json } from '@sveltejs/kit';
import { fetchPosts } from '$lib/api/cms';
import { lexicalExcerpt } from '$lib/utils/lexical';

// Kompaktan popis članaka za client-side pretragu (CMS nema CORS za browser).
export async function GET({ fetch, setHeaders }) {
  setHeaders({
    'Cache-Control': 'public, max-age=300',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
  });

  try {
    // depth 2 da tagovi dođu kao objekti (za pretragu po tagu)
    const { docs } = await fetchPosts(fetch, { limit: 100, depth: 2 });
    return json({
      posts: docs.map((p) => ({
        href: `/citaj-radio/${p.slug}`,
        title: p.title,
        excerpt: lexicalExcerpt(p.content, 120),
        tags: (p.tags ?? [])
          .map((t) => (typeof t === 'object' && t ? t.title : ''))
          .filter(Boolean),
        date: p.publishedAt
          ? new Date(p.publishedAt).toLocaleDateString('hr-HR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '',
      })),
    });
  } catch {
    return json({ posts: [] }, { status: 503 });
  }
}

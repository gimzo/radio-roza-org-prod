import { fetchPosts } from '$lib/api/cms';
import { shows } from '$lib/data/shows';
import { collectTagHits, taggedSlugs } from '$lib/utils/tagHits';

export const prerender = false;

const STATIC_PATHS = [
  '/',
  '/arhiva',
  '/citaj-radio',
  '/program',
  '/emisije',
  '/kontakt',
  '/o-nama',
  '/o-nama/crew',
  '/o-nama/projekti',
  '/o-nama/projekti/17-bitnih',
  '/o-nama/projekti/digitalne-rozice',
  '/o-nama/projekti/inkluzivni-kotac',
  '/o-nama/projekti/korona-kid',
  '/o-nama/projekti/odasiljac',
  '/o-nama/projekti/odasiljac/nevidljive',
  '/o-nama/projekti/odasiljac/skolica',
  '/o-nama/projekti/odasiljac/sos',
  '/o-nama/projekti/ziroskop',
  '/tag',
];

export async function GET({ fetch, url, setHeaders }) {
  setHeaders({
    'Cache-Control': 'public, max-age=3600',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  });

  let articlePaths: string[] = [];
  try {
    const { docs } = await fetchPosts(fetch, { limit: 100 });
    articlePaths = docs.map((p) => `/citaj-radio/${p.slug}`);
  } catch {
    // CMS unreachable — ship the static part of the sitemap anyway
  }

  // Samo tagovi koji stvarno nešto vraćaju. Prazne tag stranice (rječnik ima 81
  // tag) nema smisla nuditi tražilicama.
  const tagPaths = taggedSlugs(await collectTagHits(fetch)).map((slug) => `/tag/${slug}`);

  const paths = [...STATIC_PATHS, ...shows.map((s) => s.href), ...articlePaths, ...tagPaths];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${url.origin}${p}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

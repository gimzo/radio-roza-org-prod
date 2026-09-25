import { fetchPosts, type CmsPost } from '$lib/api/cms';
import { lexicalExcerpt } from '$lib/utils/lexical';
import categoriesJson from '$lib/data/categories.json';

export const prerender = false;

const categoryMap = new Map(categoriesJson.docs.map((c) => [c.id, c.title]));

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function item(post: CmsPost, origin: string): string {
  const link = `${origin}/citaj-radio/${post.slug}`;
  const rawCat = post.categories[0];
  const category = typeof rawCat === 'number' ? categoryMap.get(rawCat) : rawCat?.title;
  const lines = [
    `    <item>`,
    `      <title>${esc(post.title)}</title>`,
    `      <link>${link}</link>`,
    `      <guid isPermaLink="true">${link}</guid>`,
  ];
  if (post.publishedAt) {
    lines.push(`      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`);
  }
  const excerpt = lexicalExcerpt(post.content);
  if (excerpt) lines.push(`      <description>${esc(excerpt)}</description>`);
  if (category) lines.push(`      <category>${esc(category)}</category>`);
  lines.push(`    </item>`);
  return lines.join('\n');
}

export async function GET({ fetch, url, setHeaders }) {
  setHeaders({
    'Cache-Control': 'public, max-age=3600',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  });

  let posts: CmsPost[] = [];
  try {
    const { docs } = await fetchPosts(fetch, { limit: 30 });
    posts = docs;
  } catch {
    // CMS nedostupan — objavi prazan kanal umjesto greške
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Čitaj radio — Radio Roža</title>
    <link>${url.origin}/citaj-radio</link>
    <atom:link href="${url.origin}/citaj-radio/rss.xml" rel="self" type="application/rss+xml" />
    <description>Članci, recenzije, komentari i album tjedna — pisana strana Radio Rože.</description>
    <language>hr</language>
${posts.map((p) => item(p, url.origin)).join('\n')}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

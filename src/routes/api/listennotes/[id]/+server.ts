import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

export async function GET({ params, url, setHeaders }) {
  // Čita se u runtimeu, ne pri buildu — build prolazi i bez ključa.
  const apiKey = env.LISTENNOTES_API_KEY;
  if (!apiKey) return json({ episodes: [], next_episode_pub_date: null });

  setHeaders({
    'Cache-Control': 'public, max-age=300',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
  });

  const cursor = url.searchParams.get('next_episode_pub_date');
  let apiUrl = `https://listen-api.listennotes.com/api/v2/podcasts/${params.id}?sort=recent_first`;
  if (cursor) apiUrl += `&next_episode_pub_date=${cursor}`;

  const res = await fetch(apiUrl, { headers: { 'X-ListenAPI-Key': apiKey } });

  if (!res.ok) return json({ error: true }, { status: res.status });

  const data = await res.json();
  return json({
    episodes: data.episodes ?? [],
    next_episode_pub_date: data.next_episode_pub_date ?? null,
  });
}

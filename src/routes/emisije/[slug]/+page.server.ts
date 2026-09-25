import { env } from '$env/dynamic/private';
import { shows } from '$lib/data/shows';

export async function load({ params, fetch, setHeaders }) {
  const show = shows.find((s) => s.href === `/emisije/${params.slug}`);

  if (!show?.listennotes_id) return {};

  // Čita se u runtimeu, ne pri buildu — bez ključa stranica radi, samo bez epizoda.
  const apiKey = env.LISTENNOTES_API_KEY;
  if (!apiKey) return {};

  // Episodes change weekly at most — long CDN cache also protects the
  // ListenNotes monthly request quota.
  setHeaders({
    'Cache-Control': 'public, max-age=300',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
  });

  const res = await fetch(
    `https://listen-api.listennotes.com/api/v2/podcasts/${show.listennotes_id}?sort=recent_first`,
    { headers: { 'X-ListenAPI-Key': apiKey } }
  );

  if (!res.ok) return {};

  const data = await res.json();
  return {
    lnEpisodes: data.episodes as LNEpisode[],
    lnNextCursor: (data.next_episode_pub_date ?? null) as number | null,
    lnPodcastId: show.listennotes_id,
  };
}

export interface LNEpisode {
  id: string;
  title: string;
  pub_date_ms: number;
  audio_length_sec: number;
  listennotes_url: string;
}

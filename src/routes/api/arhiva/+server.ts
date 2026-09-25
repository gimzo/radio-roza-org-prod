import { json } from '@sveltejs/kit';
import { fetchArchive } from '$lib/api/mixcloud';

// Kompaktan popis arhive za client-side pretragu — vidi $lib/api/mixcloud
// za razlog zašto preglednik ne razgovara s Mixcloudom izravno.
export async function GET({ fetch, setHeaders }) {
  setHeaders({
    'Cache-Control': 'public, max-age=300',
    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
  });

  try {
    return json({ archive: await fetchArchive(fetch) });
  } catch {
    // Mixcloud nedostupan — pretraga radi dalje s emisijama i člancima.
    return json({ archive: [] }, { status: 503 });
  }
}

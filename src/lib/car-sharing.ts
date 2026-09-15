import type { Metadata } from 'next';
import type { CarDestination } from './car-destination';

export const PUBLIC_SITE_URL = 'https://ghayrat.vercel.app';

export function getCarShareUrl(source: 'catalog' | 'auction' | 'our-cars', id: string, destination?: CarDestination): string {
  const url = new URL(`/${source}/${encodeURIComponent(id)}`, PUBLIC_SITE_URL);
  if (source === 'catalog' && (destination === 'russia' || destination === 'tajikistan')) {
    url.searchParams.set('destination', destination);
  }
  return url.href;
}

export function getCarShareLinks(title: string, url: string) {
  return {
    whatsapp: `https://wa.me/?${new URLSearchParams({ text: `${title}\n${url}` })}`,
    telegram: `https://t.me/share/url?${new URLSearchParams({ url, text: title })}`,
  };
}

export async function tryNativeCarShare(
  data: { title: string; url: string },
  share?: (data: { title: string; url: string }) => Promise<void>,
): Promise<'shared' | 'cancelled' | 'menu'> {
  if (!share) return 'menu';
  try {
    await share(data);
    return 'shared';
  } catch (error) {
    return error instanceof Error && error.name === 'AbortError' ? 'cancelled' : 'menu';
  }
}

export function getEncarShareImageUrl(photo?: string): string | undefined {
  if (!photo) return undefined;
  const image = photo.endsWith('_') ? `${photo}001.jpg` : photo;
  const pathname = image.startsWith('/carpicture/') ? image : `/carpicture${image.startsWith('/') ? image : `/${image}`}`;
  const params = new URLSearchParams({ impolicy: 'heightRate', rh: '900', cw: '1200', ch: '900', cg: 'Center',
    wtmk: 'https://ci.encar.com/wt_mark/w_mark_04.png' });
  return `https://ci.encar.com${pathname}?${params}`;
}

export function getCarPreviewMetadata(title: string, description: string, url: string, image?: string): Metadata {
  const imageUrl = image && image !== '/images/no-image.svg' ? new URL(image, PUBLIC_SITE_URL).href : undefined;
  const images = imageUrl ? [{ url: imageUrl, alt: title }] : [];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | GHAYRAT`, description, url, type: 'website', siteName: 'GHAYRAT', images },
    twitter: { card: imageUrl ? 'summary_large_image' : 'summary', title, description, images },
  };
}

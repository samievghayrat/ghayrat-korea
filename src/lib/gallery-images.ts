// Resize only Encar's existing CDN image. Keep the original path and watermark
// parameters; non-Encar and local images retain their original URL.
export function getGalleryThumbnailUrl(src: string): string {
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:' || url.hostname !== 'ci.encar.com') return src;
    url.searchParams.set('impolicy', 'heightRate');
    url.searchParams.set('rh', '120');
    url.searchParams.set('cw', '192');
    url.searchParams.set('ch', '120');
    url.searchParams.set('cg', 'Center');
    return url.toString();
  } catch { return src; }
}

export function getNextGalleryImage(images: string[], index: number): string | undefined {
  if (images.length < 2) return undefined;
  const next = images[(index + 1) % images.length];
  return next !== images[index] ? next : undefined;
}

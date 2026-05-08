const IMAGE_BASE_URL = "https://www.kcarauction.com/auction/IMAGE_UPLOAD/CAR";
const FETCH_TIMEOUT = 5000; // 5 second timeout for image fetches

function fetchWithTimeout(url: string, timeoutMs: number = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Download thumbnail to R2. Always returns a valid image path —
 * if download fails, saves a thumb manifest so the proxy can lazily fetch it.
 */
export async function downloadImage(
  bucket: R2Bucket,
  carId: string,
  thumbnailPath: string
): Promise<string> {
  const r2Key = `kcar/${carId}.jpg`;
  const imagePath = `/api/images/${r2Key}`;

  // Skip if already exists in R2
  const existing = await bucket.head(r2Key);
  if (existing) {
    return imagePath;
  }

  const imageUrl = `${IMAGE_BASE_URL}/${thumbnailPath}`;

  try {
    const response = await fetchWithTimeout(imageUrl);
    if (!response.ok) {
      // Save manifest for lazy proxy, return path
      await bucket.put(`kcar/${carId}_thumb.json`, JSON.stringify({ r2Key, sourceUrl: imageUrl }),
        { httpMetadata: { contentType: "application/json" } });
      return imagePath;
    }

    const arrayBuffer = await response.arrayBuffer();
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: { contentType: "image/jpeg" },
    });
    return imagePath;
  } catch {
    // Save manifest for lazy proxy, return path
    await bucket.put(`kcar/${carId}_thumb.json`, JSON.stringify({ r2Key, sourceUrl: imageUrl }),
      { httpMetadata: { contentType: "application/json" } });
    return imagePath;
  }
}

export interface ImageManifestEntry {
  r2Key: string;
  sourceUrl: string;
}

/**
 * Save image manifest to R2. Images are fetched lazily by the proxy on first access.
 */
export async function saveImageManifest(
  bucket: R2Bucket,
  carId: string,
  sourceUrls: string[]
): Promise<string[]> {
  const manifest: ImageManifestEntry[] = sourceUrls.map((url, i) => {
    const index = String(i + 1).padStart(2, "0");
    const r2Key = `kcar/${carId}_${index}.jpg`;
    return { r2Key, sourceUrl: url };
  });

  // Save manifest (used by lazy proxy to fetch images on demand)
  await bucket.put(
    `kcar/${carId}_manifest.json`,
    JSON.stringify(manifest),
    { httpMetadata: { contentType: "application/json" } }
  );

  return manifest.map((e) => `/api/images/${e.r2Key}`);
}

export async function saveImageSet(
  bucket: R2Bucket,
  carId: string,
  sourceUrls: string[]
): Promise<string[]> {
  return saveImageManifest(bucket, carId, sourceUrls);
}

export async function downloadManifestImage(
  bucket: R2Bucket,
  entry: ImageManifestEntry
): Promise<boolean> {
  const existing = await bucket.head(entry.r2Key);
  if (existing) return false;

  const response = await fetchWithTimeout(entry.sourceUrl);
  if (!response.ok) return false;

  const arrayBuffer = await response.arrayBuffer();
  await bucket.put(entry.r2Key, arrayBuffer, {
    httpMetadata: { contentType: "image/jpeg" },
  });
  return true;
}

/**
 * Fetch an image from K Car using the manifest, cache in R2, and return the image body.
 */
export async function fetchAndCacheImage(
  bucket: R2Bucket,
  r2Key: string
): Promise<{ body: ReadableStream | ArrayBuffer; contentType: string } | null> {
  // Already cached?
  const existing = await bucket.get(r2Key);
  if (existing) {
    return { body: existing.body, contentType: "image/jpeg" };
  }

  // Try thumbnail manifest: kcar/{carId}.jpg → kcar/{carId}_thumb.json
  const thumbMatch = r2Key.match(/^kcar\/([^_]+)\.jpg$/);
  if (thumbMatch) {
    const thumbManifest = await bucket.get(`kcar/${thumbMatch[1]}_thumb.json`);
    if (thumbManifest) {
      const entry: ImageManifestEntry = await thumbManifest.json();
      try {
        const response = await fetchWithTimeout(entry.sourceUrl);
        if (response.ok) {
          const buf = await response.arrayBuffer();
          await bucket.put(r2Key, buf, { httpMetadata: { contentType: "image/jpeg" } });
          return { body: buf, contentType: "image/jpeg" };
        }
      } catch { /* fall through */ }
    }
    return null;
  }

  // Multi-image manifest: kcar/{carId}_{index}.jpg
  const match = r2Key.match(/^kcar\/([^_]+)_\d+\.jpg$/);
  if (!match) return null;

  const carId = match[1];
  const manifestObj = await bucket.get(`kcar/${carId}_manifest.json`);
  if (!manifestObj) return null;

  const manifest: ImageManifestEntry[] = await manifestObj.json();
  const entry = manifest.find((e) => e.r2Key === r2Key);
  if (!entry) return null;

  try {
    const response = await fetchWithTimeout(entry.sourceUrl);
    if (!response.ok) return null;

    const buf = await response.arrayBuffer();
    await bucket.put(r2Key, buf, {
      httpMetadata: { contentType: "image/jpeg" },
    });

    return { body: buf, contentType: "image/jpeg" };
  } catch {
    return null;
  }
}

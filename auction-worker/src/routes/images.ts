import { Hono } from "hono";
import type { Env } from "../types/env";
import { fetchAndCacheImage } from "../scraper/image-downloader";

const app = new Hono<{ Bindings: Env }>();

// GET /api/images/* - Get an image from R2 with Cloudflare CDN edge caching
app.get("/*", async (c) => {
  const key = c.req.path.replace("/api/images/", "");
  const cacheUrl = new URL(c.req.url);

  // Check Cloudflare edge cache first (fastest path — no Worker/R2 round-trip)
  const cache = caches.default;
  const cacheKey = new Request(cacheUrl.toString(), c.req.raw);
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Try R2
  const object = await c.env.BUCKET.get(key);
  if (object) {
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Content-Length", String(object.size));
    const response = new Response(object.body, { headers });

    // Store in Cloudflare edge cache for future requests
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }

  // Not in R2 — try lazy fetch via manifest (for car multi-images)
  const result = await fetchAndCacheImage(c.env.BUCKET, key);
  if (result) {
    const headers = new Headers();
    headers.set("Content-Type", result.contentType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    const response = new Response(result.body, { headers });

    // Cache this too so future requests skip the lazy fetch
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }

  return c.json({ error: "Image not found" }, 404);
});

export default app;

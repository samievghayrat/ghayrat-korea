import { Hono } from "hono";
import type { Env } from "../types/env";

const app = new Hono<{ Bindings: Env }>();

// GET /api/images/* - Serve only images already stored in R2.
app.get("/*", async (c) => {
  const key = c.req.path.replace("/api/images/", "");
  const cacheUrl = new URL(c.req.url);

  const cache = caches.default;
  const cacheKey = new Request(cacheUrl.toString(), c.req.raw);
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const object = await c.env.BUCKET.get(key);
  if (!object) {
    return c.json({ error: "Image not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Length", String(object.size));
  const response = new Response(object.body, { headers });

  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
});

export default app;

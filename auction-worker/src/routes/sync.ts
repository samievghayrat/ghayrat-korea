import { Hono } from "hono";
import type { Env } from "../types/env";
import { syncKCarAuctions, enrichCarDetails } from "../scraper/sync";
import type { ImageManifestEntry } from "../scraper/image-downloader";

const app = new Hono<{ Bindings: Env }>();

// Auth middleware: require SYNC_SECRET on all sync routes
app.use("*", async (c, next) => {
  const secret = c.req.query("secret") || c.req.header("Authorization")?.replace("Bearer ", "");
  if (!secret || secret !== c.env.SYNC_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

// GET /api/sync - Trigger full KCar auction sync
app.get("/", async (c) => {
  const result = await syncKCarAuctions(c.env);
  return c.json({ data: result });
});

// GET /api/sync/enrich - Enrich cars with engine volume, VIN, drive type
app.get("/enrich", async (c) => {
  const limit = parseInt(c.req.query("limit") || "15", 10);
  const result = await enrichCarDetails(c.env, Math.min(limit, 600));
  return c.json({ data: result });
});

// GET /api/sync/warm-images - Pre-download images from manifests into R2
app.get("/warm-images", async (c) => {
  const limit = parseInt(c.req.query("limit") || "10", 10);
  const offset = parseInt(c.req.query("offset") || "0", 10);
  let warmed = 0;
  let skipped = 0;
  let failed = 0;
  let manifestsProcessed = 0;

  const listed = await c.env.BUCKET.list({ prefix: "kcar/", limit: 1000 });
  const manifests = listed.objects.filter(o => o.key.endsWith("_manifest.json"));

  for (const mObj of manifests.slice(offset, offset + limit)) {
    const obj = await c.env.BUCKET.get(mObj.key);
    if (!obj) continue;
    manifestsProcessed++;

    const entries: ImageManifestEntry[] = await obj.json();

    await Promise.allSettled(
      entries.map(async (entry) => {
        const existing = await c.env.BUCKET.head(entry.r2Key);
        if (existing) { skipped++; return; }
        try {
          const res = await fetch(entry.sourceUrl);
          if (res.ok) {
            const buf = await res.arrayBuffer();
            await c.env.BUCKET.put(entry.r2Key, buf, {
              httpMetadata: { contentType: "image/jpeg" },
            });
            warmed++;
          } else { failed++; }
        } catch { failed++; }
      })
    );
  }

  return c.json({ data: { warmed, skipped, failed, manifestsProcessed, totalManifests: manifests.length, nextOffset: offset + limit } });
});

// GET /api/sync/restore-images - Restore images column from R2 manifests
app.get("/restore-images", async (c) => {
  let restored = 0;

  const listed = await c.env.BUCKET.list({ prefix: "kcar/", limit: 1000 });
  const manifests = listed.objects.filter(o => o.key.endsWith("_manifest.json"));

  for (const mObj of manifests) {
    const obj = await c.env.BUCKET.get(mObj.key);
    if (!obj) continue;

    const entries: ImageManifestEntry[] = await obj.json();
    if (entries.length === 0) continue;

    const carId = entries[0].r2Key.replace(/^kcar\//, "").replace(/_\d+\.jpg$/, "");
    const paths = entries.map(e => `/api/images/${e.r2Key}`);

    await c.env.DB.prepare(
      `UPDATE cars SET images = ?1 WHERE id = ?2 AND (images IS NULL OR length(images) < 5)`
    ).bind(JSON.stringify(paths), carId).run();
    restored++;
  }

  return c.json({ data: { restored, totalManifests: manifests.length } });
});

// GET /api/sync/fix-images - Set image paths for cars with empty image field
app.get("/fix-images", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT id FROM cars WHERE image IS NULL OR image = ''`
  ).all<{ id: string }>();

  let fixed = 0;
  const BATCH = 50;
  for (let i = 0; i < rows.results.length; i += BATCH) {
    const slice = rows.results.slice(i, i + BATCH);
    const stmts = slice.map(r =>
      c.env.DB.prepare(`UPDATE cars SET image = ?1 WHERE id = ?2`)
        .bind(`/api/images/kcar/${r.id}.jpg`, r.id)
    );
    await c.env.DB.batch(stmts);
    fixed += slice.length;
  }

  return c.json({ data: { fixed, total: rows.results.length } });
});

export default app;

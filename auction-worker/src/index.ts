import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import carsRoutes from "./routes/cars";
import bidsRoutes from "./routes/bids";
import imagesRoutes from "./routes/images";
import syncRoutes from "./routes/sync";
import { syncKCarAuctions, enrichCarDetails } from "./scraper/sync";
import type { Env } from "./types/env";

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", corsMiddleware());

// Health check
app.get("/", (c) => c.json({ status: "ok" }));

// Routes
app.route("/api/cars", carsRoutes);
app.route("/api/bids", bidsRoutes);
app.route("/api/images", imagesRoutes);
app.route("/api/sync", syncRoutes);

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil((async () => {
      // Phase 1: Sync car data, thumbnails, and image manifests
      await syncKCarAuctions(env);

      // Phase 2: Enrich new cars with engine volume, VIN, drive type
      // Each call processes 15 cars with a fresh KCar session
      for (let i = 0; i < 8; i++) {
        const result = await enrichCarDetails(env, 15);
        if (result.remaining === 0) break;
      }
    })());
  },
};

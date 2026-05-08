import { Hono } from "hono";
import { eq, and, gte, lte, like, gt, asc } from "drizzle-orm";
import { createDb } from "../db";
import { cars } from "../db/schema";
import { carQuerySchema } from "../validators/car";
import type { Env } from "../types/env";
import { KCarClient } from "../scraper/kcar-client";
import { saveImageManifest } from "../scraper/image-downloader";

const app = new Hono<{ Bindings: Env }>();

// GET /api/cars - List cars with optional filters
app.get("/", async (c) => {
  const query = carQuerySchema.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
  if (!query.success) {
    return c.json({ error: query.error.flatten() }, 400);
  }

  const db = createDb(c.env.DB);
  const { brand, fuelType, transmission, condition, minPrice, maxPrice, minYear, maxYear, limit, offset } = query.data;

  const conditions = [];
  conditions.push(gt(cars.price, 0));

  // Only show cars with upcoming/today auction
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  conditions.push(gte(cars.auctionDate, kstDate));

  if (brand) conditions.push(like(cars.brand, `%${brand}%`));
  if (fuelType) conditions.push(eq(cars.fuelType, fuelType));
  if (transmission) conditions.push(eq(cars.transmission, transmission));
  if (condition) conditions.push(eq(cars.condition, condition));
  if (minPrice) conditions.push(gte(cars.price, minPrice));
  if (maxPrice) conditions.push(lte(cars.price, maxPrice));
  if (minYear) conditions.push(gte(cars.year, minYear));
  if (maxYear) conditions.push(lte(cars.year, maxYear));

  const orderBy = [asc(cars.auctionDate), asc(cars.lotNumber)];

  const results = await db
    .select()
    .from(cars)
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  return c.json({ data: results, count: results.length });
});

// GET /api/cars/:id/images - Return car images
app.get("/:id/images", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
  if (!car) {
    return c.json({ error: "Car not found" }, 404);
  }

  // Return cached images if populated
  if (car.images && car.images.length > 0) {
    return c.json({ data: car.images });
  }

  try {
    const client = new KCarClient();
    await client.login(c.env.KCAR_USER_ID, c.env.KCAR_USER_PW);
    const sourceImages = await client.fetchCarImages(id);

    if (sourceImages.length > 0) {
      const paths = await saveImageManifest(c.env.BUCKET, id, sourceImages);
      await db
        .update(cars)
        .set({ images: paths })
        .where(eq(cars.id, id));

      return c.json({ data: paths });
    }
  } catch {
    // If KCar blocks or times out, keep the page usable with the thumbnail.
  }

  // Fall back to single thumbnail
  return c.json({ data: [car.image] });
});

// GET /api/cars/:id - Get a single car
app.get("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);

  if (!car) {
    return c.json({ error: "Car not found" }, 404);
  }

  return c.json({ data: car });
});

export default app;

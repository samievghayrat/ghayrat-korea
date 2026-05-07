import { Hono } from "hono";
import { createDb } from "../db";
import { bidRequests } from "../db/schema";
import { bidRequestSchema } from "../validators/bid";
import type { Env } from "../types/env";

const app = new Hono<{ Bindings: Env }>();

const RATE_LIMIT = 5; // max bids per IP per hour

// POST /api/bids - Submit a bid request
app.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = bidRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  // Rate limit: max 5 bids per IP per hour
  const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentCount = await c.env.DB.prepare(
    `SELECT count(*) as c FROM bid_requests WHERE ip = ?1 AND created_at > ?2`
  ).bind(ip, oneHourAgo).first<{ c: number }>();

  if ((recentCount?.c ?? 0) >= RATE_LIMIT) {
    return c.json({ error: "Too many requests. Please try again later." }, 429);
  }

  const db = createDb(c.env.DB);
  const id = crypto.randomUUID();

  await db.insert(bidRequests).values({
    ...parsed.data,
    id,
    ip,
  });

  // Send Telegram notification
  if (c.env.TELEGRAM_BOT_TOKEN && c.env.TELEGRAM_CHAT_ID) {
    try {
      const carRow = await c.env.DB.prepare(
        `SELECT brand, model, year, lot_number FROM cars WHERE id = ?1`
      ).bind(parsed.data.carId).first<{ brand: string; model: string; year: number; lot_number: string }>();

      const carLabel = carRow
        ? `${carRow.brand} ${carRow.model} ${carRow.year} (Lot ${carRow.lot_number})`
        : parsed.data.carId;

      const text = [
        `🚗 New Bid Request`,
        ``,
        `Car: ${carLabel}`,
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        parsed.data.phone ? `Phone: ${parsed.data.phone}` : null,
        `Max Bid: ${parsed.data.maxBid.toLocaleString()} 만원`,
        parsed.data.message ? `Message: ${parsed.data.message}` : null,
      ].filter(Boolean).join("\n");

      await fetch(`https://api.telegram.org/bot${c.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: c.env.TELEGRAM_CHAT_ID, text }),
      });
    } catch {
      // Don't fail the bid if Telegram fails
    }
  }

  return c.json({ data: { id } }, 201);
});

export default app;

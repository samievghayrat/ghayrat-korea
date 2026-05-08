import type { Env } from "../types/env";
import { KCarClient, parseEngineVolume, parseInspectionFromListing } from "./kcar-client";
import { mapKCarToSchema } from "./field-mapper";
import { downloadImage, saveImageSet } from "./image-downloader";

const BATCH_SIZE = 3;

function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.floor(Math.random() * (maxMs - minMs));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SyncResult {
  fetched: number;
  inserted: number;
  deleted: number;
  imagesFailed: number;
  imagesUpdated: number;
  errors: string[];
  durationMs: number;
}

/**
 * Full sync: car data, thumbnails, and image manifests in batches.
 * Engine volume is parsed from the car name during mapping.
 * Inspection data (accident history, notes) is extracted from listing fields.
 */
export async function syncKCarAuctions(env: Env): Promise<SyncResult> {
  const start = Date.now();
  const errors: string[] = [];
  let fetched = 0;
  let inserted = 0;
  let deleted = 0;
  let imagesFailed = 0;
  let imagesUpdated = 0;

  try {
    const client = new KCarClient();
    await client.login(env.KCAR_USER_ID, env.KCAR_USER_PW);

    // Fetch daily then weekly listings
    const dailyCars = await client.fetchAllCars("dCfm");
    await randomDelay(1000, 2000);
    const weeklyCars = await client.fetchAllCars("wCfm");

    // Deduplicate by CAR_ID
    const carMap = new Map<string, (typeof dailyCars)[0]>();
    for (const car of [...dailyCars, ...weeklyCars]) {
      carMap.set(car.CAR_ID, car);
    }
    const uniqueCars = Array.from(carMap.values());
    fetched = uniqueCars.length;

    // Find cars that already exist — skip all image work for those
    const existingRows = await env.DB.prepare(
      `SELECT id, image, images FROM cars`
    ).all<{ id: string; image: string; images: string | null }>();
    const existingCars = new Map(existingRows.results.map(r => [r.id, r]));

    const UPSERT_SQL = `INSERT INTO cars (
      id, brand, model, year, price, mileage, transmission, fuel_type,
      engine_tier, engine_volume, image, images, auction_date, lot_number,
      location, condition, starting_bid, kcar_id, auction_code, kcar_status,
      grade, exbit_seq, cno, first_reg_date, color, vin, drive_type,
      final_price, sold_status, inspection_data, updated_at
    ) VALUES (
      ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8,
      ?9, ?10, ?11, ?12, ?13, ?14,
      ?15, ?16, ?17, ?18, ?19, ?20,
      ?21, ?22, ?23, ?24, ?25, ?26, ?27,
      ?28, ?29, ?30, ?31
    )
    ON CONFLICT(id) DO UPDATE SET
      brand = excluded.brand,
      model = excluded.model,
      year = excluded.year,
      price = excluded.price,
      mileage = excluded.mileage,
      transmission = excluded.transmission,
      fuel_type = excluded.fuel_type,
      engine_tier = excluded.engine_tier,
      engine_volume = CASE WHEN excluded.engine_volume IS NOT NULL THEN excluded.engine_volume ELSE cars.engine_volume END,
      image = excluded.image,
      images = CASE WHEN length(coalesce(excluded.images, '')) > 4 THEN excluded.images ELSE cars.images END,
      auction_date = excluded.auction_date,
      lot_number = excluded.lot_number,
      location = excluded.location,
      condition = excluded.condition,
      starting_bid = excluded.starting_bid,
      kcar_id = excluded.kcar_id,
      auction_code = excluded.auction_code,
      kcar_status = excluded.kcar_status,
      grade = excluded.grade,
      exbit_seq = excluded.exbit_seq,
      cno = excluded.cno,
      first_reg_date = excluded.first_reg_date,
      color = excluded.color,
      vin = CASE WHEN excluded.vin IS NOT NULL THEN excluded.vin ELSE cars.vin END,
      drive_type = CASE WHEN excluded.drive_type IS NOT NULL THEN excluded.drive_type ELSE cars.drive_type END,
      final_price = CASE WHEN excluded.final_price IS NOT NULL THEN excluded.final_price ELSE cars.final_price END,
      sold_status = excluded.sold_status,
      inspection_data = CASE WHEN excluded.inspection_data IS NOT NULL THEN excluded.inspection_data ELSE cars.inspection_data END,
      updated_at = excluded.updated_at`;

    // Phase 1: Download thumbnails and save image manifests for NEW cars (in batches)
    const mappedCars: (ReturnType<typeof mapKCarToSchema> & { inspectionData: string | null })[] = [];
    for (let i = 0; i < uniqueCars.length; i += BATCH_SIZE) {
      const batch = uniqueCars.slice(i, i + BATCH_SIZE);

      const [imageResults, multiImageResults] = await Promise.all([
        Promise.all(
          batch.map(async (car) => {
            const existing = existingCars.get(car.CAR_ID);
            // Skip all image work for existing cars (fix images via enrich endpoint)
            if (existing) return existing.image || "";
            try {
              return await downloadImage(env.BUCKET, car.CAR_ID, car.THUMBNAIL_MOBILE);
            } catch {
              imagesFailed++;
              return "";
            }
          })
        ),
        Promise.all(
          batch.map(async (car) => {
            const existing = existingCars.get(car.CAR_ID);
            if (existing?.images) {
              try {
                const parsed = JSON.parse(existing.images);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
              } catch { /* fetch a fresh image set below */ }
            }
            try {
              const imgs = await client.fetchCarImages(car.CAR_ID);
              if (imgs.length > 0) {
                imagesUpdated++;
                return await saveImageSet(env.BUCKET, car.CAR_ID, imgs);
              }
              return [];
            } catch {
              return [];
            }
          })
        ),
      ]);

      for (let j = 0; j < batch.length; j++) {
        // If thumbnail download failed, use first multi-image as fallback
        let thumbnail = imageResults[j];
        if (!thumbnail && multiImageResults[j].length > 0) {
          thumbnail = multiImageResults[j][0];
        }
        const mapped = mapKCarToSchema(batch[j], thumbnail, multiImageResults[j], null, null, null);
        // Parse inspection data from listing fields
        const inspection = parseInspectionFromListing(batch[j]);
        mappedCars.push({
          ...mapped,
          inspectionData: inspection ? JSON.stringify(inspection) : null,
        });
      }

      if (i + BATCH_SIZE < uniqueCars.length) {
        await randomDelay(800, 1500);
      }
    }

    // Phase 2: Batch-insert all cars into D1 (100 per batch call)
    const DB_BATCH = 100;
    for (let i = 0; i < mappedCars.length; i += DB_BATCH) {
      const slice = mappedCars.slice(i, i + DB_BATCH);
      try {
        const stmts = slice.map(mapped =>
          env.DB.prepare(UPSERT_SQL).bind(
            mapped.id, mapped.brand, mapped.model, mapped.year,
            mapped.price, mapped.mileage, mapped.transmission, mapped.fuelType,
            mapped.engineTier, mapped.engineVolume, mapped.image,
            mapped.images ? JSON.stringify(mapped.images) : null,
            mapped.auctionDate, mapped.lotNumber, mapped.location, mapped.condition,
            mapped.startingBid, mapped.kcarId, mapped.auctionCode, mapped.kcarStatus,
            mapped.grade, mapped.exbitSeq, mapped.cno, mapped.firstRegDate,
            mapped.color, mapped.vin, mapped.driveType,
            mapped.finalPrice, mapped.soldStatus, mapped.inspectionData, mapped.updatedAt
          )
        );
        await env.DB.batch(stmts);
        inserted += slice.length;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`DB batch ${i}-${i + slice.length}: ${msg}`);
      }
    }

    // Delete cars no longer returned by the API (batched)
    if (uniqueCars.length > 0) {
      const activeIds = new Set(uniqueCars.map(c => c.CAR_ID));
      const allRows = await env.DB.prepare(`SELECT id FROM cars`).all<{ id: string }>();
      const toDelete = allRows.results.filter(r => !activeIds.has(r.id)).map(r => r.id);
      if (toDelete.length > 0) {
        for (let i = 0; i < toDelete.length; i += DB_BATCH) {
          const slice = toDelete.slice(i, i + DB_BATCH);
          const bidStmts = slice.map(id => env.DB.prepare(`DELETE FROM bid_requests WHERE car_id = ?1`).bind(id));
          const carStmts = slice.map(id => env.DB.prepare(`DELETE FROM cars WHERE id = ?1`).bind(id));
          await env.DB.batch([...bidStmts, ...carStmts]);
          deleted += slice.length;
        }
      }
    }

    // Delete cars whose auction has already finished (auction_date < today KST)
    const now = new Date();
    const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const expiredRows = await env.DB.prepare(
      `SELECT id FROM cars WHERE auction_date < ?1`
    ).bind(kstDate).all<{ id: string }>();
    if (expiredRows.results.length > 0) {
      for (let i = 0; i < expiredRows.results.length; i += DB_BATCH) {
        const slice = expiredRows.results.slice(i, i + DB_BATCH);
        const bidStmts = slice.map(r => env.DB.prepare(`DELETE FROM bid_requests WHERE car_id = ?1`).bind(r.id));
        const carStmts = slice.map(r => env.DB.prepare(`DELETE FROM cars WHERE id = ?1`).bind(r.id));
        await env.DB.batch([...bidStmts, ...carStmts]);
        deleted += slice.length;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Sync failed: ${msg}`);
  }

  return { fetched, inserted, deleted, imagesFailed, imagesUpdated, errors, durationMs: Date.now() - start };
}

/**
 * Enrich cars with engine volume parsed from the car name.
 * Also backfills missing image manifests.
 * No external API calls needed for engine volume — it's parsed from existing DB data.
 */
export async function enrichCarDetails(env: Env, limit: number = 50): Promise<{ updated: number; remaining: number; imagesBackfilled: number; errors: string[] }> {
  const errors: string[] = [];
  let updated = 0;
  let imagesBackfilled = 0;

  try {
    // Phase 1: Parse engine_volume from engine_tier (car name) for cars missing it
    const rows = await env.DB.prepare(
      `SELECT id, engine_tier, grade FROM cars WHERE engine_volume IS NULL LIMIT ?1`
    ).bind(limit).all<{ id: string; engine_tier: string | null; grade: string | null }>();

    for (const row of rows.results) {
      const engineVolume = parseEngineVolume(row.engine_tier || "", row.grade || "");
      if (engineVolume) {
        await env.DB.prepare(
          `UPDATE cars SET engine_volume = ?1 WHERE id = ?2`
        ).bind(engineVolume, row.id).run();
        updated++;
      }
    }

    // Phase 2: Backfill missing image manifests (lazy proxy handles actual downloads)
    const client = new KCarClient();
    await client.login(env.KCAR_USER_ID, env.KCAR_USER_PW);

    const imgRows = await env.DB.prepare(
      `SELECT id FROM cars WHERE images IS NULL OR images = '[]' OR length(images) < 5 LIMIT ?1`
    ).bind(limit).all<{ id: string }>();

    for (const row of imgRows.results) {
      try {
        await randomDelay(800, 2000);
        const imgs = await client.fetchCarImages(row.id);
        if (imgs.length > 0) {
          const paths = await saveImageSet(env.BUCKET, row.id, imgs);
          await env.DB.prepare(
            `UPDATE cars SET images = ?1 WHERE id = ?2`
          ).bind(JSON.stringify(paths), row.id).run();
          imagesBackfilled++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Image backfill ${row.id}: ${msg.slice(0, 100)}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Enrich failed: ${msg}`);
  }

  const remainingCount = await env.DB.prepare(
    `SELECT count(*) as c FROM cars WHERE engine_volume IS NULL`
  ).first<{ c: number }>();

  return { updated, remaining: remainingCount?.c ?? 0, imagesBackfilled, errors };
}

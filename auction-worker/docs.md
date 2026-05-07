# KCar Bidding Service — Serverless Backend

## Overview

Cloudflare Worker that scrapes car auction listings from kcarauction.com, stores images in R2, and serves data via REST API. Runs on a daily cron schedule.

**Deployment URL:** `https://kcar-bidding-api.ghayrat-sami.workers.dev`

---

## Architecture

```
┌─────────────┐    cron 0 16 * * *     ┌──────────────────┐
│  Cloudflare  │ ──────────────────────►│  KCar Scraper    │
│  Scheduler   │                        │  (sync.ts)       │
└─────────────┘                        └────────┬─────────┘
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                    │ kcarauction  │  │  D1 Database  │  │  R2 Bucket   │
                    │   .com API   │  │  (cars table) │  │  (thumbnails)│
                    └──────────────┘  └──────────────┘  └──────────────┘
```

## Infrastructure

| Resource       | Binding | Name/ID                                |
|----------------|---------|----------------------------------------|
| D1 Database    | `DB`    | `kcar-db` (aca4b095-bbc0-43a6-b4e2-c7b22e6d6c37) |
| R2 Bucket      | `BUCKET`| `kcar-images`                          |
| Cron Trigger   | —       | `0 16 * * *` (16:00 UTC = 01:00 AM KST)|

### Worker Secrets

| Secret          | Description                         |
|-----------------|-------------------------------------|
| `KCAR_USER_ID`  | kcarauction.com login username      |
| `KCAR_USER_PW`  | kcarauction.com login password      |

Set via: `npx wrangler secret put KCAR_USER_ID` / `npx wrangler secret put KCAR_USER_PW`

---

## API Endpoints

### `GET /`
Health check. Returns `{ "status": "ok" }`.

### `GET /api/cars`
List cars with optional filters.

**Query Parameters:**
- `brand` — Filter by brand name (partial match)
- `fuelType` — `Gasoline` | `Diesel` | `Hybrid` | `Electric`
- `transmission` — `Automatic` | `Manual`
- `condition` — `Excellent` | `Good` | `Fair`
- `minPrice` / `maxPrice` — Price range (in 만원)
- `minYear` / `maxYear` — Year range
- `limit` — Results per page (default 20)
- `offset` — Pagination offset

### `GET /api/cars/:id`
Get a single car by ID (e.g., `CA20362198`).

### `POST /api/cars`
Create a car manually (JSON body).

### `GET /api/images/*`
Serve images from R2. Supports nested keys like `kcar/CA20362198.jpg`.

### `POST /api/images`
Upload an image to R2 (multipart form data).

### `GET /api/sync`
Manually trigger a full scrape. Returns sync results:
```json
{
  "data": {
    "fetched": 312,
    "inserted": 312,
    "imagesFailed": 0,
    "errors": [],
    "durationMs": 495231
  }
}
```

### `POST /api/bids`
Submit a bid request for a car.

---

## Scraper Module (`src/scraper/`)

### Authentication Flow (`kcar-client.ts`)

1. **Login** — POST to `/kcar/user/user_logincheck_ajax.do` with `user_id` + `user_pw`
2. **Bid Agreement** — POST to `/kcar/user/user_confirm_ajax.do` with `bid_agree_modal=Y`
3. **Fetch Listings** — POST to `/kcar/auction/getAuctionCarList_ajax.do`

**Required headers** (WAF bypass — the KCar website blocks requests without these):
- `Origin: https://www.kcarauction.com`
- `Sec-Fetch-Site: same-origin`
- `Sec-Fetch-Mode: cors`
- `Sec-Fetch-Dest: empty`
- `X-Requested-With: XMLHttpRequest`
- Browser-like `User-Agent`

### Pagination

The KCar API uses `START_RNUM` as a **page number** (1-based), not a row offset:
- Page 1: `START_RNUM=1`, `PAGE_CNT=50`
- Page 2: `START_RNUM=2`, `PAGE_CNT=50`

Response contains `CAR_LIST` array. When `CAR_LIST.length < PAGE_CNT`, there are no more pages.

### Auction Types

| `AUC_TYPE` | `PAGE_TYPE` | Description |
|------------|-------------|-------------|
| `daily`    | `dCfm`      | Daily auction — confirmed vehicles |
| `weekly`   | `wCfm`      | Weekly auction — confirmed vehicles |

### Field Mapping (`field-mapper.ts`)

| KCar Field             | Schema Field     | Transformation |
|------------------------|------------------|----------------|
| `CAR_ID`               | `id`, `kcarId`   | Direct |
| `MNUFTR_NM`            | `brand`          | Direct (Korean manufacturer name) |
| `MODEL_NM`             | `model`          | Direct |
| `FORM_YR`              | `year`           | Parse int |
| `AUC_STRT_PRC`         | `price`, `startingBid` | Won → 만원 (÷ 10,000) |
| `MILG`                 | `mileage`        | Parse int (km) |
| `GBOX_DCD`             | `transmission`   | M/MT/수동 → Manual, else Automatic |
| `FUEL_TYPE_NM`         | `fuelType`       | 디젤→Diesel, 하이브리드→Hybrid, 전기→Electric, else Gasoline |
| `AUC_STRT_END_DATETIME`| `auctionDate`    | Extract YYYY-MM-DD |
| `EXBIT_SEQ`            | `lotNumber`, `exbitSeq` | Exhibition sequence number |
| `AUC_PLC_NM`           | `location`       | Auction place (오산경매장/세종경매장) |
| `CNO`                  | `cno`            | License plate number |
| `AUC_CD`               | `auctionCode`    | Auction code (e.g., AC20260203) |
| `AUC_STAT_NM`          | `kcarStatus`     | Status (출품마감, etc.) |
| `GRD_LCSF_NM` + `GRD_SCSF_NM` | `grade` | Grade classification combined |
| `THUMBNAIL_MOBILE`     | `image`          | Downloaded to R2, stored as `/api/images/kcar/{CAR_ID}.jpg` |

### Image Downloads (`image-downloader.ts`)

- Source: `https://www.kcarauction.com/auction/IMAGE_UPLOAD/CAR/{THUMBNAIL_MOBILE}`
- Stored in R2: `kcar/{CAR_ID}.jpg`
- Skips existing images (`bucket.head()` check)
- Falls back to original KCar URL on download failure

### Rate Limiting (`sync.ts`, `kcar-client.ts`)

To avoid detection and respect the KCar website:
- **Between pages:** 2–4 second random delay
- **Between daily/weekly fetches:** 3–5 second random delay
- **Between image batches:** 2–4.5 second random delay (3 concurrent per batch)
- All delays use random intervals to avoid bot-like patterns

### Sync Orchestration (`sync.ts`)

1. Login + agree to terms
2. Fetch daily auction cars (may be 0 on non-auction days)
3. Wait 3–5s
4. Fetch weekly auction cars
5. Deduplicate by `CAR_ID`
6. Process in batches of 3:
   - Download images concurrently within batch
   - Upsert each car via `INSERT ... ON CONFLICT(id) DO UPDATE`
   - Random delay between batches

---

## Database Schema

### `cars` table

Core fields: `id`, `brand`, `model`, `year`, `price`, `mileage`, `transmission`, `fuel_type`, `engine_tier`, `engine_volume`, `image`, `images`, `auction_date`, `lot_number`, `location`, `condition`, `starting_bid`, `created_at`

KCar-specific fields (added in migration `0001_odd_kang.sql`): `kcar_id`, `auction_code`, `kcar_status`, `grade`, `exbit_seq`, `cno`, `updated_at`

### `bid_requests` table

Fields: `id`, `car_id` (FK → cars.id), `name`, `email`, `phone`, `max_bid`, `message`, `created_at`

---

## Development

```bash
cd serverless

# Install dependencies
npm install

# Run locally
npm run dev

# Generate migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate:local    # local D1
npm run db:migrate:remote   # production D1

# Deploy
npm run deploy

# Set secrets
npx wrangler secret put KCAR_USER_ID
npx wrangler secret put KCAR_USER_PW
```

## File Structure

```
serverless/
├── src/
│   ├── index.ts                 # Worker entry: fetch handler + scheduled handler
│   ├── types/env.ts             # Env type (D1, R2, secrets)
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema (cars, bid_requests)
│   │   └── index.ts             # createDb helper
│   ├── scraper/
│   │   ├── kcar-client.ts       # KCar API client (login, fetch listings)
│   │   ├── field-mapper.ts      # KCar → schema field mapping
│   │   ├── image-downloader.ts  # R2 image fetcher
│   │   └── sync.ts              # Sync orchestrator
│   ├── routes/
│   │   ├── cars.ts              # /api/cars CRUD
│   │   ├── bids.ts              # /api/bids
│   │   ├── images.ts            # /api/images (R2 proxy)
│   │   └── sync.ts              # /api/sync (manual trigger)
│   ├── middleware/
│   │   └── cors.ts              # CORS middleware
│   └── validators/
│       └── car.ts               # Zod validators
├── drizzle/
│   ├── 0000_skinny_praxagora.sql  # Initial schema
│   └── 0001_odd_kang.sql          # KCar columns
├── wrangler.toml                # Worker config + cron trigger
├── drizzle.config.ts            # Drizzle Kit config
└── package.json
```

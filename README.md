# GHAYRAT KOREA

Next.js website for Korean car listings, delivery information, favorites, contact flows, and KCar auction listings.

The auction UI is part of this same Vercel app:

- `/auction` lists active KCar auction cars.
- `/auction/[id]` shows the auction detail page.
- `/api/auction/*` proxies auction data through the Next app.
- `auction-worker/` contains the KCar scraper/API worker that syncs KCar data into Cloudflare D1/R2.

## Getting Started

Run the Vercel/Next website:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run the auction data worker locally when changing the scraper/API:

```bash
npm run dev:auction-worker
```

Deploy the website through Vercel as usual. Deploy the auction worker separately:

```bash
npm run deploy:auction-worker
```

## Environment

Website:

- `KCAR_API_URL` or `NEXT_PUBLIC_KCAR_API_URL`: optional override for the KCar worker API. Defaults to the current deployed worker.

Auction worker:

- Copy `auction-worker/.dev.vars.example` to `auction-worker/.dev.vars` for local development.
- Set Cloudflare secrets for production: `KCAR_USER_ID`, `KCAR_USER_PW`, `SYNC_SECRET`, and optional Telegram variables.

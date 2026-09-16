# Accident-car catalogue

Public catalogue: `/damaged-cars`, reached from the Auction section. Listings are
kept separate from Encar, Kcar and our own inventory. The owner confirmed
permission to publish AL Korea listing information and photos before import.

## Credentials and scope

The production Vercel project has sensitive `ALKOREA_USERNAME` and
`ALKOREA_PASSWORD` secrets. Never prefix these with `NEXT_PUBLIC_`, save them in
source files or include upstream login/debug responses in an API. The client
only permits login and exhibition reads; no bids, purchases or profile changes.

## Refresh behaviour

The bundled snapshot makes the first catalogue and existing detail pages
available immediately. Opening the catalogue checks `/api/damaged-cars` in the
background. Successful live imports are cached for 15 minutes in the server
data cache; the public API response is cached for 5 minutes. Every catalogue
page is fetched, with bounded concurrency. This is traffic-driven refreshing,
not a scheduled job. Source failures preserve saved listings with an honest
status and timestamp. Newly listed vehicles fetch their full detail/gallery on
demand. Removed lots return 404 from the live detail API and are marked
unavailable on an already-open page; expired deadlines are never shown as active.

To rebuild the saved offline snapshot, run `npm run download:damaged` with the
two environment variables, or supply a private JSON line at the non-echoing
prompt. The importer fetches all pages, all details and all gallery links;
replaces the snapshot only after a complete successful import; and never writes
passwords, cookies, profile data or bids. Redeploy after rebuilding the snapshot.

## Data interpretation

- Preserve separate listing IDs, even when the same car has transfer and scrap lots.
- Scrap lots are explicitly labeled; road use and export eligibility are not assumed.
- Insurance total loss is distinct from a technical inspection verdict.
- Blank bid inputs, zero auction fees and pre-tax delivery values are not asking prices.
  Unpublished prices show “Price on request”; repair and shipping are not invented.
- Registration years drive catalogue filtering. Manufacture year is a separate detail field.
- Explicitly unverified current mileage stays unknown; historical mileage is not substituted.
- Missing engine sizes, VINs and airbag findings stay unknown, not zero or “clean”.
- Only public `/upload/data/` image paths are accepted. Existing image watermarks are unchanged.
- Contact drafts and shared URLs use the GHAYRAT detail link, not the supplier URL.

## Bid estimate

The detail-page bid field is a local calculator only and never calls a bidding
endpoint. Its tariff constants were verified against the source calculator on
2026-09-16: 5.5% auction commission capped at KRW 3,000,000; KRW 50,000 below
KRW 1,000,000; transfer processing of KRW 200,000 / 300,000 / 400,000 by the
current source brackets; or KRW 100,000 scrap processing plus 10% VAT. Bids use
KRW 10,000 increments. Re-verify these values before changing or extending the
calculator. Storage, transport, repairs and export clearance are deliberately
excluded from the auction total.

Checks: `npm run test:damaged-cars`, `npm run test:mobile-contact`, `npm run build`.

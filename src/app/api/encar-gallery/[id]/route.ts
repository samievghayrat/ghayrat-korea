import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const ENCAR_READSIDE_BASE = 'https://api.encar.com/v1/readside';
const ENCAR_SEARCH_URL = 'https://api.encar.com/search/car/list/general';
const ENCAR_IMAGE_CDN = 'https://ci.encar.com';
const ENCAR_HEADERS = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

interface EncarPhoto {
  type?: string;
  path?: string;
}

function positiveNumber(value: unknown): number | undefined {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function getDisplayImageUrl(path: string): string {
  const canonicalPath = path.startsWith('/carpicture/')
    ? path
    : `/carpicture${path.startsWith('/') ? path : `/${path}`}`;
  const params = new URLSearchParams({
    impolicy: 'heightRate',
    rh: '768',
    cw: '1280',
    ch: '768',
    cg: 'Center',
    wtmk: `${ENCAR_IMAGE_CDN}/wt_mark/w_mark_04.png`,
  });

  return `${ENCAR_IMAGE_CDN}${canonicalPath}?${params.toString()}`;
}

async function fetchVehicle(vehicleId: string): Promise<Response> {
  return fetch(`${ENCAR_READSIDE_BASE}/vehicle/${vehicleId}`, {
    headers: ENCAR_HEADERS,
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
}

async function resolveVehicleId(listingId: string): Promise<string | null> {
  const query = `(And.Hidden.N._.SellType.\uC77C\uBC18._.CarId.${listingId}.)`;
  const url = new URL(ENCAR_SEARCH_URL);
  url.searchParams.set('count', 'true');
  url.searchParams.set('q', query);
  url.searchParams.set('sr', '|ModifiedDate|0|1');

  const response = await fetch(url, {
    headers: ENCAR_HEADERS,
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;

  const data = await response.json();
  const result = data.SearchResults?.[0] as { Photo?: unknown } | undefined;
  if (typeof result?.Photo !== 'string') return null;

  // Encar listing IDs can differ from the internal vehicle ID used by the
  // readside gallery API. The canonical photo prefix contains that ID.
  return result.Photo.match(/\/(\d+)_?$/)?.[1] || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid car id' }, { status: 400 });
  }

  try {
    // Start the lightweight listing lookup at the same time. Most IDs work
    // directly, while newer Encar listings sometimes point at a different
    // internal vehicle ID. Parallel resolution keeps the normal path fast.
    const resolvedIdPromise = resolveVehicleId(id).catch(() => null);
    let response = await fetchVehicle(id);

    if (!response.ok) {
      const resolvedId = await resolvedIdPromise;
      if (resolvedId && resolvedId !== id) response = await fetchVehicle(resolvedId);
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Gallery unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const category = data.category || {};
    const spec = data.spec || {};
    const typeOrder: Record<string, number> = { OUTER: 0, INNER: 1, OPTION: 2 };
    const images = ((data.photos || []) as EncarPhoto[])
      .filter((photo): photo is Required<EncarPhoto> =>
        Boolean(photo.path && photo.type && photo.type in typeOrder),
      )
      .sort((a, b) => {
        const typeDifference = typeOrder[a.type] - typeOrder[b.type];
        if (typeDifference !== 0) return typeDifference;
        const aNumber = Number.parseInt(a.path.match(/_(\d+)\.\w+$/)?.[1] || '0', 10);
        const bNumber = Number.parseInt(b.path.match(/_(\d+)\.\w+$/)?.[1] || '0', 10);
        return aNumber - bNumber;
      })
      .map(photo => getDisplayImageUrl(photo.path));

    return NextResponse.json(
      {
        images,
        details: {
          yearMonth: category.yearMonth ? String(category.yearMonth) : undefined,
          mileage: positiveNumber(spec.mileage),
          displacement: positiveNumber(spec.displacement),
          hp: positiveNumber(spec.maxPower || spec.horsePower || spec.horsepower),
          fuel: spec.fuelName || undefined,
          color: spec.colorName || undefined,
          bodyType: spec.bodyName || undefined,
          transmission: spec.transmissionName || undefined,
          drivetrain: spec.drivetrainName || spec.driveTypeName || spec.driveName || undefined,
          seatCount: positiveNumber(spec.seatCount),
          vin: typeof data.vin === 'string' && data.vin.trim() ? data.vin.trim() : undefined,
        },
      },
      {
        headers: {
          // Listing galleries rarely change. Keep successful responses close
          // to visitors so the Encar readside API is not on every page load.
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=604800',
        },
      },
    );
  } catch {
    return NextResponse.json({ error: 'Gallery unavailable' }, { status: 502 });
  }
}

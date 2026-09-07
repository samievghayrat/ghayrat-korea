import { createHash } from 'node:crypto';

const PAN_AUTO_ORIGIN = 'https://pan-auto.ru';
const PAN_AUTO_USER_AGENT = 'Mozilla/5.0 (compatible; GhayratMotors/1.0; +https://ghayrat.vercel.app)';
const MAX_POW_DIFFICULTY = 5;
const MAX_POW_ATTEMPTS = 2_000_000;
const CAR_CACHE_TTL_MS = 30 * 60 * 1000;

type JsonRecord = Record<string, unknown>;

interface PanAutoChallenge {
  seed: string;
  difficulty: number;
  payload?: {
    url: string;
    offset: number;
    length: number;
    size: number;
  };
}

interface PanAutoSession {
  token: string;
  expiresAt: number;
}

export interface PanAutoCustomsReference {
  customsDuty: number;
  customsFee: number;
  utilizationFee: number;
  totalFees?: number;
}

export interface PanAutoVehicleReference {
  hp?: number;
  engineModel?: string;
  missingData?: string[];
  customsRub?: PanAutoCustomsReference;
  lowCustomsRub?: PanAutoCustomsReference;
  highCustomsRub?: PanAutoCustomsReference;
  checkedAt: string;
}

let session: PanAutoSession | null = null;
let sessionPromise: Promise<string | null> | null = null;
const carCache = new Map<string, { expiresAt: number; value: PanAutoVehicleReference | null }>();
const carPromises = new Map<string, Promise<PanAutoVehicleReference | null>>();

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function solveNonce(seed: string, difficulty: number): string | null {
  if (!Number.isInteger(difficulty) || difficulty < 0 || difficulty > MAX_POW_DIFFICULTY) {
    return null;
  }

  const prefix = '0'.repeat(difficulty);
  for (let nonce = 0; nonce < MAX_POW_ATTEMPTS; nonce += 1) {
    const digest = createHash('sha256').update(seed + String(nonce)).digest('hex');
    if (digest.startsWith(prefix)) return String(nonce);
  }
  return null;
}

async function getPayloadDigest(payload: PanAutoChallenge['payload']): Promise<string | undefined> {
  if (!payload) return undefined;
  if (
    !Number.isInteger(payload.offset)
    || !Number.isInteger(payload.length)
    || payload.offset < 0
    || payload.length <= 0
    || payload.length > 2_000_000
  ) {
    return undefined;
  }

  const sourceUrl = new URL(payload.url, PAN_AUTO_ORIGIN);
  const allowedOrigin = new URL(PAN_AUTO_ORIGIN);
  sourceUrl.protocol = allowedOrigin.protocol;
  sourceUrl.host = allowedOrigin.host;

  const response = await fetch(sourceUrl, {
    cache: 'no-store',
    headers: { 'User-Agent': PAN_AUTO_USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return undefined;

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < payload.offset + payload.length || bytes.length > 10_000_000) {
    return undefined;
  }
  const slice = bytes.subarray(payload.offset, payload.offset + payload.length);
  return createHash('sha256').update(slice).digest('hex');
}

async function requestTokenAttempt(): Promise<PanAutoSession | null> {
  const challengeResponse = await fetch(`${PAN_AUTO_ORIGIN}/api/session/challenge/`, {
    cache: 'no-store',
    headers: { 'User-Agent': PAN_AUTO_USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!challengeResponse.ok) return null;

  const challenge = await challengeResponse.json() as PanAutoChallenge;
  if (!challenge.seed || challenge.difficulty > MAX_POW_DIFFICULTY) return null;

  const nonce = solveNonce(challenge.seed, challenge.difficulty);
  if (nonce === null) return null;
  const digest = await getPayloadDigest(challenge.payload);
  if (challenge.payload && !digest) return null;

  const tokenResponse = await fetch(`${PAN_AUTO_ORIGIN}/api/session/token/`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'User-Agent': PAN_AUTO_USER_AGENT,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(digest
      ? { seed: challenge.seed, nonce, digest }
      : { seed: challenge.seed, nonce }),
    signal: AbortSignal.timeout(8000),
  });
  if (!tokenResponse.ok) return null;

  const tokenData = await tokenResponse.json() as JsonRecord;
  const token = typeof tokenData.token === 'string' ? tokenData.token : '';
  const expiresIn = toFiniteNumber(tokenData.expires_in);
  if (!token || !expiresIn) return null;

  const lifetimeMs = expiresIn * 1000;
  return {
    token,
    expiresAt: Date.now() + lifetimeMs - Math.min(300_000, lifetimeMs / 2),
  };
}

async function requestSessionToken(): Promise<string | null> {
  if (session && Date.now() < session.expiresAt) return session.token;
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    try {
      // Pan Auto's own extension retries a fresh proof-of-work challenge once;
      // a valid nonce is probabilistic and may fall beyond the two-million cap.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const nextSession = await requestTokenAttempt();
        if (nextSession) {
          session = nextSession;
          return nextSession.token;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
}

async function fetchRawVehicle(carId: string, retry = true): Promise<JsonRecord | null> {
  const token = await requestSessionToken();
  const response = await fetch(`${PAN_AUTO_ORIGIN}/api/korea/${encodeURIComponent(carId)}/`, {
    cache: 'no-store',
    headers: {
      'User-Agent': PAN_AUTO_USER_AGENT,
      Accept: 'application/json',
      ...(token ? { 'X-Session-Token': token } : {}),
    },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!response) return null;
  if (response.status === 401 && retry) {
    session = null;
    return fetchRawVehicle(carId, false);
  }
  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  return isRecord(data) ? data : null;
}

function parseMissingData(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const items = value.filter((item): item is string => typeof item === 'string');
    return items.length ? items : undefined;
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return undefined;
}

function parseRubCustoms(data: JsonRecord, key: 'costs' | 'lowCosts' | 'highCosts'): PanAutoCustomsReference | undefined {
  const costsContainer = isRecord(data[key]) ? data[key] : undefined;
  if (!costsContainer) return undefined;

  const rub = (isRecord(costsContainer.RUB) && costsContainer.RUB)
    || (isRecord(costsContainer.rub) && costsContainer.rub)
    || undefined;
  if (!rub) return undefined;

  const customsDuty = toFiniteNumber(rub.customsDuty);
  const customsFee = toFiniteNumber(rub.clearanceCost);
  const utilizationFee = toFiniteNumber(rub.utilizationFee);
  const totalFees = toFiniteNumber(rub.totalFees);
  if (customsDuty === undefined || customsFee === undefined || utilizationFee === undefined) {
    return undefined;
  }

  return {
    customsDuty: Math.round(customsDuty),
    customsFee: Math.round(customsFee),
    utilizationFee: Math.round(utilizationFee),
    totalFees: totalFees === undefined ? undefined : Math.round(totalFees),
  };
}

function parseVehicleReference(data: JsonRecord): PanAutoVehicleReference {
  const hp = toFiniteNumber(data.hp);
  const engineModel = typeof data.engineModel === 'string' && data.engineModel.trim()
    ? data.engineModel.trim()
    : undefined;

  return {
    hp: hp && hp > 0 ? Math.round(hp) : undefined,
    engineModel,
    missingData: parseMissingData(data.noData),
    customsRub: parseRubCustoms(data, 'costs'),
    lowCustomsRub: parseRubCustoms(data, 'lowCosts'),
    highCustomsRub: parseRubCustoms(data, 'highCosts'),
    checkedAt: new Date().toISOString(),
  };
}

export async function getPanAutoVehicleReference(carId: string): Promise<PanAutoVehicleReference | null> {
  if (!/^\d{6,12}$/.test(carId)) return null;

  const cached = carCache.get(carId);
  if (cached && Date.now() < cached.expiresAt) return cached.value;
  const pending = carPromises.get(carId);
  if (pending) return pending;

  const promise = fetchRawVehicle(carId)
    .then((data) => data ? parseVehicleReference(data) : null)
    .catch(() => null)
    .then((value) => {
      carCache.set(carId, { expiresAt: Date.now() + CAR_CACHE_TTL_MS, value });
      return value;
    })
    .finally(() => {
      carPromises.delete(carId);
    });

  carPromises.set(carId, promise);
  return promise;
}

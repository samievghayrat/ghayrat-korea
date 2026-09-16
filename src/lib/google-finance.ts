// The public URL redirects to the current Finance renderer. Calling /beta/quote
// directly is treated as unsupported by Google for server-side requests.
const GOOGLE_FINANCE_URL = 'https://www.google.com/finance/quote';

function parseDisplayedNumber(value: string): number | null {
  const normalized = value
    .replace(/&nbsp;|&#160;|\u00a0/g, '')
    .replace(/,/g, '')
    .replace(/[^0-9.+-]/g, '');
  const rate = Number(normalized);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

/** Extract the requested pair's main quote, avoiding unrelated market cards on the page. */
export function parseGoogleFinanceRate(html: string, base: string, quote: string): number | null {
  const pairMarker = `data-p="%.@.[null,null,[&quot;${base}&quot;,&quot;${quote}&quot;]],null,`;
  const pairIndex = html.indexOf(pairMarker);
  if (pairIndex < 0) return null;

  const quoteContainer = html.slice(pairIndex, pairIndex + 12_000);
  const match = quoteContainer.match(
    /<span\s+jsname="Pdsbrc"[^>]*>\s*<span>([^<]+)<\/span>/i,
  );
  return match ? parseDisplayedNumber(match[1]) : null;
}

export async function fetchGoogleFinanceRate(
  base: string,
  quote: string,
  timeoutMs: number,
): Promise<number> {
  const response = await fetch(`${GOOGLE_FINANCE_URL}/${base}-${quote}?hl=en`, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
      // Google sends a reduced Finance shell to generic server clients. A normal
      // browser identifier returns the same quote page visitors see in Google.
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`Google Finance returned ${response.status}`);

  const rate = parseGoogleFinanceRate(await response.text(), base, quote);
  if (!rate) throw new Error(`Google Finance did not return ${base}/${quote}`);
  return rate;
}

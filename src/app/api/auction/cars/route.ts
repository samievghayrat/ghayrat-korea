import { KCAR_API_URL } from "@/lib/kcar-auction";

export const revalidate = 300;

export async function GET(request: Request) {
  const sourceUrl = new URL("/api/cars", KCAR_API_URL);
  const incomingUrl = new URL(request.url);
  incomingUrl.searchParams.forEach((value, key) => {
    sourceUrl.searchParams.set(key, value);
  });
  if (!sourceUrl.searchParams.has("limit")) {
    sourceUrl.searchParams.set("limit", "1000");
  }

  const response = await fetch(sourceUrl.toString(), {
    next: { revalidate },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}

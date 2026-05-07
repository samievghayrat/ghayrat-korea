import { KCAR_API_URL } from "@/lib/kcar-auction";

interface RouteContext {
  params: { id: string };
}

export const revalidate = 3600;

export async function GET(_request: Request, { params }: RouteContext) {
  const sourceUrl = new URL(`/api/cars/${encodeURIComponent(params.id)}/images`, KCAR_API_URL);
  const response = await fetch(sourceUrl.toString(), {
    next: { revalidate },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

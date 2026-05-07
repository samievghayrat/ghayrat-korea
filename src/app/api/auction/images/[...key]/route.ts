import { KCAR_API_URL } from "@/lib/kcar-auction";

interface RouteContext {
  params: { key: string[] };
}

export const revalidate = 2678400;

export async function GET(_request: Request, { params }: RouteContext) {
  const key = params.key.map(encodeURIComponent).join("/");
  const response = await fetch(`${KCAR_API_URL}/api/images/${key}`, {
    next: { revalidate },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, s-maxage=2678400, stale-while-revalidate=86400",
    },
  });
}

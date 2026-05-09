import { getKCarAuctionImages } from "@/lib/kcar-auction";

interface RouteContext {
  params: { id: string };
}

export const revalidate = 3600;

export async function GET(_request: Request, { params }: RouteContext) {
  const images = await getKCarAuctionImages(params.id);

  return Response.json({ data: images }, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
    },
  });
}

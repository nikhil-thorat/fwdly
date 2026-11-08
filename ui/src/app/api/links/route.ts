import type { ApiClickStats, ApiURL } from "@/lib/api-types";
import { gatewayFetch, toNextResponse } from "@/lib/server-api";

async function getLinkClicks(id: number): Promise<number | null> {
  try {
    const response = await gatewayFetch(`/api/v1/links/${id}/analytics`);

    if (!response.ok) {
      return null;
    }

    const stats = (await response.json()) as ApiClickStats;
    return stats.total_clicks ?? 0;
  } catch {
    return null;
  }
}

export async function GET(): Promise<Response> {
  const response = await gatewayFetch("/api/v1/links");

  if (!response.ok) {
    return toNextResponse(response);
  }

  const links = (await response.json()) as ApiURL[] | null;

  if (!links) {
    return Response.json([]);
  }

  const enriched = await Promise.all(
    links.map(async (link) => ({
      ...link,
      clicks: await getLinkClicks(link.id),
    })),
  );

  return Response.json(enriched);
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();

  return toNextResponse(
    await gatewayFetch("/api/v1/links", {
      method: "POST",
      body,
    }),
  );
}

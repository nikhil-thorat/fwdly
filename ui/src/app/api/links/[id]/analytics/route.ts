import { gatewayFetch, toNextResponse } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { id } = await params;

  return toNextResponse(
    await gatewayFetch(`/api/v1/links/${encodeURIComponent(id)}/analytics`),
  );
}

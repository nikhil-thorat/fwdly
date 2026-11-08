import type { ApiURL } from "@/lib/api-types";
import {
  gatewayFetch,
  jsonError,
  toNextResponse,
} from "@/lib/server-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function findLink(id: string): Promise<{
  response: Response;
  link: ApiURL | null;
}> {
  const response = await gatewayFetch("/api/v1/links");

  if (!response.ok) {
    return { response, link: null };
  }

  const links = (await response.json()) as ApiURL[];
  const link = links.find((item) => String(item.id) === id) ?? null;

  return { response, link };
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { id } = await params;
  const { response, link } = await findLink(id);

  if (!response.ok) {
    return toNextResponse(response);
  }

  if (!link) {
    return jsonError("Link not found.", 404);
  }

  return Response.json(link);
}

export async function PUT(
  request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { id } = await params;
  const { response, link } = await findLink(id);

  if (!response.ok) {
    return toNextResponse(response);
  }

  if (!link) {
    return jsonError("Link not found.", 404);
  }

  const body = await request.text();

  return toNextResponse(
    await gatewayFetch(`/api/v1/links/${encodeURIComponent(link.short_code)}`, {
      method: "PUT",
      body,
    }),
  );
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { id } = await params;
  const { response, link } = await findLink(id);

  if (!response.ok) {
    return toNextResponse(response);
  }

  if (!link) {
    return jsonError("Link not found.", 404);
  }

  return toNextResponse(
    await gatewayFetch(`/api/v1/links/${encodeURIComponent(link.short_code)}`, {
      method: "DELETE",
    }),
  );
}

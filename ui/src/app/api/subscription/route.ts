import { gatewayFetch, toNextResponse } from "@/lib/server-api";

export async function GET(): Promise<Response> {
  return toNextResponse(await gatewayFetch("/api/v1/subscription"));
}

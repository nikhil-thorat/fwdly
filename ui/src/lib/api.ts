export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || `API Error: ${response.status}`;

    try {
      const parsed = JSON.parse(errorText) as { error?: string };
      if (parsed.error) {
        message = parsed.error;
      }
    } catch {
      // Keep the raw response text.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

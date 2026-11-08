"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchWithAuth } from "@/lib/api";
import type { ApiURL } from "@/lib/api-types";
import type { ShortLink } from "@/lib/mock-data";

export function mapApiUrlToShortLink(raw: ApiURL): ShortLink {
  const isExpired = raw.expires_at
    ? new Date(raw.expires_at) < new Date()
    : false;

  return {
    id: String(raw.id),
    slug: raw.short_code,
    shortUrl: `fwdly.link/${raw.short_code}`,
    originalUrl: raw.original_url,
    clicks: raw.clicks ?? 0,
    createdAt: new Date(raw.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    status: isExpired ? "disabled" : "active",
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useLinks() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async (): Promise<ShortLink[]> => {
    const data = await fetchWithAuth<ApiURL[]>("/api/links");
    return (data ?? []).map(mapApiUrlToShortLink);
  }, []);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setLinks(await fetchLinks());
    } catch (err) {
      console.error("[useLinks] Failed to fetch links:", err);
      setError(getErrorMessage(err, "Failed to load links."));
    } finally {
      setIsLoading(false);
    }
  }, [fetchLinks]);

  const createLink = useCallback(
    async (originalUrl: string, customSlug?: string) => {
      const raw = await fetchWithAuth<ApiURL>("/api/links", {
        method: "POST",
        body: JSON.stringify({
          original_url: originalUrl,
          custom_code: customSlug || undefined,
        }),
      });

      const formatted = mapApiUrlToShortLink(raw);
      setLinks((prev) => [formatted, ...prev]);

      return formatted;
    },
    [],
  );

  const deleteLink = useCallback(async (id: string) => {
    await fetchWithAuth<void>(`/api/links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchLinks()
      .then((data) => {
        if (!cancelled) {
          setLinks(data);
        }
      })
      .catch((err) => {
        console.error("[useLinks] Failed to fetch links:", err);
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load links."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchLinks]);

  return {
    links,
    isLoading,
    error,
    refetch: loadLinks,
    createLink,
    deleteLink,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import type { ShortLink } from "@/lib/mock-data";

export interface BackendURL {
  id: number;
  short_code: string;
  original_url: string;
  user_id?: string | null;
  created_at: string;
  expires_at?: string | null;
  clicks?: number; // Calculated or joined from analytics
}

function mapBackendUrlToShortLink(raw: BackendURL): ShortLink {
  const isExpired = raw.expires_at
    ? new Date(raw.expires_at) < new Date()
    : false;

  return {
    id: String(raw.id),
    slug: raw.short_code,
    shortUrl: `fwdly.link/${raw.short_code}`,
    originalUrl: raw.original_url,
    clicks: raw.clicks || 0,
    createdAt: new Date(raw.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    status: isExpired ? "disabled" : "active",
  };
}

export function useLinks() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth<BackendURL[]>("/api/v1/links");
      const mapped = (data || []).map(mapBackendUrlToShortLink);
      setLinks(mapped);
    } catch (err: any) {
      console.error("[useLinks] Failed to fetch links:", err);
      setError(err.message || "Failed to load links from server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLink = async (originalUrl: string, customSlug?: string) => {
    try {
      const rawNewLink = await fetchWithAuth<BackendURL>("/api/v1/links", {
        method: "POST",
        body: JSON.stringify({
          original_url: originalUrl,
          short_code: customSlug || undefined,
        }),
      });

      const formatted = mapBackendUrlToShortLink(rawNewLink);
      setLinks((prev) => [formatted, ...prev]);
      return formatted;
    } catch (err: any) {
      console.error("[useLinks] Failed to create link:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  return { links, isLoading, error, refetch: loadLinks, createLink };
}

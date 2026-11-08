"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, fetchWithAuth } from "@/lib/api";
import type { ApiClickStats, ApiURL } from "@/lib/api-types";
import type { ShortLink } from "@/lib/mock-data";

import { mapApiUrlToShortLink } from "./use-links";

type AnalyticsResult = {
  link: ShortLink;
  analytics: ApiClickStats;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useLinkAnalytics(id: string) {
  const [link, setLink] = useState<ShortLink | null>(null);
  const [analytics, setAnalytics] = useState<ApiClickStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchAnalytics = useCallback(async (): Promise<AnalyticsResult> => {
    const rawLink = await fetchWithAuth<ApiURL>(`/api/links/${id}`);
    const rawStats = await fetchWithAuth<ApiClickStats>(
      `/api/links/${id}/analytics`,
    );

    return {
      link: mapApiUrlToShortLink(rawLink),
      analytics: {
        ...rawStats,
        time_series: rawStats.time_series ?? [],
        top_referrers: rawStats.top_referrers ?? [],
      },
    };
  }, [id]);

  const loadLinkAnalytics = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const result = await fetchAnalytics();
      setLink(result.link);
      setAnalytics(result.analytics);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setLink(null);
        setAnalytics(null);
        setNotFound(true);
      } else {
        console.error("[useLinkAnalytics] Error fetching link:", err);
        setError(getErrorMessage(err, "Failed to load link analytics."));
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchAnalytics, id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    fetchAnalytics()
      .then((result) => {
        if (!cancelled) {
          setLink(result.link);
          setAnalytics(result.analytics);
          setNotFound(false);
        }
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError && err.status === 404) {
          setLink(null);
          setAnalytics(null);
          setNotFound(true);
        } else {
          console.error("[useLinkAnalytics] Error fetching link:", err);
          setError(getErrorMessage(err, "Failed to load link analytics."));
          setNotFound(false);
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
  }, [fetchAnalytics, id]);

  return {
    link,
    analytics,
    isLoading,
    error,
    notFound,
    refetch: loadLinkAnalytics,
  };
}

"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  MousePointerClick,
  Users,
} from "lucide-react";

import { CopyButton } from "@/components/shortener";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApiClickStats } from "@/lib/api-types";
import { formatNumber, type ShortLink } from "@/lib/mock-data";

import { ClickChart } from "./click-chart";
import { StatCard } from "./stat-card";

function buildDailySeries(
  points: ApiClickStats["time_series"],
  days: number,
): { values: number[]; labels: string[] } {
  const byDate = new Map<string, number>();

  for (const point of points ?? []) {
    byDate.set(point.date, point.clicks);
  }

  const values: number[] = [];
  const labels: string[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - offset);

    const key = day.toISOString().slice(0, 10);
    values.push(byDate.get(key) ?? 0);
    labels.push(
      day.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
      }),
    );
  }

  return { values, labels };
}

export function LinkAnalytics({
  link,
  analytics,
}: {
  link: ShortLink;
  analytics: ApiClickStats;
}) {
  const trend30 = buildDailySeries(analytics.time_series, 30);
  const trend7 = buildDailySeries(analytics.time_series, 7);

  const averageDailyClicks = Math.round(
    trend30.values.reduce((sum, clicks) => sum + clicks, 0) / 30,
  );
  const uniquePercent =
    analytics.total_clicks > 0
      ? ((analytics.unique_clicks / analytics.total_clicks) * 100).toFixed(1)
      : "0.0";

  const referrers = analytics.top_referrers ?? [];
  const referrerTotal = referrers.reduce((sum, item) => sum + item.clicks, 0);

  const stats = [
    {
      label: "Total clicks",
      value: formatNumber(analytics.total_clicks),
      detail: "All time",
      icon: MousePointerClick,
      signal: true,
    },
    {
      label: "Unique visitors",
      value: formatNumber(analytics.unique_clicks),
      detail: `${uniquePercent}% of clicks`,
      icon: Users,
    },
    {
      label: "Avg. daily clicks",
      value: formatNumber(averageDailyClicks),
      detail: "Last 30 days",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back to overview
        </Link>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-medium tracking-[-0.03em] md:text-4xl">
                fwdly.link/
                <span className="text-signal">{link.slug}</span>
              </h1>
              <CopyButton
                value={`https://${link.shortUrl}`}
                className="h-10 bg-card px-3 text-sm"
              />
            </div>

            <a
              href={link.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex max-w-2xl items-start gap-1.5 font-mono text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <ArrowUpRight
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0"
              />
              <span className="truncate">{link.originalUrl}</span>
            </a>

            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Created {link.createdAt}
            </p>
          </div>

          <div className="flex h-10 items-center gap-2 border border-border bg-card px-3">
            <Badge
              variant="secondary"
              className={
                link.status === "active"
                  ? "gap-1.5 text-xs text-signal"
                  : "gap-1.5 text-xs text-muted-foreground"
              }
            >
              <span
                aria-hidden="true"
                className={
                  link.status === "active"
                    ? "size-1.5 bg-signal"
                    : "size-1.5 bg-muted-foreground"
                }
              />
              {link.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="border border-border bg-card shadow-none ring-0 lg:col-span-2">
          <Tabs defaultValue="30d" className="gap-6">
            <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <CardTitle className="text-base">Click activity</CardTitle>
              <TabsList>
                <TabsTrigger value="30d">30 days</TabsTrigger>
                <TabsTrigger value="7d">7 days</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="30d" className="mt-0">
                <ClickChart data={trend30.values} labels={trend30.labels} />
              </TabsContent>
              <TabsContent value="7d" className="mt-0">
                <ClickChart data={trend7.values} labels={trend7.labels} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <Card className="border border-border bg-card shadow-none ring-0">
          <CardHeader>
            <CardTitle className="text-base">Referrers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {referrers.length === 0 ? (
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                No referrer data yet.
              </p>
            ) : (
              referrers.map((item) => {
                const percent =
                  referrerTotal > 0
                    ? Math.round((item.clicks / referrerTotal) * 100)
                    : 0;
                const label = item.referrer.trim() || "Unknown";

                return (
                  <div key={label}>
                    <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-wider">
                      <span>{label}</span>
                      <span className="text-muted-foreground">{percent}%</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-muted">
                      <div
                        className="h-full bg-signal"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

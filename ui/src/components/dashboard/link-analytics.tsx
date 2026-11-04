"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  MapPin,
  MousePointerClick,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ClickChart } from "./click-chart";
import { StatCard } from "./stat-card";
import { CopyButton } from "@/components/shortener";
import {
  browsers,
  clickTrend30,
  clickTrend7,
  formatNumber,
  platforms,
  referrers,
  trendLabels30,
  trendLabels7,
  type BreakdownItem,
  type ShortLink,
} from "@/lib/mock-data";

function BreakdownList({
  title,
  items,
}: {
  title: string;
  items: BreakdownItem[];
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-5 space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-wider">
              <span>{item.label}</span>
              <span className="text-muted-foreground">{item.value}%</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted">
              <div
                className="h-full bg-signal"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LinkAnalytics({ link }: { link: ShortLink }) {
  const [enabled, setEnabled] = useState(link.status === "active");
  const uniqueVisitors = Math.round(link.clicks * 0.735);
  const averageDailyClicks = Math.round(
    clickTrend30.reduce((total, clicks) => total + clicks, 0) /
      clickTrend30.length,
  );

  const stats = [
    {
      label: "Total clicks",
      value: formatNumber(link.clicks),
      detail: "All time",
      icon: MousePointerClick,
      signal: true,
    },
    {
      label: "Unique visitors",
      value: formatNumber(uniqueVisitors),
      detail: "73.5% of clicks",
      icon: Users,
    },
    {
      label: "Avg. daily clicks",
      value: formatNumber(averageDailyClicks),
      detail: "Last 30 days",
      icon: BarChart3,
    },
    {
      label: "Top country",
      value: "India",
      detail: "38% of visitors",
      icon: MapPin,
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
            <Switch
              id="link-enabled"
              aria-label="Enable link"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label
              htmlFor="link-enabled"
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              {enabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
                <ClickChart data={clickTrend30} labels={trendLabels30} />
              </TabsContent>
              <TabsContent value="7d" className="mt-0">
                <ClickChart data={clickTrend7} labels={trendLabels7} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <Card className="border border-border bg-card shadow-none ring-0">
          <CardHeader>
            <CardTitle className="text-base">Referrers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {referrers.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-wider">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.value}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-muted">
                  <div
                    className="h-full bg-signal"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-none ring-0 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Browsers & platforms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-10 md:grid-cols-2">
            <BreakdownList title="Browser" items={browsers} />
            <BreakdownList title="Platform" items={platforms} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

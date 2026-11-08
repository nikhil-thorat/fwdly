"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Link2,
  MousePointerClick,
  Plus,
  Radio,
  Trash2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardTabs } from "./dashboard-tabs";
import { StatCard } from "./stat-card";
import {
  formatCompact,
  formatNumber,
  type ShortLink,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLinks } from "@/hooks/use-links";

function GetProCard() {
  return (
    <Card
      size="sm"
      className="gap-3 border-primary bg-primary px-6 py-6 text-primary-foreground shadow-none ring-0"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary-foreground/70">
          Pro
        </p>
        <p className="font-heading text-3xl font-medium leading-none tracking-[-0.035em]">
          $5
          <span className="ml-1 text-sm font-normal text-primary-foreground/70">
            /mo
          </span>
        </p>
      </div>
      <p className="text-xs leading-snug text-primary-foreground/75">
        More links, custom slugs & analytics.
      </p>
      <Link
        href="/#pricing"
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "w-full gap-1.5",
        )}
      >
        Get Pro
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </Card>
  );
}

export function DashboardOverview() {
  const { data: session } = useSession();
  const { links, isLoading, error, createLink, deleteLink } = useLinks();
  const [destination, setDestination] = useState("");
  const [alias, setAlias] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isPro = session?.user?.tier === "pro";
  const activeLinks = links.filter((link) => link.status === "active").length;
  const totalClicks = links.reduce(
    (total, link) => total + (link.clicks ?? 0),
    0,
  );
  const hasClickData = links.some((link) => link.clicks !== null);

  const stats: {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    signal?: boolean;
  }[] = [
    {
      label: "Total links",
      value: formatNumber(links.length),
      detail: `${formatNumber(activeLinks)} active`,
      icon: Link2,
    },
    {
      label: "Active links",
      value: formatNumber(activeLinks),
      detail: `${formatNumber(links.length - activeLinks)} disabled`,
      icon: Radio,
      signal: true,
    },
    {
      label: "Total clicks",
      value: hasClickData ? formatCompact(totalClicks) : "—",
      detail: hasClickData ? "Across all links" : "Not available yet",
      icon: MousePointerClick,
    },
    ...(isPro
      ? [
          {
            label: "Clicks / link",
            value: hasClickData
              ? formatCompact(
                  Math.round(totalClicks / Math.max(links.length, 1)),
                )
              : "—",
            detail: "All-time average",
            icon: BarChart3,
          },
        ]
      : []),
  ];

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!destination.trim()) {
      setMessage("Add a destination URL first.");
      return;
    }

    const normalized = /^https?:\/\//i.test(destination.trim())
      ? destination.trim()
      : `https://${destination.trim()}`;

    setIsSubmitting(true);
    setMessage("");

    try {
      const created = await createLink(
        normalized,
        isPro ? alias.trim() || undefined : undefined,
      );
      setDestination("");
      setAlias("");
      setMessage(`Created ${created.shortUrl}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyLink(link: ShortLink) {
    try {
      await navigator.clipboard.writeText(`https://${link.shortUrl}`);
      setCopiedId(link.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteLink(id);
      setMessage("Link deleted.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to delete the link.",
      );
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-medium leading-none tracking-[-0.035em] md:text-4xl">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"}.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Your links, clicks, and traffic at a glance.
        </p>
        <DashboardTabs
          className="mt-10"
          analyticsHref={
            links[0] ? `/dashboard/links/${links[0].id}` : undefined
          }
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
        {isPro ? null : <GetProCard />}
      </div>

      <Card
        id="create-link"
        className="border border-border bg-card shadow-none ring-0"
      >
        <CardHeader>
          <CardTitle className="text-base">Create a link</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreate}
            noValidate
            className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto] lg:items-end"
          >
            <div>
              <Label htmlFor="destination" className="mb-1.5 text-sm">
                Destination URL
              </Label>
              <Input
                id="destination"
                type="url"
                inputMode="url"
                autoComplete="url"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="https://example.com/a/very/long/path"
                className="h-10 border border-border bg-background px-3 text-base focus-visible:border-signal"
              />
            </div>

            <div>
              <Label htmlFor="alias" className="mb-1.5 text-sm">
                Custom alias{" "}
                <span className="font-normal normal-case tracking-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <div className="flex h-10 items-stretch border border-border bg-background transition-colors focus-within:border-signal">
                <span className="flex items-center border-r border-border px-2 font-mono text-xs text-muted-foreground">
                  fwdly.link/
                </span>
                <Input
                  id="alias"
                  value={alias}
                  onChange={(event) => setAlias(event.target.value)}
                  placeholder={isPro ? "launch-2026" : "Pro only"}
                  disabled={!isPro}
                  className="h-full border-0 px-2 font-mono text-sm focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Plus aria-hidden="true" className="size-4" />
              )}
              Create link
            </Button>
          </form>

          {message ? (
            <p
              aria-live="polite"
              className={cn(
                "mt-4 font-mono text-xs uppercase tracking-wider",
                message.startsWith("Created")
                  ? "text-signal"
                  : "text-muted-foreground",
              )}
            >
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card
        id="recent-links"
        className="border border-border bg-card shadow-none ring-0"
      >
        <CardHeader>
          <CardTitle className="text-base">Recent links</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Short link</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin text-signal"
                      />
                      <span>Loading links from server...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center font-mono text-xs uppercase tracking-widest text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="pl-5">
                      <Link
                        href={`/dashboard/links/${link.id}`}
                        className="group inline-flex items-center gap-2 font-mono text-sm text-foreground transition-colors hover:text-signal"
                      >
                        <Link2
                          aria-hidden="true"
                          className="size-3.5 text-muted-foreground transition-colors group-hover:text-signal"
                        />
                        {link.shortUrl}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        title={link.originalUrl}
                        className="block max-w-[20rem] truncate font-mono text-sm text-muted-foreground"
                      >
                        {link.originalUrl}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm tabular-nums">
                        {link.clicks === null ? "—" : formatNumber(link.clicks)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "gap-1.5 text-xs",
                          link.status === "active"
                            ? "text-signal"
                            : "text-muted-foreground",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5",
                            link.status === "active"
                              ? "bg-signal"
                              : "bg-muted-foreground",
                          )}
                        />
                        {link.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => copyLink(link)}
                          aria-label={`Copy ${link.shortUrl}`}
                          title="Copy link"
                        >
                          {copiedId === link.id ? (
                            <Check aria-hidden="true" className="text-signal" />
                          ) : (
                            <Copy aria-hidden="true" />
                          )}
                        </Button>
                        <Link
                          href={`/dashboard/links/${link.id}`}
                          aria-label={`View analytics for ${link.shortUrl}`}
                          title="View analytics"
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "icon-xs",
                            }),
                          )}
                        >
                          <BarChart3 aria-hidden="true" />
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(link.id)}
                          aria-label={`Delete ${link.shortUrl}`}
                          title="Delete link"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}

              {!isLoading && !error && links.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    No links yet. Create one above.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

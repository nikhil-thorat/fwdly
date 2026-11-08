"use client";

import Link from "next/link";
import { use } from "react";
import { AlertCircle, Link2Off, Loader2 } from "lucide-react";

import { LinkAnalytics } from "@/components/dashboard/link-analytics";
import { buttonVariants } from "@/components/ui/button";
import { useLinkAnalytics } from "@/hooks/use-link-analytics";

export default function LinkAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { link, analytics, isLoading, error, notFound } = useLinkAnalytics(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center space-x-2 font-mono text-xs uppercase text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-signal" />
        <span>Loading link analytics...</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 text-center">
        <div className="flex size-12 items-center justify-center border border-border bg-card">
          <Link2Off aria-hidden="true" className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-medium tracking-[-0.02em]">
            Link not found
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            This link may have been deleted, or it belongs to another account.
          </p>
        </div>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          Back to overview
        </Link>
      </div>
    );
  }

  if (error || !link || !analytics) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3 text-center font-mono text-xs text-destructive">
        <AlertCircle className="size-6" />
        <span>{error || "Failed to load link analytics."}</span>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          Back to overview
        </Link>
      </div>
    );
  }

  return <LinkAnalytics link={link} analytics={analytics} />;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  href?: string;
  isActive: (pathname: string) => boolean;
};

function buildTabs(analyticsHref?: string): Tab[] {
  return [
    {
      label: "Overview",
      href: "/dashboard",
      isActive: (pathname) => pathname === "/dashboard",
    },
    {
      label: "Analytics",
      href: analyticsHref,
      isActive: (pathname) => pathname.startsWith("/dashboard/links"),
    },
  ];
}

function tabClasses(active: boolean): string {
  return cn(
    "relative -mb-px inline-flex h-10 items-center border-b-2 font-mono text-xs font-medium uppercase tracking-widest outline-none transition-colors focus-visible:ring-2 focus-visible:ring-signal/70",
    active
      ? "border-signal text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );
}

function Tabs({
  className,
  analyticsHref,
}: {
  className?: string;
  analyticsHref?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard views"
      className={cn("flex items-center gap-6 border-b border-border", className)}
    >
      {buildTabs(analyticsHref).map((tab) => {
        const active = tab.isActive(pathname);

        if (!tab.href) {
          return (
            <span
              key={tab.label}
              aria-disabled="true"
              className={cn(tabClasses(active), "cursor-not-allowed opacity-50")}
            >
              {tab.label}
            </span>
          );
        }

        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={tabClasses(active)}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function TabsFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-6 border-b border-border", className)}
    >
      {["Overview", "Analytics"].map((label) => (
        <span
          key={label}
          className="inline-flex h-10 items-center border-b-2 border-transparent font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function DashboardTabs({
  className,
  analyticsHref,
}: {
  className?: string;
  analyticsHref?: string;
}) {
  return (
    <Suspense fallback={<TabsFallback className={className} />}>
      <Tabs className={className} analyticsHref={analyticsHref} />
    </Suspense>
  );
}

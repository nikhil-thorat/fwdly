"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { mockLinks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/dashboard",
    label: "Overview",
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    href: `/dashboard/links/${mockLinks[0].id}`,
    label: "Analytics",
    isActive: (pathname: string) => pathname.startsWith("/dashboard/links"),
  },
];

function Tabs({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard views"
      className={cn(
        "flex items-center gap-6 border-b border-border",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.isActive(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative -mb-px inline-flex h-10 items-center border-b-2 font-mono text-xs font-medium uppercase tracking-widest outline-none transition-colors focus-visible:ring-2 focus-visible:ring-signal/70",
              active
                ? "border-signal text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
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
      className={cn(
        "flex items-center gap-6 border-b border-border",
        className,
      )}
    >
      {tabs.map((tab) => (
        <span
          key={tab.href}
          className="inline-flex h-10 items-center border-b-2 border-transparent font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          {tab.label}
        </span>
      ))}
    </div>
  );
}

export function DashboardTabs({ className }: { className?: string }) {
  return (
    <Suspense fallback={<TabsFallback className={className} />}>
      <Tabs className={className} />
    </Suspense>
  );
}

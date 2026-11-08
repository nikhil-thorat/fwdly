"use client";

import Link from "next/link";

import { ProfileMenu } from "@/components/profile-menu";
import { Wordmark } from "@/components/wordmark";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="fwdly home"
          className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <Wordmark />
        </Link>

        <ProfileMenu />
      </div>
    </header>
  );
}

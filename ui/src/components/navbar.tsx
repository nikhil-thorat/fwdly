"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import { ProfileMenu } from "./profile-menu";
import { buttonVariants } from "./ui/button";
import { Wordmark } from "./wordmark";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="fwdly home"
          className="rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <Wordmark />
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-8 text-sm md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {isAuthenticated ? (
            <ProfileMenu showDashboard />
          ) : (
            <Link
              href="/auth"
              className={cn(
                buttonVariants({ size: "sm" }),
                "focus-visible:ring-offset-4 focus-visible:ring-offset-background",
              )}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

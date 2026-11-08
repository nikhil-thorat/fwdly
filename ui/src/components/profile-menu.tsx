"use client";

import { Menu } from "@base-ui/react/menu";
import { signOut, useSession } from "next-auth/react";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name?: string | null): string {
  if (!name) {
    return "FU";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "FU";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const menuItemClass =
  "flex cursor-default select-none items-center gap-2 px-3 py-2 text-sm outline-none data-highlighted:bg-muted data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50";

export function ProfileMenu({ showDashboard = false }: { showDashboard?: boolean }) {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  const name = user.name ?? "fwdly user";
  const email = user.email;
  const isPro = user.tier === "pro";

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Open account menu for ${name}`}
        className="group flex items-center gap-2 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <Avatar
          className={cn("size-9", isPro && "border-signal/50")}
        >
          {user.image ? <AvatarImage src={user.image} alt={name} /> : null}
          <AvatarFallback
            className={cn(
              "text-xs",
              isPro && "bg-signal text-primary-foreground",
            )}
          >
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          align="end"
          sideOffset={8}
          className="z-50 outline-none"
        >
          <Menu.Popup className="min-w-60 origin-[var(--transform-origin)] border border-border bg-popover p-1 text-popover-foreground shadow-none outline-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            <div className="border-b border-border px-3 py-2.5">
              <p className="truncate text-sm font-medium">{name}</p>
              {email ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {email}
                </p>
              ) : null}
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {isPro ? "Pro plan" : "Basic plan"}
              </p>
            </div>

            {showDashboard ? (
              <Menu.LinkItem
                href="/dashboard"
                closeOnClick
                className={menuItemClass}
              >
                <LayoutDashboard aria-hidden="true" className="size-4" />
                Dashboard
              </Menu.LinkItem>
            ) : null}

            <Menu.LinkItem
              href="/#pricing"
              closeOnClick
              className={cn(
                menuItemClass,
                !isPro &&
                  "bg-primary text-primary-foreground data-highlighted:bg-primary/85 data-highlighted:text-primary-foreground",
              )}
            >
              {isPro ? (
                <CreditCard aria-hidden="true" className="size-4" />
              ) : (
                <Sparkles aria-hidden="true" className="size-4" />
              )}
              {isPro ? "Manage subscription" : "Get Pro"}
            </Menu.LinkItem>

            <Menu.Separator className="my-1 h-px bg-border" />

            <Menu.Item
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn(
                menuItemClass,
                "text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive",
              )}
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

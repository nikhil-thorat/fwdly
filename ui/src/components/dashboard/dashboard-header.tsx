import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wordmark } from "@/components/wordmark";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const isPro = currentUser.plan === "pro";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          aria-label="fwdly home"
          className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <Wordmark />
        </Link>

        <Avatar
          aria-label={currentUser.name}
          className={cn("size-9", isPro && "border-signal/50")}
        >
          <AvatarFallback
            className={cn(
              "text-xs",
              isPro && "bg-signal text-primary-foreground",
            )}
          >
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

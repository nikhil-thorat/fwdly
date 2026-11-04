import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  signal = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  signal?: boolean;
}) {
  return (
    <Card
      size="sm"
      className="justify-between gap-4 border border-border bg-card px-6 py-6 shadow-none ring-0"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        <Icon
          aria-hidden="true"
          strokeWidth={1.5}
          className={cn(
            "size-4 shrink-0",
            signal ? "text-signal" : "text-muted-foreground",
          )}
        />
      </div>
      <p className="font-heading text-3xl font-medium leading-none tracking-[-0.035em] tabular-nums">
        {value}
      </p>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {detail}
      </p>
    </Card>
  );
}

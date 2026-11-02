import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="font-heading text-[1.3rem] font-semibold leading-none tracking-[-0.045em]">
        fwdly<span className="text-primary">.</span>
      </span>
    </span>
  );
}

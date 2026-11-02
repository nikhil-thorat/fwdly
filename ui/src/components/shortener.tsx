"use client";

import { useId, useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function Shortener() {
  const id = useId();

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      noValidate
      className="max-w-xl"
    >
      <label htmlFor={id} className="sr-only">
        Your long URL
      </label>
      <div className="flex items-stretch gap-1.5 border border-border bg-background p-1.5 transition-colors focus-within:border-signal/70">
        <Input
          id={id}
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="Paste a long URL"
          className="ml-2 h-11 flex-1 border-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-transparent"
        />
        <Button type="submit" size="lg" className="shrink-0">
          Shorten
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        No account needed. Guest links stay live for 7 days.
      </p>
    </form>
  );
}

export function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy ${value}`}
      className={cn(
        "inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-signal/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        className,
      )}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-3.5 text-signal" />
      ) : (
        <Copy aria-hidden="true" className="size-3.5" />
      )}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

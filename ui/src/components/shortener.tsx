"use client";

import { useId, useState } from "react";
import { ArrowRight, Check, Copy, Loader2 } from "lucide-react";

import { fetchWithAuth } from "@/lib/api";
import type { ApiURL } from "@/lib/api-types";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Shortener() {
  const id = useId();
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = url.trim();

    if (!value) {
      setError("Add a URL first.");
      return;
    }

    const normalized = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

    setIsSubmitting(true);
    setError(null);
    setShortUrl(null);

    try {
      const link = await fetchWithAuth<ApiURL>("/api/links", {
        method: "POST",
        body: JSON.stringify({ original_url: normalized }),
      });

      setShortUrl(`fwdly.link/${link.short_code}`);
      setUrl("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to shorten the link.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-xl">
      <label htmlFor={id} className="sr-only">
        Your long URL
      </label>
      <div className="flex items-stretch gap-1.5 border border-border bg-background p-1.5 transition-colors focus-within:border-signal/70">
        <Input
          id={id}
          type="url"
          inputMode="url"
          autoComplete="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste a long URL"
          className="ml-2 h-11 flex-1 border-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-transparent"
        />
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="shrink-0"
        >
          {isSubmitting ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <ArrowRight aria-hidden="true" />
          )}
          Shorten
        </Button>
      </div>

      {shortUrl ? (
        <div className="mt-3 flex items-center justify-between gap-3 border border-border bg-card px-3 py-2">
          <span className="truncate font-mono text-sm text-foreground">
            {shortUrl}
          </span>
          <CopyButton value={`https://${shortUrl}`} />
        </div>
      ) : null}

      {error ? (
        <p
          aria-live="polite"
          className="mt-3 font-mono text-xs uppercase tracking-wider text-destructive"
        >
          {error}
        </p>
      ) : null}

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

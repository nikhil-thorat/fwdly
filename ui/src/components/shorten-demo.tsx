"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "./shortener";
import { cn } from "@/lib/utils";

const LONG_URL = "yourbrand.com/summer-campaign?utm=news";
const SHORT_URL = "fwdly.link/x7Kp2q";

type Phase = "typing" | "shortening" | "done";

export function ShortenDemo() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function applyPreference() {
      if (media.matches) {
        setReducedMotion(true);
        setTyped(LONG_URL.length);
        setPhase("done");
      } else {
        setReducedMotion(false);
      }
    }

    applyPreference();
    media.addEventListener("change", applyPreference);
    return () => media.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let timeout: number;

    if (phase === "typing") {
      if (typed < LONG_URL.length) {
        timeout = window.setTimeout(() => setTyped((count) => count + 1), 28);
      } else {
        timeout = window.setTimeout(() => setPhase("shortening"), 700);
      }
    } else if (phase === "shortening") {
      timeout = window.setTimeout(() => setPhase("done"), 900);
    } else {
      timeout = window.setTimeout(() => {
        setTyped(0);
        setPhase("typing");
      }, 3200);
    }

    return () => window.clearTimeout(timeout);
  }, [phase, typed, reducedMotion]);

  const isTyping = phase === "typing";
  const isShortening = phase === "shortening";
  const isDone = phase === "done";

  return (
    <div className="relative">
      <div className="relative flex items-center gap-2 overflow-hidden border border-border bg-background/50 py-1.5 pl-3 pr-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
          {LONG_URL.slice(0, typed)}
          {isTyping ? (
            <span
              aria-hidden="true"
              className="demo-caret ml-0.5 inline-block h-3 w-px translate-y-0.5 bg-signal"
            />
          ) : null}
        </span>
        <span
          className={cn(
            "shrink-0 px-2 py-1 text-[10px] font-medium text-center transition-colors duration-300",
            isShortening
              ? "bg-signal text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          Shorten
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-signal/10 transition-opacity duration-300",
            isShortening ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      <div aria-hidden="true" className="relative my-5 h-6">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <span
          className={cn(
            "absolute left-0 top-1/2 h-px -translate-y-1/2 bg-signal transition-[width] duration-700 ease-out",
            isTyping ? "w-0" : "w-full",
          )}
        />
        <span
          className={cn(
            "absolute top-1/2 size-1.5 -translate-y-1/2 bg-signal transition-[left,opacity] duration-700 ease-out",
            isTyping ? "left-0 opacity-0" : "left-[calc(100%-6px)] opacity-100",
          )}
        />
        <span className="absolute left-0 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 border border-border bg-background" />
        <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 border border-border bg-background" />
      </div>

      <div
        inert={!isDone}
        className={cn(
          "flex items-center justify-between gap-3 transition-all duration-500",
          isDone ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        <span className="font-mono text-sm text-foreground">{SHORT_URL}</span>
        <CopyButton value={`https://${SHORT_URL}`} />
      </div>
    </div>
  );
}

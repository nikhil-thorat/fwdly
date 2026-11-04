"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Wordmark } from "@/components/wordmark";
import { getSession, signIn } from "next-auth/react";

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
    >
      <path
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.6A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.4 13.92a6.02 6.02 0 0 1 0-3.84v-2.6H3.06a10 10 0 0 0 0 9.04l3.34-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 2.96 14.7 2 12 2a10 10 0 0 0-8.94 5.48l3.34 2.6C7.19 7.71 9.4 5.95 12 5.95Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthForm() {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleGoogleSignIn = async () => {
    console.log("--> [Client] Google sign-in button clicked");
    if (!agreed) return;
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
      console.log(getSession());
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        href="/"
        aria-label="fwdly home"
        className="inline-flex outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <Wordmark />
      </Link>

      <h1 className="mt-12 font-heading text-[clamp(2.4rem,6vw,3rem)] font-medium leading-[1.02] tracking-[-0.035em]">
        Welcome to{" "}
        <span className="font-semibold tracking-[-0.045em]">
          fwdly<span className="text-primary">.</span>
        </span>
      </h1>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Sign in to keep your links working, claim a slug people remember, and
        watch every click as it happens.
      </p>

      <ul className="mt-6 space-y-3 text-sm">
        {[
          "Links stay live after the 7-day guest limit",
          "Custom slugs like fwdly.link/launch",
          "Click, referrer, and device telemetry in real time",
        ].map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <Check
              aria-hidden="true"
              strokeWidth={2}
              className="mt-0.5 size-3.5 shrink-0 text-signal"
            />
            <span className="text-foreground/90">{benefit}</span>
          </li>
        ))}
      </ul>

      <label
        htmlFor="terms"
        className="mt-8 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground"
      >
        <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
        <span>
          I accept the{" "}
          <Link
            href="#"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>{" "}
          &{" "}
          <Link
            href="#"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <Button
        type="button"
        size="lg"
        disabled={!agreed}
        onClick={handleGoogleSignIn}
        className="mt-6 w-full gap-3 px-4"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <GoogleMark />
            Continue with Google
            <ArrowRight
              aria-hidden="true"
              className="ml-auto size-4 text-primary-foreground/70"
            />
          </>
        )}
      </Button>
    </div>
  );
}

import Link from "next/link";
import { Check } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Guest",
    price: "Free",
    suffix: null,
    summary: "For a link you need right now.",
    features: [
      "Shorten links instantly",
      "No account needed",
      "Links expire after 7 days",
    ],
    cta: "Shorten a link",
    featured: false,
  },
  {
    name: "Basic",
    price: "Free",
    suffix: "with an account",
    summary: "For links you want to keep.",
    features: [
      "Links that never expire",
      "Basic click analytics",
      "Your links in one dashboard",
    ],
    cta: "Create an account",
    featured: false,
  },
  {
    name: "Pro",
    price: "$5",
    suffix: "/month",
    summary: "Everything in Basic, plus:",
    features: [
      "Unlimited active links",
      "Custom slugs like fwdly.link/launch",
      "Detailed analytics dashboard",
      "Priority support",
      "No rate limits",
    ],
    cta: "Get Pro",
    featured: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="max-w-2xl">
        <h2 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
          Simple pricing
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Start free. Upgrade when your links start to matter.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              "group relative isolate flex flex-col overflow-hidden border p-6 md:p-8",
              plan.featured ? "border-signal bg-card" : "border-border bg-card",
            )}
          >
            {plan.featured ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                <div className="pro-glow absolute inset-0" />
                <div className="pro-grid absolute inset-0" />
                <svg
                  viewBox="0 0 320 320"
                  fill="none"
                  className="absolute -bottom-14 -right-14 size-72 text-signal/50"
                >
                  <path
                    d="M-20 250c80 0 80-50 160-50s80-70 200-70"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="3 7"
                    strokeLinecap="round"
                    className="pro-route"
                  />
                  <circle cx="140" cy="200" r="2.5" fill="currentColor" />
                  <circle
                    cx="140"
                    cy="200"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                </svg>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-xl font-medium tracking-[-0.015em]">
                {plan.name}
              </h3>
              {plan.featured ? (
                <span className="flex items-center gap-1.5 text-xs text-signal">
                  <span aria-hidden="true" className="size-1.5 bg-signal" />
                  Best value
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-heading text-5xl font-medium leading-none tracking-[-0.04em]">
                {plan.price}
              </span>
              {plan.suffix ? (
                <span className="text-sm text-muted-foreground">
                  {plan.suffix}
                </span>
              ) : null}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">{plan.summary}</p>

            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check
                    aria-hidden="true"
                    strokeWidth={2}
                    className={cn(
                      "mt-0.5 size-3.5 shrink-0",
                      plan.featured ? "text-signal" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.featured ? (
              <Button size="lg" className="mt-8 w-full">
                {plan.cta}
              </Button>
            ) : plan.name === "Guest" ? (
              <Link
                href="#shorten"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-8 w-full",
                )}
              >
                {plan.cta}
              </Link>
            ) : (
              <Button variant="outline" size="lg" className="mt-8 w-full">
                {plan.cta}
              </Button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

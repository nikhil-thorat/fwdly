import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-32">
      <h2 className="text-4xl font-light tracking-tight">Simple pricing</h2>
      <p className="text-muted-foreground text-lg mt-3">
        Start free. Upgrade when you need more.
      </p>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="pt-8">
          <span className="font-mono text-sm text-muted-foreground">Guest</span>
          <p className="text-2xl font-medium mt-2">Free</p>

          <ul className="mt-6">
            <li className="py-1.5 text-sm text-muted-foreground">
              Shorten links instantly
            </li>
            <li className="py-1.5 text-sm text-muted-foreground">
              No account needed
            </li>
            <li className="py-1.5 text-sm text-muted-foreground">
              Links expire after 7 days
            </li>
          </ul>
        </div>

        <div className="border border-border p-8 flex flex-col gap-2">
          <span className="font-mono text-sm">Basic</span>
          <p className="mt-2">
            <span className="text-2xl font-medium">Free</span>
            <span className="text-sm text-muted-foreground ml-2">
              with signup
            </span>
          </p>

          <ul className="mt-6 space-y-2 text-sm">
            <li>Links that never expire</li>
            <li>Basic click analytics</li>
            <li>Links dashboard</li>
          </ul>

          <Button variant="secondary" size="default" className="mt-auto">
            Create account
            <ArrowRight />
          </Button>
        </div>

        <div className="border border-primary p-8 bg-primary/5 flex flex-col gap-2">
          <span className="font-mono text-sm text-primary">Pro</span>
          <p className="mt-2">
            <span className="text-2xl font-medium">$5</span>
            <span className="text-sm text-muted-foreground ml-2">/month</span>
          </p>

          <p className="text-sm text-muted-foreground italic mt-2">
            Everything in Basic, plus:
          </p>

          <ul className="space-y-2 text-sm mb-4">
            <li>Unlimited active links</li>
            <li>Custom slugs (fwdly.link/anything)</li>
            <li>Advanced analytics dashboard</li>
            <li>Priority support</li>
            <li>No rate limits</li>
          </ul>

          <Button variant="default" size="default" className="mt-auto">
            Get Pro
            <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}

import { Activity, Clock, Link2 } from "lucide-react";
import { OrbitRing } from "./orbit-ring";

const features = [
  {
    icon: Activity,
    title: "Every click counted",
    description:
      "See where people come from and which links earn their keep. Click analytics come with a free account.",
  },
  {
    icon: Link2,
    title: "Your name in the link",
    description:
      "Trade the random code for a word people remember: fwdly.link/launch instead of a string of letters.",
  },
  {
    icon: Clock,
    title: "Links that stay",
    description:
      "Guest links work for seven days. Sign in and they keep working for as long as you need them.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="relative max-w-2xl">
        <OrbitRing
          small
          className="absolute -bottom-10 -left-60 hidden size-64 text-signal/30 xl:block"
        />
        <h2 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
          Every link needs three things.
        </h2>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
          A short address, a way to see how it does, and a reason to trust it
          will still work tomorrow.
        </p>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="md:px-8 md:first:pl-0 md:last:pr-0"
          >
            <feature.icon
              aria-hidden="true"
              strokeWidth={1.5}
              className="size-5 text-signal"
            />
            <h3 className="mt-6 font-heading text-xl font-medium tracking-[-0.015em]">
              {feature.title}
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

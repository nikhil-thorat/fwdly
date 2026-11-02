import { Shortener } from "./shortener";

export function CTA() {
  return (
    <section
      className="border-t border-border bg-card"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--card) 40%, var(--background))",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-16 md:grid-cols-2 md:items-center md:gap-20">
          <div>
            <h2 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.025em]">
              One more link?
            </h2>
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted-foreground">
              Paste it here and take the short way. The route ends at your
              destination.
            </p>
          </div>
          <Shortener />
        </div>
      </div>
    </section>
  );
}

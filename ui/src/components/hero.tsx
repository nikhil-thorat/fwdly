import { ShortenDemo } from "./shorten-demo";
import { Shortener } from "./shortener";

export function Hero() {
  return (
    <section id="shorten" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <h1 className="max-w-[12ch] font-heading text-[clamp(2.9rem,7vw,5.25rem)] font-medium leading-[0.94] tracking-[-0.035em]">
            Send links the short way.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Paste any URL and get a clean fwdly.link back in a second. No
            account needed.
          </p>
          <div className="mt-10">
            <Shortener />
          </div>
        </div>

        <div className="relative isolate border border-border bg-card p-6 md:p-8">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 size-3 border-l border-t border-signal/40"
          />
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 size-3 border-r border-t border-signal/40"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 size-3 border-b border-l border-signal/40"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 right-0 size-3 border-b border-r border-signal/40"
          />
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 size-1.5 bg-signal"
          />
          <ShortenDemo />
        </div>
      </div>
    </section>
  );
}

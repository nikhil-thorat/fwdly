import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Hero() {
  return (
    <section id="shorten" className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <h1 className="max-w-3xl text-5xl font-light tracking-tight md:text-7xl">
        Shorten it. Share it. Done.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Paste any link. Get a clean fwdly.link back in under a second. No signup
        required.
      </p>
      <div className="mt-12 max-w-2xl">
        <div className="flex items-center gap-2 border border-border p-1">
          <Input
            type="url"
            placeholder="Paste your long URL here"
            className="ml-4 flex-1 border-0 text-base shadow-none focus-visible:ring-0"
          />
          <Button size="lg">Shorten</Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Free to use · Links expire in 7 days · No account needed
        </p>
      </div>
    </section>
  );
}

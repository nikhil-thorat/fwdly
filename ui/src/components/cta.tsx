import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function CTA() {
  return (
    <section className="bg-muted/5 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="md:grid md:grid-cols-2 md:gap-16 items-center">
          <div className="mb-10 md:mb-0">
            <h2 className="text-3xl font-light tracking-tight">
              Ready to shorten?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Paste a link right here. No signup, no friction.
            </p>
          </div>
          <div>
            <div className="border border-border p-1 flex items-center gap-2">
              <Input
                placeholder="Your long URL"
                className="ml-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button variant="default" size="lg">
                Shorten
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

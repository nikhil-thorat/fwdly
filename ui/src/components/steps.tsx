const steps = [
  {
    title: "Drop your link",
    description:
      "Paste any URL, however long or full of tracking parameters. We take it as it is.",
  },
  {
    title: "Get a clean URL",
    description:
      "Your link becomes something like fwdly.link/x7Kp2q. Short, clean, ready.",
  },
  {
    title: "Share anywhere",
    description:
      "Copy it, text it, print it. The short link goes wherever the long one would.",
  },
];

export function Steps() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border bg-card"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--card) 40%, var(--background))",
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-5 md:py-28">
        <div className="md:col-span-2">
          <h2 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
            Three moves. Under a second.
          </h2>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted-foreground">
            There is no setup to learn and nothing to install. Paste, take your
            short link, and go.
          </p>
        </div>

        <ol className="relative ml-1 border-l border-border md:col-span-3 md:ml-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative pb-10 pl-8 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-1.25 top-1.5 size-2.5 border border-signal bg-background"
              />
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-heading text-xl font-medium tracking-[-0.015em]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

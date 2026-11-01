import { Separator } from "./ui/separator";

const items = [
  {
    title: "Drop your link",
    description:
      "Paste any URL — long, ugly, full of tracking parameters. We don't judge.",
  },
  {
    title: "Get a clean URL",
    description: "Your link becomes fwdly.link/xxxxxx. Short, clean, ready.",
  },
  {
    title: "Share anywhere",
    description: "Copy it, text it, tweet it, print it. It just works.",
  },
];

export function Steps() {
  return (
    <section id="features" className="w-full bg-muted/5">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-5">
          <div className="md:col-span-2">
            <h2 className="text-4xl font-light tracking-tight text-foreground">
              Paste. Shorten. Share.
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Three things happen when you use fwdly. All of them take less than
              a second.
            </p>
          </div>

          <div className="md:col-span-3">
            {items.map((item, i) => (
              <div key={item.title}>
                <div className="py-8">
                  <h3 className="text-xl font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {i < items.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

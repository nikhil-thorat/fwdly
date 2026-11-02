import Link from "next/link";
import { Wordmark } from "./wordmark";

const links = [
  { href: "#pricing", label: "Pricing" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Wordmark className="text-foreground" />
          <span className="hidden sm:inline">Links, shortened.</span>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

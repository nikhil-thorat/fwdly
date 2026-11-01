import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-mono text-lg font-semibold tracking-tighter flex items-center gap-1.5"
          >
            <span>fwdly</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="#shorten"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Shorten
            </Link>
            <Link
              href="#features"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>
          <Button size="sm">
            <Link href="#shorten">Start Free</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

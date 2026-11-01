export function Footer() {
  return (
    <footer className="max-w-6xl mx-auto my-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-0 text-sm">
          <span className="font-mono font-semibold tracking-tighter">
            fwdly
          </span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="text-muted-foreground">Links, shortened.</span>
        </div>
        <nav className="flex items-center gap-0 text-sm">
          <a
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <span className="mx-2 text-muted-foreground">·</span>
          <a
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </a>
          <span className="mx-2 text-muted-foreground">·</span>
          <a
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}

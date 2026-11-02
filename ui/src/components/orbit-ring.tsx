import { cn } from "@/lib/utils";

export function OrbitRing({
  className,
  small = false,
}: {
  className?: string;
  small?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
    >
      <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="2" fill="currentColor" />
      <g className={small ? "backdrop-orbit-dot-sm" : "backdrop-orbit-dot"}>
        <circle cx="100" cy="26" r="2.5" className="fill-signal" />
      </g>
    </svg>
  );
}

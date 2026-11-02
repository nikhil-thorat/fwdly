import { OrbitRing } from "./orbit-ring";
import { cn } from "@/lib/utils";

const ROUTE_PATH =
  "M24 -40V420c0 30 14 50 14 80v320c0 30-28 50-28 80v520c0 30 28 50 28 80v420c0 30-14 50-14 80v640";

function EdgeRoute({ side }: { side: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 48 2600"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      className={cn(
        "absolute inset-y-0 h-full w-12",
        side === "left" ? "left-0" : "right-0 -scale-x-100",
      )}
    >
      <path
        d={ROUTE_PATH}
        stroke="transparent"
        strokeWidth={20}
        vectorEffect="non-scaling-stroke"
        className="edge-route-hit"
      />
      <path
        d={ROUTE_PATH}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeDasharray="3 12"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="edge-route-line"
      />
    </svg>
  );
}

export function EdgeRoutes() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden overflow-hidden xl:block">
      <EdgeRoute side="left" />
      <EdgeRoute side="right" />
    </div>
  );
}

export function SiteBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <OrbitRing
        small
        className="absolute -right-40 -top-32 size-136 text-signal/30"
      />
    </div>
  );
}

export function ClickChart({
  data,
  labels,
}: {
  data: number[];
  labels: string[];
}) {
  const max = Math.max(...data, 1);

  return (
    <div>
      <div className="flex h-64 items-end gap-1.5 border-b border-border pb-2">
        {data.map((value, index) => (
          <div
            key={index}
            className="group relative flex h-full flex-1 items-end"
          >
            <div
              className="w-full bg-signal/40 transition-colors group-hover:bg-signal"
              style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap border border-border bg-card px-1.5 py-0.5 font-mono text-xs tabular-nums text-foreground group-hover:block">
              {formatNumber(value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <span>{labels[0] ?? "—"}</span>
        <span>{labels[Math.floor(labels.length / 2)] ?? "—"}</span>
        <span>{labels[labels.length - 1] ?? "—"}</span>
      </div>
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

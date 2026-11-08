export type LinkStatus = "active" | "disabled";

export type AccountPlan = "basic" | "pro";

export const currentUser = {
  name: "Nikhil Thorat",
  firstName: "Nikhil",
  initials: "NT",
  plan: "basic" as AccountPlan,
};

export type ShortLink = {
  id: string;
  slug: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number | null;
  createdAt: string;
  status: LinkStatus;
};

export type BreakdownItem = {
  label: string;
  value: number;
};

export const mockLinks: ShortLink[] = [
  {
    id: "dev-conf-2026",
    slug: "dev-conf-2026",
    shortUrl: "fwdly.link/dev-conf-2026",
    originalUrl: "https://nikhil-thorat.vercel.app/blog/nextjs-edge-routing",
    clicks: 42810,
    createdAt: "Oct 28, 2026",
    status: "active",
  },
  {
    id: "launch-week",
    slug: "launch-week",
    shortUrl: "fwdly.link/launch-week",
    originalUrl:
      "https://www.producthunt.com/posts/fwdly-high-speed-url-infrastructure",
    clicks: 18244,
    createdAt: "Oct 24, 2026",
    status: "active",
  },
  {
    id: "portfolio",
    slug: "portfolio",
    shortUrl: "fwdly.link/portfolio",
    originalUrl:
      "https://nikhil-thorat.vercel.app/?utm_source=resume&utm_medium=pdf",
    clicks: 9120,
    createdAt: "Oct 19, 2026",
    status: "active",
  },
  {
    id: "gh-readme",
    slug: "gh-readme",
    shortUrl: "fwdly.link/gh-readme",
    originalUrl: "https://github.com/nikhil-thorat/fwdly-edge-router",
    clicks: 6482,
    createdAt: "Oct 12, 2026",
    status: "active",
  },
  {
    id: "legacy-demo",
    slug: "legacy-demo",
    shortUrl: "fwdly.link/legacy-demo",
    originalUrl: "https://nikhil-thorat.vercel.app/demo/vector-search",
    clicks: 1208,
    createdAt: "Sep 30, 2026",
    status: "disabled",
  },
];

export const clickTrend30: number[] = [
  820, 910, 760, 1020, 1180, 940, 1320, 1490, 1210, 1380, 1650, 1720, 1510,
  1890, 2040, 1980, 2210, 2100, 2360, 2280, 2540, 2410, 2670, 2890, 2720, 3010,
  3180, 2950, 3320, 3480,
];

export const clickTrend7: number[] = [2720, 3010, 3180, 2950, 3320, 3480, 3610];

function buildDayLabels(start: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + index);
    return day.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    });
  });
}

export const trendLabels30 = buildDayLabels(new Date(Date.UTC(2026, 9, 5)), 30);
export const trendLabels7 = buildDayLabels(new Date(Date.UTC(2026, 9, 28)), 7);

export const referrers: BreakdownItem[] = [
  { label: "github.com", value: 45 },
  { label: "twitter.com", value: 30 },
  { label: "direct", value: 15 },
  { label: "others", value: 10 },
];

export const browsers: BreakdownItem[] = [
  { label: "Chrome", value: 58 },
  { label: "Safari", value: 24 },
  { label: "Firefox", value: 12 },
  { label: "Other", value: 6 },
];

export const platforms: BreakdownItem[] = [
  { label: "Linux", value: 41 },
  { label: "macOS", value: 27 },
  { label: "iOS", value: 19 },
  { label: "Android", value: 13 },
];

export function getLinkById(id: string): ShortLink {
  return mockLinks.find((link) => link.id === id) ?? mockLinks[0];
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

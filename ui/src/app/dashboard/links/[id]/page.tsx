import type { Metadata } from "next";
import { LinkAnalytics } from "@/components/dashboard/link-analytics";
import { getLinkById, mockLinks } from "@/lib/mock-data";

export function generateStaticParams() {
  return mockLinks.map((link) => ({ id: link.id }));
}

export const metadata: Metadata = {
  title: "Link analytics — fwdly",
  description: "Clicks, referrers, and audience breakdown.",
};

export default async function LinkAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const link = getLinkById(id);

  return <LinkAnalytics link={link} />;
}

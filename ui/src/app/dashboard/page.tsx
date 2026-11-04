import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/overview";

export const metadata: Metadata = {
  title: "Overview — fwdly",
  description: "Manage your links and click analytics.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}

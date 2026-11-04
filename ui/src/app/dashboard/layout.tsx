import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-background">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:py-14 lg:px-8">
        {children}
      </main>
    </div>
  );
}

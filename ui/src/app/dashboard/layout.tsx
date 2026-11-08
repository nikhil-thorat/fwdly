import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-background">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:py-14">
        {children}
      </main>
    </div>
  );
}

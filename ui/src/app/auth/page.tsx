import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { DotField } from "@/components/dot-field";
import { OrbitRing } from "@/components/orbit-ring";

export const metadata: Metadata = {
  title: "Sign in — fwdly",
  description: "Sign in or create an fwdly account.",
};

export default function AuthPage() {
  return (
    <main className="relative isolate flex min-h-svh flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <DotField />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <OrbitRing
          small
          className="absolute -right-28 -top-24 size-80 text-signal/30 sm:-right-44 sm:-top-40 sm:size-136"
        />
        <OrbitRing className="absolute -bottom-36 -left-28 hidden size-104 text-signal/20 sm:block" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="border border-border bg-card p-8 shadow-sm sm:p-12">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}

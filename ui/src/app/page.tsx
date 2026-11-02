import { CTA } from "@/components/cta";
import { DotField } from "@/components/dot-field";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";
import { EdgeRoutes, SiteBackdrop } from "@/components/site-backdrop";
import { Steps } from "@/components/steps";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative isolate flex-1">
        <DotField />
        <SiteBackdrop />
        <EdgeRoutes />
        <Hero />
        <Features />
        <Steps />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

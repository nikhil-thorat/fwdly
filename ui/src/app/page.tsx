import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";
import { Steps } from "@/components/steps";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Steps />
      <Pricing />
      <CTA />
      <Footer />
    </>
  );
}

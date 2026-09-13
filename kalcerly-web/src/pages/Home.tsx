import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
// import { ProductMetrics } from "@/components/landing/ProductMetrics";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ActivityTracking } from "@/components/landing/ActivityTracking";
import { AIVerification } from "@/components/landing/AIVerification";
import { Community } from "@/components/landing/Community";
import { Challenges } from "@/components/landing/Challenges";
import { Statistics } from "@/components/landing/Statistics";
import { Achievements } from "@/components/landing/Achievements";
import { Rewards } from "@/components/landing/Rewards";
import { Clubs } from "@/components/landing/Clubs";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/layout/Footer";

export function Home() {
  useEffect(() => {
    document.title = "Kalcerly - Make Movement a Culture";
  }, []);

  return (
    <div className="min-h-screen bg-page transition-colors duration-300">
      <Navbar />
      <main>
        <Hero />
        {/* <ProductMetrics /> */}
        <HowItWorks />
        <ActivityTracking />
        <AIVerification />
        <Community />
        <Challenges />
        <Statistics />
        <Achievements />
        <Rewards />
        <Clubs />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

"use client";

import WhyUs from "@/components/LandingPage/whyUs";
import Hero from "@/components/LandingPage/hero";
import LandingNavBar from "@/components/Navbars/landingNavBar";
import Features from "@/components/LandingPage/features";
import HowItWorks from "@/components/LandingPage/howItWorks";
import Footer from "@/components/LandingPage/footer";
import SignUp from "@/components/LandingPage/signUp";

export default function Home() {
  return (
    <main className="w-full">
      <LandingNavBar />
      <Hero />
      <WhyUs />
      <Features />
      <HowItWorks />
      <SignUp />
      <Footer />
    </main>
  );
}

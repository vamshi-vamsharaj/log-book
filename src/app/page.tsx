import type { Metadata } from "next";

import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingPreview } from "@/features/landing/components/landing-preview";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingCarryForwardShowcase } from "@/features/landing/components/landing-carry-forward-showcase";
import { LandingExpenseShowcase } from "@/features/landing/components/landing-expense-showcase";
import { LandingHowItWorks } from "@/features/landing/components/landing-how-it-works";
import { LandingFaq } from "@/features/landing/components/landing-faq";
import { LandingCta } from "@/features/landing/components/landing-cta";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { getSession } from "@/lib/session";
import { APP_NAME, APP_DESCRIPTION } from "@/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — Personal Productivity Operating System`,
  description: APP_DESCRIPTION,
};

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <LandingNavbar isAuthenticated={Boolean(session?.user)} />
      <main className="flex-1">
        <LandingHero />
        <LandingPreview />
        <LandingFeatures />
        <LandingCarryForwardShowcase />
        <LandingExpenseShowcase />
        <LandingHowItWorks />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

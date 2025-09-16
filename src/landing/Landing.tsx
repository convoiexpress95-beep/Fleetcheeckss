import React from 'react';
import Navigation from './components/Navigation';
import HeroSection from '../../external-landing/src/components/HeroSection';
import FeaturesSection from '../../external-landing/src/components/FeaturesSection';
import TargetAudienceSection from '../../external-landing/src/components/TargetAudienceSection';
import RealTimeSection from '../../external-landing/src/components/RealTimeSection';
import InvoicingSection from '../../external-landing/src/components/InvoicingSection';
import NetworkSection from '../../external-landing/src/components/NetworkSection';
import TestimonialsSection from '../../external-landing/src/components/TestimonialsSection';
import PricingSection from '../../external-landing/src/components/PricingSection';
import CTASection from '../../external-landing/src/components/CTASection';
import Footer from '../../external-landing/src/components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TargetAudienceSection />
      <RealTimeSection />
      <InvoicingSection />
      <NetworkSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}

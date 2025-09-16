import React from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import TargetAudienceSection from './components/TargetAudienceSection';
import RealTimeSection from './components/RealTimeSection';
import InvoicingSection from './components/InvoicingSection';
import NetworkSection from './components/NetworkSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
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

export default App;
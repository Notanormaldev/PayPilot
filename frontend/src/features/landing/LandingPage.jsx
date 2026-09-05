import React, { useState } from 'react';
import './landing.css';
import {
  LandingNavbar,
  HeroSection,
  SocialProofSection,
  SmartSimpleBrilliant,
  YourWorkInSync,
  EffortlessIntegration,
  NumbersThatSpeak,
  DocumentationSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  CTASection,
  FooterSection,
  AuthModal,
  Badge,
} from './components';
import { useAuthUser } from '../auth/hooks/useAuthUser';

export const LandingPage = ({ onAuthSuccess }) => {
  const [authOpened, setAuthOpened] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const { login } = useAuthUser();

  const handleOpenAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setAuthOpened(true);
  };

  const handleLaunchDemo = () => {
    handleOpenAuth('signin');
  };

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center pp-editorial-landing">
      <div className="relative flex flex-col justify-start items-center w-full">
        {/* Main container with editorial vertical margin lines */}
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          {/* Left vertical line */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          {/* Right vertical line */}
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[40px] relative z-10">
            {/* Top Floating Navbar */}
            <LandingNavbar
              onOpenAuth={handleOpenAuth}
              onLaunchDemo={handleLaunchDemo}
            />

            {/* Hero Section */}
            <HeroSection
              onLaunchDemo={handleLaunchDemo}
              onOpenAuth={handleOpenAuth}
            />

            {/* Social Proof & Trusted Logos Grid */}
            <SocialProofSection />

            {/* Bento Grid Section */}
            <div id="bento" className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
              {/* Bento Header */}
              <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
                <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 text-center">
                  <Badge
                    icon={
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        <rect x="7" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        <rect x="1" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        <rect x="7" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                      </svg>
                    }
                    text="Bento Grid"
                  />
                  <div className="w-full text-center text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                    Built for absolute clarity and focused operations
                  </div>
                  <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                    Stay focused with tools that organize employee records, audit compliance,
                    <br />
                    and turn complex salary rules into confident decisions.
                  </div>
                </div>
              </div>

              {/* Bento Grid 2x2 Content */}
              <div className="self-stretch flex justify-center items-start">
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden hidden sm:block">
                  <div className="w-[140px] left-[-50px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-[rgba(55,50,47,0.12)]">
                  {/* Top Left - Smart. Simple. Brilliant. */}
                  <div className="border-b border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-6 sm:p-8 lg:p-10 flex flex-col justify-start items-start gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                        Smart. Simple. Deterministic.
                      </h3>
                      <p className="text-[#605A57] text-sm font-normal leading-relaxed font-sans">
                        Your salary rules and statutory caps are clearly organized and auditable before final payments.
                      </p>
                    </div>
                    <div className="w-full h-[220px] rounded-lg flex items-center justify-center overflow-hidden">
                      <SmartSimpleBrilliant width="100%" height="100%" />
                    </div>
                  </div>

                  {/* Top Right - Your work, in sync */}
                  <div className="border-b border-[rgba(55,50,47,0.12)] p-6 sm:p-8 lg:p-10 flex flex-col justify-start items-start gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-[#37322F] font-semibold leading-tight font-sans text-lg sm:text-xl">
                        Your workforce, in sync
                      </h3>
                      <p className="text-[#605A57] text-sm font-normal leading-relaxed font-sans">
                        Every biometric punch and approved leave request flows directly into the active payroll timeline.
                      </p>
                    </div>
                    <div className="w-full h-[220px] rounded-lg flex items-center justify-center overflow-hidden">
                      <YourWorkInSync width="100%" height="100%" />
                    </div>
                  </div>

                  {/* Bottom Left - Effortless integration */}
                  <div className="border-b md:border-b-0 border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-6 sm:p-8 lg:p-10 flex flex-col justify-start items-start gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                        Effortless integrations
                      </h3>
                      <p className="text-[#605A57] text-sm font-normal leading-relaxed font-sans">
                        Connect your existing HRMS, banking channels, Slack, and accounting ledgers seamlessly.
                      </p>
                    </div>
                    <div className="w-full h-[220px] rounded-lg flex items-center justify-center overflow-hidden">
                      <EffortlessIntegration width="100%" height="100%" />
                    </div>
                  </div>

                  {/* Bottom Right - Numbers that speak */}
                  <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-start items-start gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                        Numbers that speak
                      </h3>
                      <p className="text-[#605A57] text-sm font-normal leading-relaxed font-sans">
                        Track workforce expenditure trends with precision and make confident financial decisions.
                      </p>
                    </div>
                    <div className="w-full h-[220px] rounded-lg flex items-center justify-center overflow-hidden">
                      <NumbersThatSpeak width="100%" height="100%" />
                    </div>
                  </div>
                </div>

                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden hidden sm:block">
                  <div className="w-[140px] left-[-50px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation / Feature Section */}
            <DocumentationSection />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Pricing Section */}
            <PricingSection
              onLaunchDemo={handleLaunchDemo}
              onOpenAuth={handleOpenAuth}
            />

            {/* FAQ Section */}
            <FAQSection />

            {/* Final Conversion CTA */}
            <CTASection
              onLaunchDemo={handleLaunchDemo}
              onOpenAuth={handleOpenAuth}
            />

            {/* Footer Section */}
            <FooterSection
              onOpenAuth={handleOpenAuth}
              onLaunchDemo={handleLaunchDemo}
            />
          </div>
        </div>
      </div>

      {/* 1-Click Fast Persona Demo Modal */}
      <AuthModal
        opened={authOpened}
        onClose={() => setAuthOpened(false)}
        initialMode={authMode}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;

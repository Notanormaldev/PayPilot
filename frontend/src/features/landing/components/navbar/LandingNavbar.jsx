import React from 'react';
import { BrandLogo } from '../../../../components/BrandLogo';

export const LandingNavbar = ({ onOpenAuth, onLaunchDemo }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-30 px-4 sm:px-8 md:px-12 lg:px-0">
      {/* Background horizontal guide line */}
      <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

      {/* Floating Pill Wrapper */}
      <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-40 border border-[rgba(55,50,47,0.08)]">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center justify-between w-full">
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer flex items-center pr-2">
            <BrandLogo size={22} withBadge={false} subtitle={null} />
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => scrollTo('features')}
              className="text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium hover:text-[#2F3037] transition-colors bg-transparent border-none cursor-pointer p-0 font-sans"
            >
              Products
            </button>
            <button
              onClick={() => scrollTo('bento')}
              className="text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium hover:text-[#2F3037] transition-colors bg-transparent border-none cursor-pointer p-0 font-sans"
            >
              Sentinel AI
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className="text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium hover:text-[#2F3037] transition-colors bg-transparent border-none cursor-pointer p-0 font-sans"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollTo('faq')}
              className="text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium hover:text-[#2F3037] transition-colors bg-transparent border-none cursor-pointer p-0 font-sans"
            >
              FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingNavbar;

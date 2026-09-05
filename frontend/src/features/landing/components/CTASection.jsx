import React from 'react';

export const CTASection = ({ onLaunchDemo, onOpenAuth }) => {
  return (
    <div className="w-full relative overflow-hidden flex flex-col justify-center items-center gap-2">
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-t border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6 relative z-10">
        {/* Background diagonal hatch pattern */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="w-full h-full relative">
            {Array.from({ length: 80 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-4 w-full rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.06)] outline-offset-[-0.25px]"
                style={{
                  top: `${i * 18 - 120}px`,
                  left: '-100%',
                  width: '300%',
                }}
              />
            ))}
          </div>
        </div>

        <div className="w-full max-w-[586px] px-6 py-6 md:py-8 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-6 relative z-20 text-center">
          <div className="self-stretch flex flex-col justify-start items-center gap-3">
            <div className="self-stretch text-center text-[#49423D] text-3xl md:text-5xl font-semibold leading-tight md:leading-[56px] font-sans tracking-tight">
              Ready to transform your company’s payroll?
            </div>
            <p className="self-stretch text-center text-[#605A57] text-sm md:text-base leading-7 font-sans font-medium">
              Join high-growth organizations eliminating payroll errors,
              <br className="hidden sm:block" />
              automating statutory compliance, and empowering their workforce.
            </p>
          </div>

          <div className="flex justify-center items-center gap-4">
            <button
              onClick={onLaunchDemo}
              className="h-11 px-8 md:px-10 py-2 relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-[#201D1B] transition-colors border-none"
            >
              <div className="w-44 h-[41px] absolute left-0 top-0 bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
              <span className="text-white text-sm font-medium leading-5 font-sans">
                Launch Admin Demo
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;

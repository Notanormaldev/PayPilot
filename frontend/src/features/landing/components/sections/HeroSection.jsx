import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '../ui/Badge';

export const HeroSection = ({ onLaunchDemo, onOpenAuth }) => {
  const [activeCard, setActiveCard] = useState(0);
  const [progress, setProgress] = useState(0);
  const mountedRef = useRef(true);

  const heroTabs = [
    {
      title: 'Plan your payruns',
      description: 'Streamline staff compensation and statutory deductions with automated batch scheduling.',
      image: '/paypilot-payrun-dashboard.jpg',
    },
    {
      title: 'Sentinel AI compliance',
      description: 'Continuous statutory audits flag TDS/PF deviations and ghost accounts in real time.',
      image: '/paypilot-sentinel-radar.jpg',
    },
    {
      title: 'Workforce telemetry',
      description: 'Live cost telemetry, department-wise liability distribution, and immutable audit logs.',
      image: '/paypilot-telemetry-analytics.jpg',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3);
          }
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      mountedRef.current = false;
    };
  }, []);

  const handleCardClick = (index) => {
    setActiveCard(index);
    setProgress(0);
  };

  return (
    <div className="pt-32 sm:pt-36 md:pt-40 pb-4 sm:pb-6 flex flex-col justify-center items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full relative">
      {/* Title & Copy */}
      <div className="w-full max-w-[860px] flex flex-col justify-center items-center gap-4 text-center">
        <h1 className="w-full text-center text-[#37322F] text-[36px] sm:text-[44px] md:text-[52px] lg:text-[58px] font-normal leading-[1.15] font-serif px-2 sm:px-4">
          Effortless autonomous payroll{' '}
          by <span className="italic">Pay<span style={{ color: '#2563EB' }}>Pilot</span></span>
        </h1>
        <p className="w-full max-w-[520px] text-center text-[rgba(55,50,47,0.72)] text-sm sm:text-[15px] leading-relaxed font-sans px-4 font-normal">
          Streamline your workforce operations with deterministic rule calculation,
          Sentinel statutory anomaly detection, and live recomputing payslips.
        </p>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-[497px] flex flex-col justify-center items-center relative z-10 mt-6 sm:mt-7">
        <div className="backdrop-blur-[8px] flex justify-start items-center gap-3">
          <button
            onClick={onLaunchDemo}
            className="h-11 sm:h-12 px-8 sm:px-10 py-2 relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center hover:bg-[#231F1D] transition-all cursor-pointer border-none"
          >
            <div className="w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
            <div className="text-white text-sm sm:text-[15px] font-medium leading-5 font-sans flex items-center justify-center">
              <span>Launch Interactive Demo</span>
            </div>
          </button>
        </div>
      </div>

      {/* Background Mask Group */}
      <div className="absolute top-[200px] sm:top-[230px] md:top-[260px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
        <img
          src="/mask-group-pattern.svg"
          alt=""
          className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
          style={{ filter: 'hue-rotate(15deg) saturate(0.7) brightness(1.2)' }}
        />
      </div>

      {/* Interactive Mockup Container */}
      <div className="w-full max-w-[1000px] px-2 sm:px-4 md:px-6 lg:px-0 flex flex-col justify-center items-center gap-2 relative z-5 mt-12 sm:mt-14 md:mt-16 mb-0">
        <div className="w-full h-[240px] sm:h-[360px] md:h-[500px] lg:h-[560px] bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.10)] overflow-hidden rounded-[10px] sm:rounded-[14px] flex flex-col justify-start items-start border border-[#E2E8F0]">
          <div className="w-full h-full relative overflow-hidden bg-slate-50">
            {/* Tab 0 Image */}
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                activeCard === 0 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'
              }`}
            >
              <img
                src={heroTabs[0].image}
                alt="Autonomous Payruns & Scheduling Dashboard"
                className="w-full h-full object-contain object-top bg-white"
              />
            </div>

            {/* Tab 1 Image */}
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                activeCard === 1 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'
              }`}
            >
              <img
                src={heroTabs[1].image}
                alt="Sentinel AI Compliance Radar"
                className="w-full h-full object-cover object-top bg-white"
              />
            </div>

            {/* Tab 2 Image */}
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                activeCard === 2 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'
              }`}
            >
              <img
                src={heroTabs[2].image}
                alt="Workforce Analytics & Telemetry"
                className="w-full h-full object-cover object-top bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Selector Tabs */}
      <div className="self-stretch border-t border-[#E0DEDB] border-b border-[#E0DEDB] flex justify-center items-start mt-6">
        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden hidden sm:block">
          <div className="w-[140px] left-[-50px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row justify-center items-stretch gap-0">
          {heroTabs.map((tab, idx) => {
            const isActive = activeCard === idx;
            return (
              <div
                key={idx}
                onClick={() => handleCardClick(idx)}
                className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 transition-colors ${
                  isActive
                    ? 'bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]'
                    : 'border-l-0 border-r-0 md:border border-[#E0DEDB]/80 hover:bg-white/50'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(50,45,43,0.08)]">
                    <div
                      className="h-full bg-[#322D2B] transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                <div className="self-stretch text-[#49423D] text-sm font-semibold leading-6 font-sans">
                  {tab.title}
                </div>
                <div className="self-stretch text-[#605A57] text-[13px] font-normal leading-[20px] font-sans">
                  {tab.description}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden hidden sm:block">
          <div className="w-[140px] left-[-50px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

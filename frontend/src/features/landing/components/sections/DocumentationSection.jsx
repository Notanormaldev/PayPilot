import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';

export const DocumentationSection = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const cards = [
    {
      title: 'Autonomous Payrun Engine',
      description: 'Execute multi-tier payroll calculations across contracts, schedules, and attendance in seconds.',
      image: '/paypilot-payrun-dashboard.jpg',
    },
    {
      title: 'Sentinel AI Compliance Radar',
      description: 'Continuously scan for tax discrepancies, duplicate bank details, and statutory threshold breaches.',
      image: '/paypilot-sentinel-radar.jpg',
    },
    {
      title: 'Employee Self-Service Portal & Telemetry',
      description: 'Empower staff to track biometric punches, request leaves, and download instant payslips.',
      image: '/paypilot-telemetry-analytics.jpg',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
      setAnimationKey((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [cards.length]);

  const handleCardClick = (index) => {
    setActiveCard(index);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div id="features" className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      {/* Header */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4 text-center">
          <Badge
            icon={
              <div className="w-[10.5px] h-[10.5px] outline outline-[1.2px] outline-[#37322F] outline-offset-[-0.6px] rounded-full"></div>
            }
            text="Platform Features"
          />
          <div className="self-stretch text-center text-[#49423D] text-3xl md:text-5xl font-semibold leading-tight font-sans tracking-tight">
            Streamline your workforce operations
          </div>
          <div className="self-stretch text-center text-[#605A57] text-base font-normal leading-7 font-sans">
            Manage contracts, audit tax compliance, and execute direct deposits
            <br />
            all inside one explainable platform.
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="self-stretch px-4 md:px-9 overflow-hidden flex justify-start items-center">
        <div className="flex-1 py-8 md:py-11 flex flex-col md:flex-row justify-start items-center gap-6 md:gap-12 max-w-[1060px] mx-auto w-full">
          {/* Left Column - Feature Cards */}
          <div className="w-full md:w-auto md:max-w-[400px] flex flex-col justify-center items-center gap-4 order-2 md:order-1 flex-1">
            {cards.map((card, index) => {
              const isActive = index === activeCard;

              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className={`w-full overflow-hidden flex flex-col justify-start items-start transition-all duration-300 cursor-pointer rounded-lg ${
                    isActive
                      ? 'bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]'
                      : 'border border-[rgba(2,6,23,0.08)] bg-white/40 hover:bg-white/70'
                  }`}
                >
                  <div
                    className={`w-full h-0.5 bg-[rgba(50,45,43,0.08)] overflow-hidden ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div
                      key={animationKey}
                      className="h-0.5 bg-[#322D2B] animate-[progressBar_5s_linear_forwards] will-change-transform"
                    />
                  </div>
                  <div className="px-6 py-5 w-full flex flex-col gap-2">
                    <div className="self-stretch text-[#49423D] text-sm font-semibold leading-6 font-sans">
                      {card.title}
                    </div>
                    <div className="self-stretch text-[#605A57] text-[13px] font-normal leading-[22px] font-sans">
                      {card.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Dashboard Image */}
          <div className="w-full md:w-auto rounded-lg flex flex-col justify-center items-center gap-2 order-1 md:order-2 flex-1">
            <div className="w-full h-[250px] md:h-[400px] bg-white shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08)] overflow-hidden rounded-lg border border-[#E2E8F0] relative">
              <img
                src={cards[activeCard].image}
                alt={cards[activeCard].title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationSection;

import React from 'react';
import { Badge } from './Badge';

export const SocialProofSection = () => {
  const companyLogos = [
    {
      name: 'Odoo Global',
      category: 'Enterprise ERP',
      bg: 'bg-purple-50 border-purple-200/80',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7.5" cy="12" r="4.5" stroke="#7C3AED" strokeWidth="2.2" />
          <circle cx="16.5" cy="12" r="4.5" stroke="#9333EA" strokeWidth="2.2" />
          <path d="M12 6.5V17.5" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: 'Zylker Corp',
      category: 'Fintech & Banking',
      bg: 'bg-emerald-50 border-emerald-200/80',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2.5 21.5,8 21.5,16 12,21.5 2.5,16 2.5,8" stroke="#059669" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3.5" fill="#10B981" />
        </svg>
      ),
    },
    {
      name: 'Northwind Tech',
      category: 'Cloud Systems',
      bg: 'bg-sky-50 border-sky-200/80',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.5L15 9.5L22 12L15 14.5L12 21.5L9 14.5L2 12L9 9.5Z" stroke="#0284C7" strokeWidth="2.2" strokeLinejoin="round" fill="#BAE6FD" />
        </svg>
      ),
    },
    {
      name: 'Globex Systems',
      category: 'Supply Chain',
      bg: 'bg-amber-50 border-amber-200/80',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" stroke="#D97706" strokeWidth="2.2" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#B45309" strokeWidth="1.8" transform="rotate(-30 12 12)" />
          <circle cx="12" cy="12" r="2.5" fill="#F59E0B" />
        </svg>
      ),
    },
    {
      name: 'Initech Labs',
      category: 'AI Software',
      bg: 'bg-indigo-50 border-indigo-200/80',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L21 19H3L12 3Z" stroke="#4F46E5" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M12 9.5L16.5 17.5H7.5L12 9.5Z" fill="#818CF8" opacity="0.4" />
          <circle cx="12" cy="14" r="2" fill="#4338CA" />
        </svg>
      ),
    },
    {
      name: 'Stark Dynamics',
      category: 'Robotics & Hardware',
      bg: 'bg-rose-50 border-rose-200/80',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="#E11D48" strokeWidth="2.2" />
          <circle cx="12" cy="12" r="4.5" stroke="#BE123C" strokeWidth="1.8" strokeDasharray="3 3" />
          <polygon points="12,5.5 13.5,9.5 17.5,12 13.5,14.5 12,18.5 10.5,14.5 6.5,12 10.5,9.5" fill="#F43F5E" />
        </svg>
      ),
    },
    {
      name: 'Acme Holdings',
      category: 'Capital Group',
      bg: 'bg-slate-100 border-slate-300',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" stroke="#334155" strokeWidth="2" fill="#E2E8F0" />
          <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" stroke="#334155" strokeWidth="2" />
          <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" stroke="#334155" strokeWidth="2" />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" stroke="#334155" strokeWidth="2" fill="#334155" />
        </svg>
      ),
    },
    {
      name: 'Hypernise Inc',
      category: 'Hyperscale Cloud',
      bg: 'bg-fuchsia-50 border-fuchsia-200/80',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 17L12 7L20 17" stroke="#C026D3" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 20L12 14.5L16.5 20" stroke="#E879F9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      {/* Header */}
      <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 text-center">
          <Badge
            icon={
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="3" width="4" height="6" stroke="#37322F" strokeWidth="1" fill="none" />
                <rect x="7" y="1" width="4" height="8" stroke="#37322F" strokeWidth="1" fill="none" />
              </svg>
            }
            text="Trusted by Industry Leaders"
          />
          <div className="w-full text-center text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight font-sans tracking-tight">
            Confidence backed by results
          </div>
          <p className="text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
            Our customers achieve zero-dispute payroll every month <br className="hidden sm:block" />
            because our calculations are deterministic, explainable, and clear.
          </p>
        </div>
      </div>

      {/* Logo Grid */}
      <div className="self-stretch border-[rgba(55,50,47,0.12)] flex justify-center items-start border-t border-b-0">
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

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-0 border-l border-r border-[rgba(55,50,47,0.12)]">
          {companyLogos.map((item, idx) => (
            <div
              key={idx}
              className="h-28 sm:h-36 md:h-40 flex flex-col justify-center items-center gap-2.5 border-b border-r border-[#E3E2E1] p-4 text-center group hover:bg-white transition-all duration-200 cursor-default"
            >
              <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center p-2 border shadow-xs group-hover:scale-110 transition-transform duration-200`}>
                {item.icon}
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[#37322F] text-sm sm:text-[15px] font-semibold font-sans group-hover:text-black transition-colors">
                  {item.name}
                </span>
                <span className="text-[#8C827A] text-[11px] font-medium font-sans uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
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

export default SocialProofSection;

import React, { useState, useEffect } from 'react';

export const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const testimonials = [
    {
      quote:
        "In just a single payroll cycle, PayPilot eliminated our spreadsheet reconciliation errors. The Sentinel AI flag resolution saved us hours of compliance panic.",
      name: "Jamie Marshall",
      company: "VP Operations, Exponent Dynamics",
      image: "/testimonial-avatar-1.jpg",
    },
    {
      quote:
        "PayPilot has revolutionized how our team validates custom employee contracts. Having live recomputation before finalizing pay is a game-changer.",
      name: "Sarah Chen",
      company: "Head of People & HR, TechFlow Global",
      image: "/testimonial-avatar-2.jpg",
    },
    {
      quote:
        "The statutory audit and dual Old vs New Tax Regime projections ensure zero employee disputes. What used to take days now takes 12 seconds.",
      name: "Marcus Rodriguez",
      company: "Finance Director, InnovateCorp",
      image: "/testimonial-avatar-3.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
    }, 10000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleNavigationClick = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTestimonial(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };

  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      <div className="self-stretch px-2 overflow-hidden flex justify-start items-center">
        <div className="flex-1 py-12 md:py-16 flex flex-col md:flex-row justify-center items-center gap-6 max-w-[1060px] mx-auto w-full">
          <div className="self-stretch px-3 md:px-12 justify-center items-center gap-6 flex flex-col md:flex-row flex-1">
            <img
              className="w-36 h-36 md:w-44 md:h-44 rounded-2xl object-cover border border-[#E2E8F0] shadow-sm transition-all duration-500"
              style={{
                opacity: isTransitioning ? 0.6 : 1,
                transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
              }}
              src={testimonials[activeTestimonial].image}
              alt={testimonials[activeTestimonial].name}
            />
            <div className="flex-1 px-4 py-2 flex flex-col justify-start items-start gap-4">
              <div
                className="text-[#49423D] text-xl md:text-2xl font-medium leading-8 md:leading-10 font-serif tracking-tight transition-all duration-500"
                style={{ filter: isTransitioning ? 'blur(4px)' : 'blur(0px)' }}
              >
                "{testimonials[activeTestimonial].quote}"
              </div>
              <div
                className="flex flex-col gap-0.5 transition-all duration-500"
                style={{ filter: isTransitioning ? 'blur(4px)' : 'blur(0px)' }}
              >
                <div className="text-[#37322F] text-base font-semibold font-sans">
                  {testimonials[activeTestimonial].name}
                </div>
                <div className="text-[#64748B] text-sm font-normal font-sans">
                  {testimonials[activeTestimonial].company}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="pr-6 flex gap-2">
            <button
              onClick={() => handleNavigationClick((activeTestimonial - 1 + testimonials.length) % testimonials.length)}
              className="w-9 h-9 rounded-full border border-[#D1D5DB] bg-white flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#37322F" strokeWidth="2">
                <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => handleNavigationClick((activeTestimonial + 1) % testimonials.length)}
              className="w-9 h-9 rounded-full border border-[#D1D5DB] bg-white flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#37322F" strokeWidth="2">
                <path d="M9 18L15 12L9 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;

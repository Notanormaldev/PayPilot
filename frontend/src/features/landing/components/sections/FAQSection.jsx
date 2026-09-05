import React, { useState } from 'react';
import { Badge } from '../ui/Badge';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'What makes PayPilot different from traditional payroll systems?',
      answer:
        'Traditional payroll tools use static checklists and require manual spreadsheet calculations. PayPilot uses a deterministic calculation engine combined with the Sentinel AI Anomaly Guard, defending every number and enabling live payslip recomputation before payments are finalized.',
    },
    {
      question: 'How does PayPilot handle statutory compliance (PF, ESI, TDS)?',
      answer:
        'PayPilot automatically evaluates period-correct employee contracts, validates statutory caps for EPFO and ESIC, and calculates dual tax regime projections (Old vs New) with instant tax-saving recommendations.',
    },
    {
      question: 'Can Sentinel AI detect ghost employees or duplicate bank accounts?',
      answer:
        'Yes. Sentinel continuously runs background statistical audits across all employee master records, flagging duplicate account numbers, sudden unapproved salary spikes, and missing KYC data before payrun approval.',
    },
    {
      question: 'How fast can our organization get onboarded?',
      answer:
        'You can import your entire workforce roster and salary structure templates via standard CSV or API sync. Most companies run their first live payrun within 24 to 48 hours.',
    },
    {
      question: 'Can employees view their payslips and request leaves online?',
      answer:
        'Yes. PayPilot features a dedicated Employee Self-Service Portal where employees can log biometric attendance, request leaves with automated manager approval routing, and download PDF payslips.',
    },
  ];

  return (
    <div id="faq" className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      {/* Header */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4 text-center">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="5" stroke="#37322F" strokeWidth="1" />
                <path d="M6 3.5V6.5" stroke="#37322F" strokeWidth="1" strokeLinecap="round" />
                <circle cx="6" cy="8.5" r="0.5" fill="#37322F" />
              </svg>
            }
            text="Support & Help"
          />
          <div className="self-stretch text-center text-[#49423D] text-3xl md:text-5xl font-semibold leading-tight font-sans tracking-tight">
            Frequently asked questions
          </div>
          <div className="self-stretch text-center text-[#605A57] text-base font-normal leading-7 font-sans">
            Everything you need to know about PayPilot’s calculation engine, compliance, and security.
          </div>
        </div>
      </div>

      {/* Accordion */}
      <div className="w-full max-w-[800px] px-4 py-10 flex flex-col gap-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                isOpen ? 'border-[#CBD5E1] shadow-sm' : 'border-[#E2E8F0]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 bg-transparent border-none cursor-pointer"
              >
                <span className="text-[#37322F] text-sm md:text-base font-semibold font-sans">
                  {faq.question}
                </span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isOpen ? 'bg-[#37322F] text-white' : 'bg-slate-100 text-[#64748B]'
                  }`}
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-[#605A57] leading-relaxed font-sans border-t border-slate-50 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSection;

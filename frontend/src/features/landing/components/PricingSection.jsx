import React, { useState } from 'react';
import { Badge } from './Badge';

export const PricingSection = ({ onLaunchDemo, onOpenAuth }) => {
  const [billingPeriod, setBillingPeriod] = useState('annually');

  const plans = [
    {
      name: 'Starter',
      desc: 'Ideal for growing teams seeking deterministic batch payroll calculations.',
      price: billingPeriod === 'annually' ? '₹0' : '₹0',
      period: 'forever free up to 25 staff',
      features: [
        'Up to 25 Employees',
        'Deterministic Salary Rules Engine',
        'Automated PF & ESI Deductions',
        'PDF Payslip Generation',
        'Community Support',
      ],
      buttonText: 'Start Free',
      popular: false,
    },
    {
      name: 'Professional',
      desc: 'Complete workforce management with Sentinel compliance anomaly watchdog.',
      price: billingPeriod === 'annually' ? '₹4,999' : '₹5,999',
      period: 'per month billed annually',
      features: [
        'Up to 500 Employees',
        'Sentinel AI Statutory Anomaly Guard',
        'Dual Tax Regime Projections (Old vs New)',
        'Biometric Attendance Sync',
        'Employee Self-Service Portal',
        'Direct Bank Payout Batch Files',
      ],
      buttonText: 'Launch Pro Demo',
      popular: true,
    },
    {
      name: 'Enterprise',
      desc: 'Custom multi-entity payroll automation with dedicated compliance SLA.',
      price: billingPeriod === 'annually' ? '₹14,999' : '₹17,999',
      period: 'per month billed annually',
      features: [
        'Unlimited Employees & Multi-Entity',
        'Custom Salary Rule Scripts',
        'Dedicated Sentinel Compliance SLA',
        'Custom ERP & HRMS Integrations',
        'Immutable Audit Trail Export',
        '24/7 Priority Support',
      ],
      buttonText: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div id="pricing" className="w-full flex flex-col justify-center items-center gap-2 border-b border-[rgba(55,50,47,0.12)]">
      {/* Header */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4 text-center">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 1V11M8.5 3H4.75C4.28587 3 3.84075 3.18437 3.51256 3.51256C3.18437 3.84075 3 4.28587 3 4.75C3 5.21413 3.18437 5.65925 3.51256 5.98744C3.84075 6.31563 4.28587 6.5 4.75 6.5H7.25C7.71413 6.5 8.15925 6.68437 8.48744 7.01256C8.81563 7.34075 9 7.78587 9 8.25C9 8.71413 8.81563 9.15925 8.48744 9.48744C8.15925 9.81563 7.71413 10 7.25 10H3.5"
                  stroke="#37322F"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            text="Plans & Pricing"
          />
          <div className="self-stretch text-center text-[#49423D] text-3xl md:text-5xl font-semibold leading-tight font-sans tracking-tight">
            Choose the perfect plan for your business
          </div>
          <div className="self-stretch text-center text-[#605A57] text-base font-normal leading-7 font-sans">
            Scale workforce operations with flexible pricing that grows with your team.
            <br />
            Start free, upgrade when you're ready.
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="self-stretch px-6 py-6 flex justify-center items-center">
        <div className="p-1 bg-[rgba(55,50,47,0.06)] rounded-full flex items-center gap-1 border border-[rgba(55,50,47,0.08)]">
          <button
            onClick={() => setBillingPeriod('annually')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors border-none ${
              billingPeriod === 'annually' ? 'bg-white text-[#37322F] shadow-sm' : 'bg-transparent text-[#64748B]'
            }`}
          >
            Annual (Save 20%)
          </button>
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors border-none ${
              billingPeriod === 'monthly' ? 'bg-white text-[#37322F] shadow-sm' : 'bg-transparent text-[#64748B]'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="w-full max-w-[1060px] px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border transition-all ${
              plan.popular
                ? 'border-[#37322F] shadow-[0px_8px_24px_rgba(55,50,47,0.08)] relative'
                : 'border-[#E2E8F0] shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-[-12px] right-6 bg-[#37322F] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-[#37322F] mb-2">{plan.name}</h3>
              <p className="text-xs text-[#64748B] mb-6 leading-relaxed">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#37322F]">{plan.price}</span>
                <span className="text-xs text-[#64748B] ml-1">/ {plan.period}</span>
              </div>

              <div className="space-y-3 mb-8 border-t border-[#F1F5F9] pt-6">
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-xs text-[#37322F] font-medium">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onLaunchDemo}
              className={`w-full py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                plan.popular
                  ? 'bg-[#37322F] text-white hover:bg-[#201D1B] border-[#37322F]'
                  : 'bg-white text-[#37322F] hover:bg-slate-50 border-[#CBD5E1]'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingSection;

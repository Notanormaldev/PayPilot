import React from 'react';
import { BrandLogo } from '../../../../components/BrandLogo';

export const FooterSection = ({ onOpenAuth, onLaunchDemo }) => {
  return (
    <footer className="w-full pt-10 pb-8 flex flex-col justify-start items-start max-w-[1060px] mx-auto px-4">
      {/* Main Footer Content */}
      <div className="self-stretch flex flex-col md:flex-row justify-between items-start pb-8 border-b border-[rgba(55,50,47,0.12)] gap-8">
        {/* Brand Info */}
        <div className="flex flex-col justify-start items-start gap-4">
          <BrandLogo size={28} />
          <p className="text-[rgba(73,66,61,0.80)] text-xs font-medium leading-[18px] font-sans max-w-[260px]">
            Autonomous HRMS & Sentinel Payroll Engine for high-growth enterprises.
          </p>
          <div className="text-[rgba(73,66,61,0.60)] text-xs">
            Direct inquiry: <a href="mailto:support@paypilot.internal" className="text-blue-600 underline">support@paypilot.internal</a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="flex flex-wrap gap-8 sm:gap-16">
          <div className="flex flex-col gap-2.5">
            <span className="text-[rgba(73,66,61,0.50)] text-xs font-bold uppercase tracking-wider font-sans">
              Platform
            </span>
            <button onClick={() => onOpenAuth('signin')} className="text-[#49423D] text-xs hover:text-black text-left bg-transparent border-none cursor-pointer">
              Autonomous Payruns
            </button>
            <a href="#bento" className="text-[#49423D] text-xs hover:text-black text-left text-decoration-none">
              Sentinel Anomaly Guard
            </a>
            <a href="#features" className="text-[#49423D] text-xs hover:text-black text-left text-decoration-none">
              Employee Self-Service
            </a>
            <a href="#pricing" className="text-[#49423D] text-xs hover:text-black text-left text-decoration-none">
              Dual Tax Regime Projections
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-[rgba(73,66,61,0.50)] text-xs font-bold uppercase tracking-wider font-sans">
              Resources
            </span>
            <a href="#faq" className="text-[#49423D] text-xs hover:text-black text-left text-decoration-none">
              FAQ & Help Center
            </a>
            <a href="#pricing" className="text-[#49423D] text-xs hover:text-black text-left text-decoration-none">
              Plans & Pricing
            </a>
            <button onClick={() => onOpenAuth('signin')} className="text-[#49423D] text-xs hover:text-black text-left bg-transparent border-none cursor-pointer">
              Client Sign In
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-[rgba(73,66,61,0.50)] text-xs font-bold uppercase tracking-wider font-sans">
              Security
            </span>
            <span className="text-[#49423D] text-xs">TLS 1.3 & AES-256</span>
            <span className="text-[#49423D] text-xs">Immutable Audit Logs</span>
            <span className="text-[#49423D] text-xs">RBAC Tiers Enforced</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="self-stretch pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#64748B] gap-3">
        <div>© 2026 PayPilot Global Inc. All rights reserved.</div>
        <div className="flex gap-4">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security Whitepaper</span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

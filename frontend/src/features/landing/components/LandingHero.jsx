import React, { useState } from 'react';
import { IconSearch, IconSparkles, IconArrowRight, IconShieldCheck, IconCpu } from '@tabler/icons-react';

const TRUSTED_LOGOS = [
  'Odoo',
  'Zylker Global',
  'Northwind Corp',
  'Globex Tech',
  'Initech Systems',
  'Stark Dynamics',
  'Acme Holdings',
];

export const LandingHero = ({ onLaunchDemo, onOpenAuth }) => {
  const [searchVal, setSearchVal] = useState('');

  const handleAction = (e) => {
    e.preventDefault();
    if (onLaunchDemo) {
      onLaunchDemo();
    } else if (onOpenAuth) {
      onOpenAuth('signin');
    }
  };

  return (
    <section className="pp-hero">
      <div className="pp-hero-bg-glow" />

      {/* Top Badge */}
      <div className="pp-hero-badge">
        <span className="pp-hero-badge-dot" />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
          Autonomous HRMS & Sentinel Payroll Engine
        </span>
      </div>

      {/* Headline */}
      <h1 className="pp-hero-title">
        The modern way to run your{' '}
        <span className="pp-hero-title-gradient">Autonomous Payroll</span>
      </h1>

      {/* Subtitle */}
      <p className="pp-hero-subtitle">
        Eliminate manual spreadsheet errors, catch statutory tax flags before payment,
        and recompute complex payslips live with zero ghost-employee risk.
      </p>

      {/* Interactive Demo Search Bar */}
      <form className="pp-hero-action-bar" onSubmit={handleAction}>
        <div className="pp-hero-input-group">
          <IconSearch size={18} color="#94A3B8" />
          <input
            type="text"
            className="pp-hero-input"
            placeholder="Try searching 'Meera Krishnan' or click Launch Demo..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <button type="submit" className="pp-hero-action-btn">
          <IconSparkles size={16} />
          <span>Launch Demo</span>
        </button>
      </form>

      {/* Trusted Logos Carousel */}
      <div className="pp-trusted-section">
        <span className="pp-trusted-label">Trusted by high-growth workforce teams</span>
        <div className="pp-trusted-carousel">
          <div className="pp-trusted-track">
            {[...TRUSTED_LOGOS, ...TRUSTED_LOGOS].map((name, idx) => (
              <span key={`${name}-${idx}`} className="pp-trusted-item">
                <IconCpu size={18} color="#2563EB" style={{ opacity: 0.7 }} />
                <span>{name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

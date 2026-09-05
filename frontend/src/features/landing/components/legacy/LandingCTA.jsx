import React from 'react';
import { IconSparkles, IconArrowRight, IconShieldCheck } from '@tabler/icons-react';

export const LandingCTA = ({ onLaunchDemo, onOpenAuth }) => {
  return (
    <section id="cta" className="pp-cta-section">
      <div className="pp-cta-card">
        <div className="pp-cta-glow-1" />
        <div className="pp-cta-glow-2" />

        <div className="pp-cta-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#93C5FD', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            <IconShieldCheck size={16} />
            <span>Ready for Zero-Dispute Payroll</span>
          </div>
          <h2 className="pp-cta-title">
            Transform your company’s payroll in minutes.
          </h2>
          <p className="pp-cta-desc">
            Stop worrying about statutory penalties, manual formula errors, and late night payrun validations.
            Start running autonomous, explainable payroll today.
          </p>
        </div>

        <div className="pp-cta-actions">
          <button
            className="pp-cta-btn-main"
            onClick={onLaunchDemo}
          >
            <span>Launch Admin Demo</span>
          </button>
          <button
            className="pp-cta-btn-ghost"
            onClick={() => onOpenAuth('signin')}
          >
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </section>
  );
};

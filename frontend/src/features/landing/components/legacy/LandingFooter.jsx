import React from 'react';
import { IconArrowUp, IconArrowRight, IconMail, IconPointFilled } from '@tabler/icons-react';
import { BrandLogo } from '../../../../components/BrandLogo';

export const LandingFooter = ({ onOpenAuth }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="pp-footer">
      <div className="pp-footer-top">
        {/* Top Header Row */}
        <div className="pp-footer-header-row">
          <div className="pp-footer-badge">
            <IconPointFilled size={14} color="#93C5FD" />
            <span>Autonomous HRMS & Sentinel Platform</span>
          </div>

          <button className="pp-footer-scroll-btn" onClick={scrollToTop}>
            <span>Scroll to Top</span>
            <IconArrowUp size={16} />
          </button>
        </div>

        {/* Headline */}
        <h2 className="pp-footer-headline">
          Ready to turn complex workforce calculations into instant, verifiable payments?
        </h2>

        {/* Nav & Contact Row */}
        <div className="pp-footer-nav-row">
          <div className="pp-footer-contact-group">
            <span className="pp-footer-contact-label">Reach out to our team at:</span>
            <a href="mailto:support@paypilot.internal" className="pp-footer-contact-email">
              <span>support@paypilot.internal</span>
              <IconArrowRight size={20} />
            </a>
          </div>

          <nav className="pp-footer-links">
            <button className="pp-footer-link" onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Features
            </button>
            <button className="pp-footer-link" onClick={() => scrollTo('how')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              How It Works
            </button>
            <button className="pp-footer-link" onClick={() => scrollTo('sentinel')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Sentinel AI
            </button>
            <button className="pp-footer-link" onClick={() => scrollTo('faq')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              FAQ
            </button>
            <button className="pp-footer-link" onClick={() => onOpenAuth('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Sign In
            </button>
          </nav>
        </div>
      </div>

      {/* Big Watermark Lower Area with Logo */}
      <div className="pp-footer-watermark-area">
        <svg
          className="pp-footer-watermark-svg"
          viewBox="0 0 900 120"
          preserveAspectRatio="xMidYMid meet"
          aria-label="PAYPILOT"
        >
          <text
            x="50%"
            y="75%"
            dominantBaseline="alphabetic"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="105"
            fontWeight="900"
            letterSpacing="-0.04em"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            PAYPILOT
          </text>
        </svg>
      </div>
    </footer>
  );
};

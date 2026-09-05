import React, { useState, useEffect } from 'react';

export const LogosCarousel = ({
  logos = [
    'Odoo',
    'Zylker Global',
    'Northwind Corp',
    'Globex Tech',
    'Initech Systems',
    'Stark Dynamics',
    'Acme Holdings',
  ],
  className = '',
}) => {
  return (
    <div
      className={`pp-ui-logos-carousel ${className}`}
      style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '48px',
          animation: 'scroll-logos 28s linear infinite',
          width: 'max-content',
        }}
      >
        {[...logos, ...logos].map((logo, idx) => (
          <div
            key={`${logo}-${idx}`}
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#334155',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: 0.65,
            }}
          >
            <span>{logo}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogosCarousel;

import React from 'react';

export const EffortlessIntegration = ({ width = 400, height = 250, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer orbit */}
      <div
        style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          border: '1px solid rgba(55, 50, 47, 0.15)',
        }}
      />
      {/* Middle orbit */}
      <div
        style={{
          position: 'absolute',
          width: '170px',
          height: '170px',
          borderRadius: '50%',
          border: '1px solid rgba(55, 50, 47, 0.2)',
        }}
      />
      {/* Inner orbit */}
      <div
        style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '1px solid rgba(55, 50, 47, 0.25)',
        }}
      />

      {/* Center Brand Icon */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src="/logo.svg" alt="PayPilot" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
      </div>

      {/* Surrounding Integrations */}
      <img
        src="/slack-logo-icon.jpg"
        alt="Slack"
        style={{
          position: 'absolute',
          top: '30px',
          left: '70px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      />
      <img
        src="/stripe-logo-icon.jpg"
        alt="Stripe"
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '70px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      />
      <img
        src="/github-logo-icon.jpg"
        alt="GitHub"
        style={{
          position: 'absolute',
          top: '40px',
          right: '80px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      />
      <img
        src="/notion-logo-icon.jpg"
        alt="Notion"
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '80px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}
      />
    </div>
  );
};

export default EffortlessIntegration;

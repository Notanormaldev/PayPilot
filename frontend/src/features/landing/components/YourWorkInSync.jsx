import React from 'react';

export const YourWorkInSync = ({ width = 400, height = 250, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        position: 'relative',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          transform: 'scale(0.95)',
        }}
      >
        {/* Message 1 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <img
            src="/professional-woman-avatar-with-short-brown-hair-an.jpg"
            alt="Meera"
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#37322F',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '10px', color: '#64748B', marginBottom: '2px' }}>
              Meera Krishnan (Admin)
            </div>
            Executed March payrun for 1,308 employees. Sentinel report is 100% clean.
          </div>
        </div>

        {/* Message 2 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', alignSelf: 'flex-end' }}>
          <div
            style={{
              background: '#37322F',
              color: '#FFFFFF',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '10px', color: '#CBD5E1', marginBottom: '2px' }}>
              Neha Gupta (Payroll Lead)
            </div>
            Direct deposits disbursed and Form 16 projections dispatched to self-service.
          </div>
          <img
            src="/professional-man-avatar-with-beard-and-glasses-loo.jpg"
            alt="Neha"
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  );
};

export default YourWorkInSync;

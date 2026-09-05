import React from 'react';

export const NumbersThatSpeak = ({ width = '100%', height = '100%', className = '' }) => {
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
          width: '280px',
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(47,48,55,0.12)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Total Disbursed (MTD)</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: '99px' }}>
            +18.4%
          </span>
        </div>

        <div style={{ fontSize: '26px', fontWeight: 800, color: '#09090B', letterSpacing: '-0.03em' }}>
          ₹42,84,200
        </div>

        {/* Mini progress bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748B' }}>
            <span>Net Salaries</span>
            <span style={{ fontWeight: 600, color: '#09090B' }}>82.4%</span>
          </div>
          <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: '82.4%', height: '100%', background: '#2563EB', borderRadius: '99px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748B' }}>
            <span>TDS / Statutory</span>
            <span style={{ fontWeight: 600, color: '#09090B' }}>14.8%</span>
          </div>
          <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: '14.8%', height: '100%', background: '#F59E0B', borderRadius: '99px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumbersThatSpeak;

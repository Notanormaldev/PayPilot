import React from 'react';

export const SmartSimpleBrilliant = ({ width = '100%', height = '100%', className = '' }) => {
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
          position: 'relative',
          width: '295px',
          height: '212px',
          transform: 'scale(1.15)',
        }}
      >
        {/* Left card */}
        <div style={{ position: 'absolute', left: '120px', top: '0px' }}>
          <div style={{ transform: 'rotate(5deg)', transformOrigin: 'center' }}>
            <div
              style={{
                width: '155px',
                background: '#FFFFFF',
                borderRadius: '9px',
                padding: '6px',
                boxShadow: '0px 0px 0px 1px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.07)',
              }}
            >
              {/* Event 1 (Amber) */}
              <div
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: 'rgba(245,158,11,0.1)',
                  display: 'flex',
                  marginBottom: '4px',
                }}
              >
                <div style={{ width: '3px', background: '#F59E0B' }} />
                <div style={{ padding: '4px', width: '100%' }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#92400E' }}>Payrun March 2026</div>
                  <div style={{ fontSize: '8px', color: '#B45309' }}>1,308 staff validated</div>
                </div>
              </div>

              {/* Event 2 (Blue) */}
              <div
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: 'rgba(37,99,235,0.1)',
                  display: 'flex',
                }}
              >
                <div style={{ width: '3px', background: '#2563EB' }} />
                <div style={{ padding: '4px', width: '100%' }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#1E40AF' }}>TDS & PF Direct Deposit</div>
                  <div style={{ fontSize: '8px', color: '#1D4ED8' }}>₹42.8 Lakh ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right card */}
        <div style={{ position: 'absolute', left: '10px', top: '20px' }}>
          <div style={{ transform: 'rotate(-4deg)', transformOrigin: 'center' }}>
            <div
              style={{
                width: '160px',
                background: '#FFFFFF',
                borderRadius: '9px',
                padding: '8px',
                boxShadow: '0px 0px 0px 1px rgba(0,0,0,0.08), 0px 4px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                Sentinel Audit Radar
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748B' }}>
                  <span>Statutory Checks</span>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>100% Passed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748B' }}>
                  <span>Ghost Accounts</span>
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>0 Detected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748B' }}>
                  <span>Discrepancy Flags</span>
                  <span style={{ color: '#F59E0B', fontWeight: 700 }}>Auto-Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSimpleBrilliant;

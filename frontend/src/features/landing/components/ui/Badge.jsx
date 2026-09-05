import React from 'react';

export const Badge = ({ icon, text }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        backgroundColor: '#FFFFFF',
        borderRadius: '90px',
        border: '1px solid rgba(2, 6, 23, 0.08)',
        boxShadow: '0px 0px 0px 4px rgba(55, 50, 47, 0.05), 0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ color: '#37322F', fontSize: '12px', fontWeight: 500, lineHeight: '12px', fontFamily: 'inherit' }}>
        {text}
      </div>
    </div>
  );
};

export default Badge;

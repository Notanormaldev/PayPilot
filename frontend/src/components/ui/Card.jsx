import React from 'react';

export const Card = ({
  children,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div
      className={`pp-ui-card ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '', style = {}, ...props }) => {
  return (
    <div
      className={`pp-ui-card-content ${className}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

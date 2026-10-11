import React from 'react';

export default function OfficeLogo({ size = 70, className = '', rounded = true }) {
  return (
    <div
      className={`office-logo-container ${className}`}
      style={{
        width: size,
        minWidth: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/logo.jpg"
        alt="Zonal Education Office Katugastota"
        className={`office-logo-img ${rounded ? 'rounded-logo' : ''}`}
        style={{
          width: size,
          height: 'auto',
          maxHeight: size,
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

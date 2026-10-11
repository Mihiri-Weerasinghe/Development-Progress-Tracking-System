import React from 'react';

export default function OfficeEmblem({ size = 80, className = '' }) {
  return (
    <div
      className={`emblem-wrapper ${className}`}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <filter id="emblemShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Golden Ring */}
        <circle cx="60" cy="60" r="54" stroke="url(#goldGrad)" strokeWidth="3" fill="none" opacity="0.9" />
        <circle cx="60" cy="60" r="50" stroke="#FDE68A" strokeWidth="1" strokeDasharray="2 3" fill="none" opacity="0.6" />

        {/* Shield Background */}
        <path
          d="M60 16 C82 16 94 28 94 54 C94 80 60 102 60 102 C60 102 26 80 26 54 C26 28 38 16 60 16 Z"
          fill="url(#shieldGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="2.5"
          filter="url(#emblemShadow)"
        />

        {/* Inner Decorative Arch */}
        <path
          d="M60 22 C78 22 88 32 88 54 C88 75 60 94 60 94 C60 94 32 75 32 54 C32 32 42 22 60 22 Z"
          fill="none"
          stroke="url(#glowGrad)"
          strokeWidth="1.2"
          opacity="0.5"
        />

        {/* Flame of Wisdom / Lamp */}
        <path
          d="M60 28 C64 36 67 40 65 44 C63 47 57 47 55 44 C53 40 56 36 60 28 Z"
          fill="url(#goldGrad)"
        />
        <circle cx="60" cy="38" r="2.5" fill="#FEF08A" />

        {/* Open Book of Knowledge */}
        <g transform="translate(36, 48)">
          {/* Left Page */}
          <path
            d="M24 8 C16 4 6 5 2 7 L2 27 C6 25 16 24 24 28 Z"
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="0.8"
          />
          {/* Right Page */}
          <path
            d="M24 8 C32 4 42 5 46 7 L46 27 C42 25 32 24 24 28 Z"
            fill="#F8FAFC"
            stroke="#94A3B8"
            strokeWidth="0.8"
          />
          {/* Book Spine */}
          <path d="M24 8 L24 28" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
          {/* Text lines on book */}
          <line x1="6" y1="12" x2="20" y2="12" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
          <line x1="6" y1="16" x2="20" y2="16" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
          <line x1="6" y1="20" x2="18" y2="20" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />

          <line x1="28" y1="12" x2="42" y2="12" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="16" x2="42" y2="16" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
          <line x1="28" y1="20" x2="40" y2="20" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Paddy / Laurel Sheaf Accent at bottom */}
        <g stroke="url(#goldGrad)" strokeWidth="1.2" strokeLinecap="round">
          <path d="M44 86 C50 90 56 91 60 91 C64 91 70 90 76 86" />
          <circle cx="52" cy="87" r="1.5" fill="#FBBF24" />
          <circle cx="60" cy="89" r="1.5" fill="#FBBF24" />
          <circle cx="68" cy="87" r="1.5" fill="#FBBF24" />
        </g>

        {/* Small Stars / Emblems */}
        <polygon points="60,11 61.5,14 65,14 62,16 63,19 60,17 57,19 58,16 55,14 58.5,14" fill="#FBBF24" />
      </svg>
    </div>
  );
}

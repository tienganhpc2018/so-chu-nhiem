import React from 'react';

// Mascot "Chú Robot Trí Tuệ" trợ lý EdTech THCS hiện đại
export const MascotRobot = ({ mode = 'happy', className = 'w-12 h-12', size = 48 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md transition-transform hover:scale-105"
      >
        {/* Antenna */}
        <line x1="50" y1="18" x2="50" y2="8" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="6" r="4" fill="#F97316" className="animate-pulse" />

        {/* Head */}
        <rect x="22" y="18" width="56" height="42" rx="14" fill="#10B981" />
        <rect x="26" y="22" width="48" height="34" rx="10" fill="#047857" />

        {/* Face Screen */}
        <rect x="30" y="26" width="40" height="26" rx="7" fill="#0F172A" />

        {/* Eyes based on mode */}
        {mode === 'happy' && (
          <>
            <circle cx="42" cy="38" r="3.5" fill="#34D399" />
            <circle cx="58" cy="38" r="3.5" fill="#34D399" />
            <path d="M44 43 Q50 48 56 43" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {mode === 'celebrate' && (
          <>
            <path d="M38 40 L42 36 L46 40" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M54 40 L58 36 L62 40" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M43 45 Q50 50 57 45" stroke="#FDBA74" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        )}

        {mode === 'thinking' && (
          <>
            <circle cx="40" cy="38" r="3" fill="#6EE7B7" />
            <circle cx="60" cy="38" r="3" fill="#6EE7B7" />
            <line x1="42" y1="45" x2="58" y2="45" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {mode === 'danger' && (
          <>
            <line x1="38" y1="35" x2="44" y2="41" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="44" y1="35" x2="38" y2="41" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="56" y1="35" x2="62" y2="41" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="62" y1="35" x2="56" y2="41" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M44 47 Q50 43 56 47" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Ears */}
        <rect x="16" y="30" width="6" height="18" rx="3" fill="#F97316" />
        <rect x="78" y="30" width="6" height="18" rx="3" fill="#F97316" />

        {/* Body */}
        <rect x="28" y="63" width="44" height="30" rx="10" fill="#10B981" />
        <rect x="34" y="68" width="32" height="20" rx="6" fill="#ECFDF5" />

        {/* Chest Badge (Star) */}
        <polygon points="50,72 52,77 57,77 53,80 55,85 50,82 45,85 47,80 43,77 48,77" fill="#F97316" />

        {/* Arms */}
        <path d="M26 68 Q14 74 18 84" stroke="#059669" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M74 68 Q86 64 88 54" stroke="#059669" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="88" cy="52" r="3.5" fill="#F97316" />
      </svg>
    </div>
  );
};

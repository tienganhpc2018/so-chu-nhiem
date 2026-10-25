import React from 'react';
import { getShortStudentName } from '../data/defaultDuckData';

/**
 * 8 BẢNG MÀU LÔNG VỊT 3D ĐA DẠNG (Chuẩn Version Gốc):
 * - Trắng, Vàng, Nâu, Xám, Xanh nhạt, Hồng, Đen, Kem
 */
export const DUCK_PALETTES = {
  white: {
    id: 'white',
    bodyGrad: 'url(#gradWhite)',
    headGrad: 'url(#gradWhiteHead)',
    stroke: '#cbd5e1',
    wing: '#f8fafc',
    wingStroke: '#94a3b8',
    beak: '#f97316',
    feet: '#ea580c',
    shadow: 'rgba(50, 30, 10, 0.35)'
  },
  yellow: {
    id: 'yellow',
    bodyGrad: 'url(#gradYellow)',
    headGrad: 'url(#gradYellowHead)',
    stroke: '#eab308',
    wing: '#fef08a',
    wingStroke: '#ca8a04',
    beak: '#ea580c',
    feet: '#c2410c',
    shadow: 'rgba(60, 40, 10, 0.35)'
  },
  brown: {
    id: 'brown',
    bodyGrad: 'url(#gradBrown)',
    headGrad: 'url(#gradBrownHead)',
    stroke: '#78350f',
    wing: '#b45309',
    wingStroke: '#78350f',
    beak: '#ea580c',
    feet: '#78350f',
    shadow: 'rgba(40, 20, 5, 0.4)'
  },
  gray: {
    id: 'gray',
    bodyGrad: 'url(#gradGray)',
    headGrad: 'url(#gradGrayHead)',
    stroke: '#475569',
    wing: '#94a3b8',
    wingStroke: '#334155',
    beak: '#ea580c',
    feet: '#334155',
    shadow: 'rgba(30, 30, 40, 0.35)'
  },
  mint: {
    id: 'mint',
    bodyGrad: 'url(#gradMint)',
    headGrad: 'url(#gradMintHead)',
    stroke: '#059669',
    wing: '#a7f3d0',
    wingStroke: '#047857',
    beak: '#f97316',
    feet: '#b45309',
    shadow: 'rgba(10, 40, 20, 0.35)'
  },
  pink: {
    id: 'pink',
    bodyGrad: 'url(#gradPink)',
    headGrad: 'url(#gradPinkHead)',
    stroke: '#db2777',
    wing: '#fbcfe8',
    wingStroke: '#be185d',
    beak: '#f97316',
    feet: '#9d174d',
    shadow: 'rgba(50, 15, 30, 0.35)'
  },
  black: {
    id: 'black',
    bodyGrad: 'url(#gradBlack)',
    headGrad: 'url(#gradBlackHead)',
    stroke: '#0f172a',
    wing: '#334155',
    wingStroke: '#020617',
    beak: '#ea580c',
    feet: '#0f172a',
    shadow: 'rgba(10, 10, 15, 0.45)'
  },
  cream: {
    id: 'cream',
    bodyGrad: 'url(#gradCream)',
    headGrad: 'url(#gradCreamHead)',
    stroke: '#d97706',
    wing: '#fef3c7',
    wingStroke: '#b45309',
    beak: '#f97316',
    feet: '#c2410c',
    shadow: 'rgba(50, 35, 15, 0.35)'
  }
};

const COLOR_KEYS = Object.keys(DUCK_PALETTES);

/**
 * SPRITE CHÚ VỊT 3D HOẠT HÌNH ĐÁNG YÊU (Version Gốc):
 * - Body hình elip 3D tròn trịa
 * - Đầu tròn với mắt to đen láy, điểm phản chiếu ánh sáng và má hồng
 * - Mỏ vịt cam tươi cười
 * - Đôi cánh vỗ nhịp nhàng (khi PANIC hoặc CAUGHT vỗ nhanh gấp đôi)
 * - Đôi chân lạch bạch di chuyển
 * - Bóng đổ tiếp xúc mặt đất dưới chân có độ mờ và chiều sâu
 * - Trạng thái: IDLE, WALK, RUN, PANIC, CAUGHT
 */
export const DuckSprite = ({
  duck,
  x = 0,
  y = 0,
  vx = 1,
  vy = 0,
  speechQuote = null,
  isQuacking = false,
  isCaught = false,
  isTarget = false,
  state = 'WALK', // 'IDLE' | 'WALK' | 'RUN' | 'PANIC' | 'CAUGHT'
  showName = true,
  colorIndex = 0,
  allNames = []
}) => {
  const isFacingRight = vx >= 0;
  const fullName = duck?.name || 'Vịt';
  const displayName = duck?.shortName || getShortStudentName(fullName, allNames);

  // Chọn palette màu sắc dựa trên index hoặc ID
  const paletteKey = COLOR_KEYS[Math.abs(colorIndex) % COLOR_KEYS.length];
  const palette = DUCK_PALETTES[paletteKey] || DUCK_PALETTES.yellow;

  const isPanic = state === 'PANIC';

  return (
    <div
      className={`absolute pointer-events-none select-none transition-transform duration-75 ${
        isCaught ? 'z-50 scale-140 -translate-y-6' : 'z-20'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -85%) ${isFacingRight ? 'scaleX(1)' : 'scaleX(-1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. Tia sáng Spotlight rọi từ trên cao khi bị bắt */}
      {isCaught && (
        <div
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-32 h-44 bg-gradient-to-b from-yellow-300/40 via-amber-400/20 to-transparent pointer-events-none -z-10"
          style={{ clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)' }}
        />
      )}

      {/* 2. Bóng đổ tiếp xúc mặt đất dưới chân vịt (Contact Shadow) */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-150"
        style={{
          width: isCaught ? '24px' : '46px',
          height: isCaught ? '6px' : '14px',
          backgroundColor: palette.shadow,
          filter: isCaught ? 'blur(4px)' : 'blur(2px)',
          opacity: isCaught ? 0.35 : 0.85
        }}
      />

      {/* 3. Vệt gió chuyển động hoạt hình (( quanh chú vịt khi chạy nhanh */}
      {(isPanic || Math.abs(vx) > 50) && !isCaught && (
        <div className="absolute -bottom-1 -left-3 pointer-events-none opacity-80">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <path d="M2 4C5 7 10 7 15 5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <path d="M4 11C7 13 12 13 17 10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
          </svg>
        </div>
      )}

      {/* 4. Giọt mồ hôi hốt hoảng khi hoảng loạn (PANIC) */}
      {isPanic && !isCaught && (
        <div className="absolute -top-5 right-1 text-sm animate-bounce z-45">
          💦
        </div>
      )}

      {/* 5. Nhãn Tên Học Sinh trên đầu vịt (Chế độ hiện tên) */}
      {showName && !isCaught && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-40 filter drop-shadow-xs"
          style={{ transform: isFacingRight ? 'none' : 'scaleX(-1)' }}
        >
          <div
            className={`px-2.5 py-0.5 rounded-full border-2 shadow-sm flex items-center space-x-1 transition-all ${
              isTarget
                ? 'bg-red-600 text-yellow-200 border-yellow-300 font-black text-xs scale-105 animate-pulse'
                : isQuacking
                ? 'bg-amber-100 text-[#1d4ed8] border-amber-400 font-black text-xs'
                : 'bg-white text-slate-900 border-slate-300 font-bold text-[11px]'
            }`}
          >
            <span>{displayName}</span>
            {isQuacking && <span className="text-[10px]">🔊</span>}
          </div>
        </div>
      )}

      {/* 7. HÌNH ẢNH 3D CHÚ VỊT SVG ĐÁNG YÊU */}
      <div className={`relative w-16 h-16 ${isPanic ? 'animate-bounce-fast' : isCaught ? 'animate-wiggle' : ''}`}>
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-sm"
        >
          <defs>
            {/* Bộ Gradients 3D cho các màu lông */}
            <radialGradient id="gradWhite" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
            <radialGradient id="gradWhiteHead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>

            <radialGradient id="gradYellow" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
            <radialGradient id="gradYellowHead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="75%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>

            <radialGradient id="gradBrown" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
            <radialGradient id="gradBrownHead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>

            <radialGradient id="gradGray" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
            <radialGradient id="gradGrayHead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="75%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>

            <radialGradient id="gradMint" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="70%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
            <radialGradient id="gradMintHead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#d1fae5" />
              <stop offset="75%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </radialGradient>

            <radialGradient id="gradPink" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="70%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </radialGradient>
            <radialGradient id="gradPinkHead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fdf2f8" />
              <stop offset="75%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#ec4899" />
            </radialGradient>

            <radialGradient id="gradBlack" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>
            <radialGradient id="gradBlackHead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="75%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            <radialGradient id="gradCream" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="70%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </radialGradient>
            <radialGradient id="gradCreamHead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fcd34d" />
            </radialGradient>
          </defs>

          {/* ĐÔI CHÂN VÀ MÀNG CHÂN LẠCH BẠCH */}
          <g className={!isCaught ? 'animate-duck-feet' : ''}>
            {/* Chân trái */}
            <path
              d="M24 51L22 58M22 58L17 60M22 58L22 61M22 58L26 60"
              stroke={palette.feet}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Chân phải */}
            <path
              d="M32 51L34 58M34 58L29 60M34 58L34 61M34 58L38 60"
              stroke={palette.feet}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* THÂN VỊT 3D HÌNH ELIP */}
          <ellipse
            cx="27"
            cy="40"
            rx="16"
            ry="12"
            fill={palette.bodyGrad}
            stroke={palette.stroke}
            strokeWidth="1.2"
          />

          {/* ĐUÔI VỊT VỂNH LÊN */}
          <path
            d="M13 37C10 35 7 34 5 36C6 39 9 41 13 41Z"
            fill={palette.bodyGrad}
            stroke={palette.stroke}
            strokeWidth="1"
          />

          {/* CÁNH VỊT (VỖ CÁNH KHI CHẠY / HOẢNG SỢ / BỊ BẮT) */}
          <g
            className={`origin-[26px_36px] ${
              isCaught || isPanic ? 'animate-wing-fast' : 'animate-wing-flap'
            }`}
          >
            <ellipse
              cx="26"
              cy="38"
              rx="9"
              ry="6"
              fill={palette.wing}
              stroke={palette.wingStroke}
              strokeWidth="1.2"
              transform="rotate(-15 26 38)"
            />
            {/* Khía lông cánh */}
            <path
              d="M18 39C21 41 24 41 27 39"
              stroke={palette.wingStroke}
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>

          {/* ĐẦU VỊT 3D TRÒN TRỊA */}
          <circle
            cx="40"
            cy="27"
            r="11"
            fill={palette.headGrad}
            stroke={palette.stroke}
            strokeWidth="1.2"
          />

          {/* MÁ HỒNG CUTE */}
          <ellipse
            cx="39"
            cy="32"
            rx="3"
            ry="1.8"
            fill="#f472b6"
            opacity="0.6"
          />

          {/* MẮT TO ĐEN LÁY CÓ ĐIỂM SÁNG PHẢN CHIẾU */}
          <circle cx="43" cy="25" r="2.8" fill="#0f172a" />
          <circle cx="44.2" cy="24" r="1.1" fill="#ffffff" />
          <circle cx="42.2" cy="26.2" r="0.6" fill="#ffffff" />

          {/* MỎ VỊT MÀU CAM NỞ NỤ CƯỜI */}
          <path
            d="M48 27C55 27 57 30 55 33C52 35 48 33 46 31Z"
            fill={palette.beak}
            stroke="#c2410c"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Lỗ mũi nhỏ xinh */}
          <circle cx="49" cy="29" r="0.5" fill="#9a3412" />
        </svg>
      </div>
    </div>
  );
};

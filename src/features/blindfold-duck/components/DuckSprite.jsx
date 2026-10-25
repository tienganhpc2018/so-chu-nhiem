import React from 'react';
import { getShortStudentName } from '../data/defaultDuckData';

/**
 * 6 BẢNG MÀU LÔNG VỊT 3D CHUẨN ẢNH THAM CHIẾU (ĐẦU ĐEN / MỎ VÀNG CAM / THÂN PASTEL):
 * - Trắng kem, Hồng pastel, Xanh ngọc mint, Vàng nhạt, Nâu đất, Xanh biển nhạt
 */
export const DUCK_PALETTES = [
  { body: '#ffffff', bodyStroke: '#cbd5e1', head: '#1e293b', beak: '#f59e0b', feet: '#ea580c' }, // Trắng đầu đen
  { body: '#fbcfe8', bodyStroke: '#f472b6', head: '#0f172a', beak: '#f97316', feet: '#ea580c' }, // Hồng pastel đầu đen
  { body: '#a7f3d0', bodyStroke: '#34d399', head: '#1e293b', beak: '#f59e0b', feet: '#ea580c' }, // Xanh mint đầu đen
  { body: '#fef08a', bodyStroke: '#facc15', head: '#1e293b', beak: '#ea580c', feet: '#ea580c' }, // Vàng nhạt đầu đen
  { body: '#fed7aa', bodyStroke: '#fb923c', head: '#0f172a', beak: '#f59e0b', feet: '#ea580c' }, // Cam đào đầu đen
  { body: '#bae6fd', bodyStroke: '#38bdf8', head: '#1e293b', beak: '#f97316', feet: '#ea580c' }  // Xanh dương nhạt
];

/**
 * SPRITE CHÚ VỊT 3D BÉO TRÒN CHUẨN 100% ẢNH THAM CHIẾU:
 * - Thân béo múp hình tròn 3D mịn màng
 * - Đầu tròn màu xanh đen / đen láy
 * - Mỏ dẹt màu vàng cam tươi tắn
 * - Đôi chân cam lạch bạch
 * - Nhãn tên học sinh màu trắng dạng viên thuốc (pill) trên đầu: [Hân], [Bích], [Khiêm], [Diễm]...
 */
export const DuckSprite = ({
  duck,
  x = 0,
  y = 0,
  vx = 1,
  vy = 0,
  isQuacking = false,
  isCaught = false,
  isTarget = false,
  state = 'WALK',
  showName = true,
  colorIndex = 0,
  allNames = []
}) => {
  const isFacingRight = vx >= 0;
  const fullName = duck?.name || 'Vịt';
  const displayName = duck?.shortName || getShortStudentName(fullName, allNames);

  const palette = DUCK_PALETTES[Math.abs(colorIndex) % DUCK_PALETTES.length];
  const isPanic = state === 'PANIC';

  return (
    <div
      className={`absolute pointer-events-none select-none transition-transform duration-75 ${
        isCaught ? 'z-50 scale-140 -translate-y-8' : 'z-20'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -85%) ${isFacingRight ? 'scaleX(1)' : 'scaleX(-1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. Bóng đổ tiếp xúc mặt đất dưới chân vịt */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: isCaught ? '24px' : '44px',
          height: isCaught ? '6px' : '12px',
          backgroundColor: 'rgba(50, 30, 10, 0.35)',
          filter: isCaught ? 'blur(4px)' : 'blur(2px)',
          opacity: isCaught ? 0.3 : 0.85
        }}
      />

      {/* 2. NHÃN TÊN HỌC SINH HÌNH VIÊN THUỐC TRẮNG CHUẨN ẢNH THAM CHIẾU */}
      {showName && !isCaught && (
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-40 filter drop-shadow-xs"
          style={{ transform: isFacingRight ? 'none' : 'scaleX(-1)' }}
        >
          <div
            className={`px-2.5 py-0.5 rounded-full border shadow-sm flex items-center justify-center transition-all ${
              isTarget
                ? 'bg-red-600 text-yellow-200 border-yellow-300 font-black text-xs scale-105 animate-pulse'
                : 'bg-white text-slate-900 border-slate-300 font-bold text-[11px]'
            }`}
          >
            <span>{displayName}</span>
          </div>
        </div>
      )}

      {/* 3. HÌNH ẢNH 3D CHÚ VỊT BÉO TRÒN SVG */}
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
            {/* Gradient 3D cho thân vịt béo tròn */}
            <radialGradient id={`duckBodyGrad_${palette.body}`} cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="45%" stopColor={palette.body} />
              <stop offset="100%" stopColor={palette.bodyStroke} />
            </radialGradient>

            {/* Gradient cho đầu đen tròn */}
            <radialGradient id="duckHeadDark" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>
          </defs>

          {/* ĐÔI CHÂN CAM LẠCH BẠCH */}
          <g className={!isCaught ? 'animate-duck-feet' : ''}>
            <path
              d="M26 51L24 58M24 58L19 60M24 58L24 61M24 58L28 60"
              stroke={palette.feet}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M34 51L36 58M36 58L31 60M36 58L36 61M36 58L40 60"
              stroke={palette.feet}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* THÂN VỊT BÉO TRÒN HÌNH QUẢ TRỨNG 3D */}
          <ellipse
            cx="28"
            cy="40"
            rx="17"
            ry="13"
            fill={`url(#duckBodyGrad_${palette.body})`}
            stroke={palette.bodyStroke}
            strokeWidth="1.2"
          />

          {/* ĐUÔI VỊT VỂNH LÊN */}
          <path
            d="M13 38C9 35 6 34 4 37C6 40 10 42 14 42Z"
            fill={palette.body}
            stroke={palette.bodyStroke}
            strokeWidth="1"
          />

          {/* CÁNH VỊT NHỎ XINH (VỖ CÁNH KHI CHẠY) */}
          <g
            className={`origin-[28px_38px] ${
              isCaught || isPanic ? 'animate-wing-fast' : 'animate-wing-flap'
            }`}
          >
            <ellipse
              cx="28"
              cy="39"
              rx="10"
              ry="6.5"
              fill={palette.body}
              stroke={palette.bodyStroke}
              strokeWidth="1.2"
              transform="rotate(-10 28 39)"
            />
          </g>

          {/* ĐẦU TRÒN MÀU ĐEN LÁY (CHUẨN ẢNH THAM CHIẾU) */}
          <circle
            cx="42"
            cy="27"
            r="11"
            fill="url(#duckHeadDark)"
            stroke="#090d16"
            strokeWidth="1"
          />

          {/* MẮT TRÒN ĐIỂM SÁNG TRẮNG */}
          <circle cx="45" cy="25" r="2.5" fill="#ffffff" />
          <circle cx="45.5" cy="24.8" r="1.5" fill="#0f172a" />
          <circle cx="46" cy="24.2" r="0.6" fill="#ffffff" />

          {/* MỎ VỊT MÀU VÀNG CAM DẸP TƯƠI CƯỜI */}
          <path
            d="M49 27C56 27 58 30 56 33C53 35 49 33 47 31Z"
            fill={palette.beak}
            stroke="#c2410c"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

import React from 'react';
import { getShortStudentName } from '../data/defaultDuckData';

/**
 * 6 BẢNG MÀU LÔNG VỊT PIXAR 3D ĐÁNG YÊU (THÂN TRẮNG MUỐT/PASTEL + MỎ CHÂN CAM TƯƠI):
 */
export const DUCK_PALETTES = [
  { body: '#ffffff', bodyStroke: '#cbd5e1', head: '#f8fafc', beak: '#f97316', feet: '#ea580c' }, // Trắng muốt Pixar
  { body: '#fef9c3', bodyStroke: '#facc15', head: '#fef08a', beak: '#f97316', feet: '#ea580c' }, // Vàng tơ pastel
  { body: '#ffffff', bodyStroke: '#cbd5e1', head: '#1e293b', beak: '#f59e0b', feet: '#ea580c' }, // Cổ điển đầu đen
  { body: '#e0f2fe', bodyStroke: '#7dd3fc', head: '#bae6fd', beak: '#f97316', feet: '#ea580c' }, // Xanh thiên thanh
  { body: '#fce7f3', bodyStroke: '#f472b6', head: '#fbcfe8', beak: '#f97316', feet: '#ea580c' }, // Hồng dâu pastel
  { body: '#ecfdf5', bodyStroke: '#6ee7b7', head: '#a7f3d0', beak: '#f97316', feet: '#ea580c' }  // Xanh mint
];

/**
 * SPRITE CHÚ VỊT CON HỌC SINH 3D KIỂU PIXAR:
 * - Nhãn tên hình viên thuốc viền xanh nhẹ nhàng (small blue-outlined name tag floating above).
 * - Bong bóng thoại vui nhộn (Speech bubbles with short cheerful phrases).
 * - Biểu cảm phong phú: há mỏ vui sướng, nháy mắt, toát mồ hôi lo lắng, đeo kính tròn tri thức.
 */
export const DuckSprite = ({
  duck,
  x = 0,
  y = 0,
  vx = 1,
  vy = 0,
  speech = null,
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
  const hasGlasses = colorIndex % 5 === 2; // Một chú vịt đeo kính tròn đáng yêu

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
      {/* 1. BÓNG ĐỔ TIẾP XÚC MẶT CÁT */}
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

      {/* 2. BONG BÓNG LỜI THOẠI HÀI HƯỚC (SPEECH BUBBLE) */}
      {speech && !isCaught && (
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-speech-pop pointer-events-none"
          style={{ transform: isFacingRight ? 'none' : 'scaleX(-1)' }}
        >
          <div className="relative px-2.5 py-1 rounded-2xl bg-white text-slate-900 border-2 border-sky-400 shadow-lg text-[10px] font-black flex items-center space-x-1">
            <span>{speech}</span>
            {/* Đuôi bong bóng thoại */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-sky-400" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-5 border-t-white" />
          </div>
        </div>
      )}

      {/* 3. NHÃN TÊN VIỀN XANH NHẸ NHÀNG (SMALL BLUE-OUTLINED NAME TAG) */}
      {showName && !isCaught && (
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-40 filter drop-shadow-xs"
          style={{ transform: isFacingRight ? 'none' : 'scaleX(-1)' }}
        >
          <div className="px-2.5 py-0.5 rounded-full border-2 border-sky-400 bg-white/95 text-sky-950 font-black text-[11px] shadow-sm flex items-center justify-center">
            <span>{displayName}</span>
          </div>
        </div>
      )}

      {/* 4. CHÚ VỊT CON HOẠT HÌNH PIXAR (LẮC MÔNG VỖ CÁNH) */}
      <div className={`relative w-16 h-16 ${isPanic ? 'animate-bounce-fast' : isCaught ? 'animate-wiggle' : 'animate-duck-waddle'}`}>
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-sm overflow-visible"
        >
          <defs>
            {/* Gradient thân vịt tròn mịn màng */}
            <radialGradient id={`pixarDuck_${palette.body.replace('#','')}`} cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor={palette.body} />
              <stop offset="100%" stopColor={palette.bodyStroke} />
            </radialGradient>

            {/* Gradient đầu vịt */}
            <radialGradient id={`duckHead_${palette.head.replace('#','')}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor={palette.head} />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>
          </defs>

          {/* ĐÔI CHÂN CAM GUỒNG BƯỚC */}
          <g className={!isCaught ? 'animate-duck-feet' : ''}>
            <path
              d="M26 51L24 59M24 59L18 61M24 59L24 62M24 59L29 61"
              stroke={palette.feet}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M34 51L36 59M36 59L30 61M36 59L36 62M36 59L41 61"
              stroke={palette.feet}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>

          {/* THÂN VỊT BÉO TRÒN HÌNH QUẢ TRỨNG */}
          <ellipse
            cx="28"
            cy="40"
            rx="17"
            ry="13"
            fill={`url(#pixarDuck_${palette.body.replace('#','')})`}
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

          {/* CÁNH VỊT VỖ PHẦN PHẬT */}
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
              transform="rotate(-12 28 39)"
            />
            <path d="M22 40C25 42 29 42 32 40" stroke={palette.bodyStroke} strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* ĐẦU TRÒN XOE */}
          <circle
            cx="42"
            cy="27"
            r="11"
            fill={`url(#duckHead_${palette.head.replace('#','')})`}
            stroke={palette.bodyStroke}
            strokeWidth="1"
          />

          {/* KÍNH TRÒN TRI THỨC (NẾU CÓ) */}
          {hasGlasses && (
            <g>
              <circle cx="45" cy="25" r="5" fill="none" stroke="#0284c7" strokeWidth="1.2" />
              <line x1="40" y1="25" x2="38" y2="25" stroke="#0284c7" strokeWidth="1.2" />
            </g>
          )}

          {/* MẮT BIỂU CẢM THEO TRẠNG THÁI */}
          {isCaught ? (
            /* Bị bắt: Mắt xoắn ốc chóng mặt @_@ */
            <g>
              <circle cx="45" cy="25" r="4.5" fill="#ffffff" />
              <path d="M43 25C43 23.5 45 23.5 45.5 24.5C46 25.5 44 26.5 45 27" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          ) : isPanic ? (
            /* Hoảng loạn: Mắt lồi to tròn trố lên! */
            <g>
              <circle cx="45" cy="24" r="5.2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
              <circle cx="46" cy="24" r="2.2" fill="#ef4444" />
              <circle cx="46.5" cy="23.5" r="1" fill="#ffffff" />
            </g>
          ) : (
            /* Bình thường: Mắt anime to tròn long lanh */
            <g>
              <circle cx="45" cy="25" r="3.8" fill="#ffffff" />
              <circle cx="45.5" cy="25" r="2.2" fill="#0f172a" />
              <circle cx="46.2" cy="24.2" r="1" fill="#ffffff" />
            </g>
          )}

          {/* MỎ VỊT MÀU CAM TƯƠI */}
          {isPanic ? (
            /* Mỏ há to kêu QUÁC QUÁC */
            <path
              d="M48 26C56 25 59 29 57 34C53 36 48 35 46 31Z"
              fill={palette.beak}
              stroke="#c2410c"
              strokeWidth="1.2"
            />
          ) : (
            /* Mỏ cười mỉm ngộ nghĩnh */
            <path
              d="M49 27C56 27 58 30 56 33C53 35 49 33 47 31Z"
              fill={palette.beak}
              stroke="#c2410c"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          )}

          {/* Giọt mồ hôi hốt hoảng khi bị rượt gần */}
          {isPanic && (
            <path
              d="M54 13C55 11 58 12 57 15C56 17 53 18 53 16C53 14 54 13 54 13Z"
              fill="#38bdf8"
              className="animate-bounce"
            />
          )}

          {/* Dấu chấm than đỏ trên đầu khi giật mình */}
          {isPanic && (
            <g className="animate-pulse">
              <circle cx="43" cy="8" r="1.5" fill="#ef4444" />
              <rect x="42" y="11" width="2" height="4" rx="1" fill="#ef4444" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

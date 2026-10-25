import React from 'react';
import { getShortStudentName } from '../data/defaultDuckData';

/**
 * 6 BẢNG MÀU LÔNG VỊT 3D CHUẨN ẢNH THAM CHIẾU (ĐẦU ĐEN / MỎ VÀNG CAM / THÂN PASTEL):
 */
export const DUCK_PALETTES = [
  { body: '#ffffff', bodyStroke: '#cbd5e1', head: '#1e293b', beak: '#f59e0b', feet: '#ea580c' }, // Trắng kem
  { body: '#fbcfe8', bodyStroke: '#f472b6', head: '#0f172a', beak: '#f97316', feet: '#ea580c' }, // Hồng pastel
  { body: '#a7f3d0', bodyStroke: '#34d399', head: '#1e293b', beak: '#f59e0b', feet: '#ea580c' }, // Xanh mint
  { body: '#fef08a', bodyStroke: '#facc15', head: '#1e293b', beak: '#ea580c', feet: '#ea580c' }, // Vàng nhạt
  { body: '#fed7aa', bodyStroke: '#fb923c', head: '#0f172a', beak: '#f59e0b', feet: '#ea580c' }, // Cam đào
  { body: '#bae6fd', bodyStroke: '#38bdf8', head: '#1e293b', beak: '#f97316', feet: '#ea580c' }  // Xanh dương
];

/**
 * SPRITE CHÚ VỊT 3D HOẠT HÌNH SIÊU HÀI HƯỚC (Waddle & Googly Eyes):
 * - Thân béo tròn lắc mông lạch bạch
 * - Mắt to tròn ngơ ngác, khi hoảng loạn mắt lồi há to mỏ kêu quác
 * - Chân cam guồng tít như bánh xe hoạt hình
 * - Cánh đập nhấp nhô vui nhộn
 * - Nhãn tên học sinh dạng viên thuốc trắng [Hân], [Bích], [Khiêm], [Diễm]...
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

      {/* 2. NHÃN TÊN HỌC SINH HÌNH VIÊN THUỐC TRẮNG (ĐỒNG NHẤT 100%, KHÔNG LỘ MỤC TIÊU) */}
      {showName && !isCaught && (
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-40 filter drop-shadow-xs"
          style={{ transform: isFacingRight ? 'none' : 'scaleX(-1)' }}
        >
          <div className="px-2.5 py-0.5 rounded-full border border-slate-300 bg-white/95 text-slate-900 font-bold text-[11px] shadow-sm flex items-center justify-center">
            <span>{displayName}</span>
          </div>
        </div>
      )}

      {/* 3. KHỐI CHÚ VỊT HOẠT HÌNH HÀI HƯỚC (LẮC MÔNG LẠCH BẠCH) */}
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
            {/* Gradient 3D cho thân vịt béo tròn */}
            <radialGradient id={`duckGrad_${palette.body}`} cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="45%" stopColor={palette.body} />
              <stop offset="100%" stopColor={palette.bodyStroke} />
            </radialGradient>

            {/* Gradient cho đầu đen tròn */}
            <radialGradient id="duckHeadGradient" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>
          </defs>

          {/* ĐÔI CHÂN CAM GUỒNG TÍT HOẠT HÌNH */}
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

          {/* THÂN VỊT BÉO TRÒN HÌNH QUẢ TRỨNG 3D */}
          <ellipse
            cx="28"
            cy="40"
            rx="17"
            ry="13"
            fill={`url(#duckGrad_${palette.body})`}
            stroke={palette.bodyStroke}
            strokeWidth="1.2"
          />

          {/* ĐUÔI VỊT VỂNH LÊN VUI NHỘN */}
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
            {/* Vạch lông cánh */}
            <path d="M22 40C25 42 29 42 32 40" stroke={palette.bodyStroke} strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* ĐẦU TRÒN ĐEN LÁY (CHUẨN ẢNH THAM CHIẾU) */}
          <circle
            cx="42"
            cy="27"
            r="11"
            fill="url(#duckHeadGradient)"
            stroke="#090d16"
            strokeWidth="1"
          />

          {/* ============================================================== */}
          {/* MẮT HÀI HƯỚC: BÌNH THƯỜNG / HOẢNG SỢ (PANIC) / BỊ BẮT (CAUGHT) */}
          {/* ============================================================== */}
          {isCaught ? (
            /* Mắt xoắn ốc chóng mặt khi bị bắt @_@ */
            <g>
              <circle cx="45" cy="25" r="4.5" fill="#ffffff" />
              <path d="M43 25C43 23.5 45 23.5 45.5 24.5C46 25.5 44 26.5 45 27" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          ) : isPanic ? (
            /* Mắt lồi trợn to hoảng hốt khi bị rượt đuổi! */
            <g>
              <circle cx="45" cy="24" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
              <circle cx="46" cy="24" r="2.2" fill="#ef4444" />
              <circle cx="46.5" cy="23.5" r="1" fill="#ffffff" />
            </g>
          ) : (
            /* Mắt tròn xoe ngơ ngác đáng yêu */
            <g>
              <circle cx="45" cy="25" r="3.5" fill="#ffffff" />
              <circle cx="45.5" cy="25" r="2" fill="#0f172a" />
              <circle cx="46.2" cy="24.2" r="0.8" fill="#ffffff" />
            </g>
          )}

          {/* MỎ VỊT MÀU CAM TƯƠI: HÁ TO KHI HOẢNG SỢ HOẶC CƯỜI TƯƠI */}
          {isPanic ? (
            /* Mỏ há to kêu QUẠC QUẠC */
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

          {/* Giọt mồ hôi hốt hoảng bay lên khi hoảng loạn */}
          {isPanic && (
            <path
              d="M54 14C55 12 58 13 57 16C56 18 53 19 53 17C53 15 54 14 54 14Z"
              fill="#38bdf8"
              className="animate-bounce"
            />
          )}
        </svg>
      </div>
    </div>
  );
};

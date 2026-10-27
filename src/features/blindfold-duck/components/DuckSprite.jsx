import React from 'react';
import { getShortStudentName } from '../data/defaultDuckData';

/**
 * 4 BẢNG MÀU LÔNG VỊT TỰ NHIÊN, DỄ THƯƠNG (ĐỒNG NHẤT ĐẦU VÀ THÂN):
 * - Trắng muốt (vịt đồng quê trắng)
 * - Vàng tơ (vịt con lông vàng)
 * - Kem nhạt (vịt lông kem)
 * - Nâu vàng nhạt (vịt cỏ tự nhiên)
 */
export const DUCK_PALETTES = [
  { body: '#ffffff', shade: '#e2e8f0', beak: '#f97316', feet: '#ea580c' }, // Vịt trắng muốt tự nhiên
  { body: '#fef08a', shade: '#facc15', beak: '#f97316', feet: '#ea580c' }, // Vịt con lông vàng tơ
  { body: '#ffedd5', shade: '#fed7aa', beak: '#ea580c', feet: '#c2410c' }, // Vịt kem cam đào
  { body: '#f1f5f9', shade: '#cbd5e1', beak: '#f97316', feet: '#ea580c' }  // Vịt trắng xám thanh lịch
];

/**
 * SPRITE CHÚ VỊT CON HOẠT HÌNH ĐÁNG YÊU, THUẦN KHIẾT:
 * - Đầu và thân liền mạch tự nhiên, cùng tông màu lông, mỏ cam tươi xinh xắn.
 * - KHÔNG CÒN BONG BÓNG LỜI THOẠI LẪN LỘN: Chỉ duy nhất 1 nhãn tên học sinh rõ ràng, dễ nhìn.
 * - Mắt tròn đen lay láy có đốm sáng long lanh, không còn mắt trợn trừng hay đầu đen dị hợm.
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
        isCaught ? 'z-50 scale-135 -translate-y-8' : 'z-20'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -85%) ${isFacingRight ? 'scaleX(1)' : 'scaleX(-1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. BÓNG ĐỔ DƯỚI CHÂN VỊT TRÊN CÁT */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: isCaught ? '24px' : '42px',
          height: isCaught ? '6px' : '10px',
          backgroundColor: 'rgba(60, 36, 12, 0.35)',
          filter: isCaught ? 'blur(3px)' : 'blur(1.5px)',
          opacity: isCaught ? 0.3 : 0.85
        }}
      />

      {/* 2. DUY NHẤT 1 NHÃN TÊN HỌC SINH (RÕ RÀNG, KHÔNG LẪN CHỮ) */}
      {showName && !isCaught && (
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-40 filter drop-shadow-sm"
          style={{ transform: isFacingRight ? 'none' : 'scaleX(-1)' }}
        >
          <div className="px-2.5 py-0.5 rounded-full border border-sky-400 bg-white/95 text-sky-950 font-black text-[11px] shadow-sm flex items-center justify-center">
            <span>{displayName}</span>
          </div>
        </div>
      )}

      {/* 3. CHÚ VỊT HOẠT HÌNH TỰ NHIÊN, XINH XẮN (ĐẦU VÀ THÂN ĐỒNG NHẤT) */}
      <div className={`relative w-16 h-16 ${isPanic ? 'animate-bounce-fast' : isCaught ? 'animate-wiggle' : 'animate-duck-waddle'}`}>
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-xs overflow-visible"
        >
          <defs>
            {/* Gradient lông vịt mịn màng, ấm áp */}
            <radialGradient id={`cuteDuckBody_${palette.body.replace('#','')}`} cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor={palette.body} />
              <stop offset="100%" stopColor={palette.shade} />
            </radialGradient>

            {/* Gradient mỏ vịt cam tươi */}
            <linearGradient id="cuteDuckBeak" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          {/* ĐÔI CHÂN MÀNG CAM GUỒNG BƯỚC NHẸ NHÀNG */}
          <g className={!isCaught ? 'animate-duck-feet' : ''}>
            <path
              d="M26 51L24 58M24 58L19 60M24 58L24 61M24 58L28 60"
              stroke={palette.feet}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M34 51L35 58M35 58L30 60M35 58L35 61M35 58L39 60"
              stroke={palette.feet}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>

          {/* THÂN VỊT BẦU BĨNH HÌNH QUẢ TRỨNG NẰM NGHIÊNG */}
          <ellipse
            cx="28"
            cy="40"
            rx="16.5"
            ry="12.5"
            fill={`url(#cuteDuckBody_${palette.body.replace('#','')})`}
            stroke={palette.shade}
            strokeWidth="1.2"
          />

          {/* ĐUÔI VỊT VỂNH LÊN ĐÁNG YÊU */}
          <path
            d="M13 37C9 34 5 33 4 36C6 39 10 41 14 41Z"
            fill={palette.body}
            stroke={palette.shade}
            strokeWidth="1"
          />

          {/* CÁNH VỊT NHỎ XINH BÊN HÔNG */}
          <g className={`origin-[28px_38px] ${isPanic ? 'animate-wing-fast' : 'animate-wing-flap'}`}>
            <ellipse
              cx="28"
              cy="39"
              rx="9.5"
              ry="6"
              fill={palette.body}
              stroke={palette.shade}
              strokeWidth="1.2"
              transform="rotate(-10 28 39)"
            />
            <path d="M23 40C26 42 29 42 32 40" stroke={palette.shade} strokeWidth="0.8" strokeLinecap="round" />
          </g>

          {/* CỔ VÀ ĐẦU VỊT LIỀN MẠCH, CÙNG TÔNG MÀU VỚI THÂN (TỰ NHIÊN, CỰC DỄ THƯƠNG) */}
          {/* Vùng cổ nối mềm mại */}
          <path
            d="M35 40C36 34 37 30 40 28C42 32 40 38 35 40Z"
            fill={`url(#cuteDuckBody_${palette.body.replace('#','')})`}
          />

          {/* Đầu vịt tròn xoe, cùng màu lông xinh xắn */}
          <circle
            cx="42"
            cy="27"
            r="10.5"
            fill={`url(#cuteDuckBody_${palette.body.replace('#','')})`}
            stroke={palette.shade}
            strokeWidth="1.2"
          />

          {/* ĐÔI MẮT ĐEN TO TRÒN LONG LANH RẤT HIỀN VÀ DỄ THƯƠNG */}
          {isCaught ? (
            /* Khi bị bắt: Mắt xoắn nhẹ ngộ nghĩnh */
            <g>
              <circle cx="44.5" cy="25" r="3.2" fill="#0f172a" />
              <circle cx="45" cy="24.5" r="1.2" fill="#ffffff" />
            </g>
          ) : (
            /* Mắt to tròn đen láy, có đốm sáng trắng phản chiếu (Pixar beady eye) */
            <g>
              <circle cx="44.5" cy="25.5" r="3.2" fill="#0f172a" />
              <circle cx="45.5" cy="24.5" r="1.3" fill="#ffffff" />
              <circle cx="43.8" cy="26.8" r="0.6" fill="#ffffff" />
            </g>
          )}

          {/* MỎ VỊT VÀNG CAM DẸP TỰ NHIÊN (RẤT THẬT VÀ ĐÁNG YÊU) */}
          <path
            d="M49 26C55 25.5 59 28 57 32C53 34 48 33 46 30Z"
            fill="url(#cuteDuckBeak)"
            stroke="#c2410c"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Lỗ mũi nhỏ xinh trên mỏ */}
          <circle cx="50" cy="28" r="0.6" fill="#9a3412" />

          {/* Má hồng phớt nhẹ siêu đáng yêu */}
          <ellipse cx="40" cy="30" rx="2.5" ry="1.6" fill="#fb7185" opacity="0.65" />
        </svg>
      </div>
    </div>
  );
};

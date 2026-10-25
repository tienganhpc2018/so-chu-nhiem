import React from 'react';
import { getShortStudentName } from '../data/defaultDuckData';

/**
 * Sprite Chú Vịt Hoạt Hình Trắng Muốt chuẩn 100% theo Ảnh Concept 3D:
 * - Vịt con lông trắng tinh mập mạp, mỏ cam cười xinh xắn, má hồng đáng yêu
 * - Hai cánh vỗ phần phật khi chạy trốn kèm vệt gió (( xung quanh
 * - Nhãn tên học sinh dạng viên thuốc trắng viền xanh dương chữ đậm [Lan Phương], [Ngọc Diệp], [Quang]...
 * - Bong bóng lời thoại học đường chuẩn: "Thầy ơi em đây này!", "Hụt rồi!", "Em chưa học bài đâu!"
 * - Kính mắt tròn trí thức cho bạn Quang 👓
 * - Giọt mồ hôi lo sợ 💦 cho bạn Ngọc Diệp, Thảo
 * - Dấu chấm than hốt hoảng ‼️ cho bạn Mai
 * - Bóng đổ tiếp xúc mặt đất dưới chân
 */
export const DuckSprite = ({
  duck,
  x = 0,
  y = 0,
  vx = 1,
  speechQuote = null,
  isQuacking = false,
  isCaught = false,
  isTarget = false,
  isBlurMode = false,
  allNames = []
}) => {
  const isFacingRight = vx >= 0;
  const fullName = duck?.name || 'Vịt';
  const displayName = duck?.shortName || getShortStudentName(fullName, allNames);

  // Nhận diện nhân vật theo ảnh tham chiếu
  const lowerName = fullName.toLowerCase();
  const hasGlasses = lowerName.includes('quang');
  const hasSweat = lowerName.includes('diệp') || lowerName.includes('thảo') || isTarget;
  const hasExclamation = lowerName.includes('mai');

  return (
    <div
      className={`absolute pointer-events-none select-none transition-all duration-75 ${
        isCaught ? 'z-40 scale-125' : 'z-20'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -75%)',
        opacity: isCaught ? 1 : isBlurMode ? 0.8 : 1
      }}
    >
      {/* 1. Bóng đổ tiếp xúc mặt cát đất nén dưới chân vịt */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full bg-[#422c19]/30 filter blur-xs pointer-events-none" />

      {/* 2. Vệt gió chuyển động hoạt hình (( quanh chú vịt (Chuẩn ảnh tham chiếu) */}
      <div
        className={`absolute -bottom-1 ${isFacingRight ? '-left-3' : '-right-3'} pointer-events-none opacity-85`}
      >
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
          <path d="M2 4C5 7 10 7 15 5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M4 11C7 13 12 13 17 10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
        </svg>
      </div>

      {/* 3. BONG BÓNG LỜI THOẠI HỌC ĐƯỜNG TRẮNG VIỀN ĐEN (Chuẩn 100% Ảnh Tham Chiếu) */}
      {speechQuote && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none filter drop-shadow-md">
          <div className="relative px-3 py-1 rounded-2xl bg-white text-slate-900 text-xs font-black border-2 border-slate-800 shadow-md max-w-[220px] text-center leading-tight">
            <span>{speechQuote}</span>
            {/* Đuôi nhọn trỏ vào đầu vịt */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-800" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-5 border-t-white" />
          </div>
        </div>
      )}

      {/* 4. NHÃN TÊN HỌC SINH DẠNG VIÊN THUỐC VIỀN XANH CHỮ XANH (Chuẩn 100% Ảnh) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-40 filter drop-shadow-xs">
        <div
          className={`px-3 py-0.5 rounded-full border-2 shadow-sm flex items-center space-x-1 transition-all ${
            isTarget
              ? 'bg-red-600 text-yellow-200 border-yellow-300 animate-pulse font-black scale-105'
              : isQuacking
              ? 'bg-amber-100 text-[#1d4ed8] border-amber-400 font-black text-xs scale-105'
              : 'bg-white text-[#1d4ed8] border-[#2563eb] font-black text-xs'
          }`}
        >
          <span>{displayName}</span>
          {isQuacking && <span className="text-[10px]">🔊</span>}
          {isTarget && <span className="text-[9px] bg-yellow-400 text-red-900 px-1 rounded-xs">MỤC TIÊU!</span>}
        </div>
      </div>

      {/* Dấu chấm than đỏ ‼️ của bạn Mai */}
      {hasExclamation && !isCaught && (
        <div className="absolute -top-5 -left-3 text-sm font-black text-red-600 animate-bounce z-45">
          ‼️
        </div>
      )}

      {/* Giọt mồ hôi lo sợ 💦 của bạn Ngọc Diệp, Thảo */}
      {hasSweat && !isCaught && (
        <div className="absolute -top-4 -right-3 text-xs animate-bounce z-45">
          💦
        </div>
      )}

      {/* Hiệu ứng pháo hoa khi bị bắt 🎉 */}
      {isCaught && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-bounce">
          <span className="text-3xl">✨🎉✨</span>
        </div>
      )}

      {/* Sóng âm thanh lan tỏa khi cất tiếng quạc quạc */}
      {isQuacking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-16 h-7 rounded-full border-2 border-amber-400 opacity-80 animate-ping" />
        </div>
      )}

      {/* 5. HÌNH ẢNH CHÚ VỊT 3D CON LÔNG TRẮNG MUỐT TRÒN TRĨNH (Chuẩn 100% Ảnh) */}
      <div
        className={`relative w-16 h-16 flex flex-col items-center transition-transform ${
          isFacingRight ? 'scale-x-100' : 'scale-x-[-1]'
        }`}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md"
        >
          <defs>
            {/* Gradient lông trắng muốt 3D */}
            <radialGradient id="duckBodyGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#fdfcf8" />
              <stop offset="100%" stopColor="#e9e5d9" />
            </radialGradient>
            {/* Gradient mỏ & chân cam */}
            <linearGradient id="duckOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          {/* CÁNH TRÁI PHÍA SAU (VỖ PHẦN PHẬT) */}
          <path
            d="M20 32C14 26 12 28 10 33C12 37 18 38 22 36Z"
            fill="url(#duckBodyGrad)"
            stroke="#d1cebe"
            strokeWidth="0.8"
            className="animate-pulse"
          />

          {/* ĐUÔI VỊT NHỎ VỂNH LÊN */}
          <path
            d="M16 42C12 40 10 43 9 46C12 46 16 45 18 43Z"
            fill="url(#duckBodyGrad)"
            stroke="#d1cebe"
            strokeWidth="0.8"
          />

          {/* THÂN VỊT TRÒN MẬP MẠP */}
          <ellipse cx="28" cy="40" rx="15" ry="12" fill="url(#duckBodyGrad)" stroke="#e4e0d2" strokeWidth="0.8" />

          {/* CHÂN MÀNG MÀU CAM BƯỚC CHẠY */}
          <g>
            {/* Chân sau */}
            <path d="M22 49L18 55C16 56 19 57 23 55L24 49Z" fill="url(#duckOrangeGrad)" />
            {/* Chân trước */}
            <path d="M30 50L32 56C34 57 37 56 36 54L33 49Z" fill="url(#duckOrangeGrad)" />
          </g>

          {/* CÁNH PHẢI PHÍA TRƯỚC (VỖ BAY TUNG TĂNG) */}
          <path
            d="M26 36C22 30 18 32 16 38C20 42 28 43 32 39Z"
            fill="url(#duckBodyGrad)"
            stroke="#d1cebe"
            strokeWidth="0.8"
            className="animate-pulse"
          />

          {/* ĐẦU VỊT TRÒN TRẮNG MUỐT */}
          <circle cx="38" cy="24" r="14" fill="url(#duckBodyGrad)" stroke="#e4e0d2" strokeWidth="0.8" />

          {/* Chỏm lông tơ trên đỉnh đầu */}
          <path d="M36 10C37 7 40 7 40 10" stroke="#f1eee4" strokeWidth="2" strokeLinecap="round" />

          {/* MẮT ĐEN TRÒN ĐÁNG YÊU VỚI ÁNH SÁNG LẤP LÁNH */}
          <g>
            <ellipse cx="44" cy="22" rx="3.2" ry="4" fill="#0f172a" />
            <circle cx="45.2" cy="20.5" r="1.3" fill="#ffffff" />
            <circle cx="43.5" cy="23.5" r="0.6" fill="#ffffff" />
          </g>

          {/* BẠN QUANG ĐEO KÍNH TRÒN 👓 (Chuẩn ảnh tham chiếu) */}
          {hasGlasses && (
            <g>
              <circle cx="44" cy="22" r="5.5" stroke="#0f172a" strokeWidth="2" fill="rgba(224,242,254,0.3)" />
              <path d="M38 22H33" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* MÁ HỒNG PHÚNG PHÍNH ĐÁNG YÊU */}
          <ellipse cx="37" cy="27" rx="3.5" ry="2" fill="#fb7185" opacity="0.65" />

          {/* MỎ VỊT MÀU CAM TƯƠI CƯỜI RẠNG RỠ (Chuẩn ảnh tham chiếu) */}
          <path
            d="M48 24C55 24 57 27 54 30C50 32 46 29 46 26Z"
            fill="url(#duckOrangeGrad)"
            stroke="#c2410c"
            strokeWidth="0.8"
            filter="drop-shadow(0 1px 1px rgba(0,0,0,0.2))"
          />
          <path d="M47 27C50 28 53 28 55 27" stroke="#9a3412" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

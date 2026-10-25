import React from 'react';
import { getShortStudentName } from '../data/defaultDuckData';

/**
 * Sprite Chú Vịt Hoạt Hình Trắng Muốt chuẩn 100% theo Ảnh 2
 * - Chú vịt con lông trắng tinh, mỏ cam, má hồng xinh xắn
 * - Đôi cánh vỗ tung tăng khi chạy trốn
 * - Nhãn tên học sinh dạng viên thuốc trắng viền xanh dương chữ xanh đậm (như [Trang], [Duy], [Minh])
 * - Tự động rút gọn "Chữ lót + Tên" để không chồng đè khi lớp đông học sinh
 * - Sóng âm thanh tỏa ra khi cất tiếng quạc quạc
 * - Bạn Quang đeo kính tròn trí thức 👓
 * - Bong bóng hội thoại học đường (Thầy ơi em đây này!, Hụt rồi!, Em chưa học bài đâu!)
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
  const hasGlasses = fullName.toLowerCase().includes('quang');
  const isSweating = fullName.toLowerCase().includes('diệp') || isTarget;

  return (
    <div
      className={`absolute pointer-events-none select-none transition-all duration-75 ${
        isCaught ? 'z-40 scale-125' : 'z-20'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -75%)',
        opacity: isCaught ? 1 : isBlurMode ? 0.75 : 1
      }}
    >
      {/* 1. BONG BÓNG LỜI THOẠI HỌC ĐƯỜNG TRẮNG VIỀN XANH/ĐEN (Chuẩn 100% Ảnh 2) */}
      {speechQuote && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none">
          <div className="relative px-2.5 py-1 rounded-2xl bg-white text-slate-900 text-[11px] font-black border-2 border-slate-900 shadow-xl max-w-[210px] text-center leading-tight">
            <span>{speechQuote}</span>
            {/* Đuôi bong bóng thoại */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-900" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-5 border-t-white" />
          </div>
        </div>
      )}

      {/* 2. NHÃN TÊN HỌC SINH RÚT GỌN (CHỮ LÓT + TÊN) CHỮ XANH VIỀN XANH NỀN TRẮNG (Chuẩn 100% Ảnh 2) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-40">
        <div
          className={`px-2.5 py-0.5 rounded-full border-2 shadow-md flex items-center space-x-1 ${
            isTarget
              ? 'bg-red-600 text-yellow-200 border-yellow-300 animate-pulse font-black scale-105'
              : isQuacking
              ? 'bg-amber-100 text-[#1d4ed8] border-amber-400 font-black text-xs scale-105 shadow-amber-300'
              : 'bg-white text-[#1d4ed8] border-[#2563eb] font-black text-xs'
          }`}
        >
          <span>{displayName}</span>
          {isQuacking && <span className="text-[10px]">🔊</span>}
          {isTarget && <span className="text-[9px] bg-yellow-400 text-red-900 px-1 rounded-xs">MỤC TIÊU!</span>}
        </div>
      </div>

      {/* SÓNG ÂM THANH KHI VỊT KÊU CẠP CẠP (Sound Waves Ripple) */}
      {isQuacking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-14 h-7 rounded-full border-2 border-amber-400 opacity-80 animate-ping" />
        </div>
      )}

      {/* 3. HIỆU ỨNG BẮT TRÚNG: PHÁO HOA & SAO VÀNG 🎉 */}
      {isCaught && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-bounce">
          <span className="text-3xl">✨🎉✨</span>
        </div>
      )}

      {/* Giọt mồ hôi lo sợ 💦 */}
      {isSweating && !isCaught && (
        <div className="absolute -top-4 -right-2 text-xs animate-bounce z-40">
          💦
        </div>
      )}

      {/* 4. HÌNH ẢNH CHÚ VỊT CON TRẮNG MUỐT ĐÁNG YÊU (Theo Ảnh 2) */}
      <div
        className={`relative w-14 h-14 flex flex-col items-center filter drop-shadow-md transition-transform ${
          isFacingRight ? 'scale-x-100' : 'scale-x-[-1]'
        }`}
      >
        {/* ĐẦU VỊT TRÒN TRẮNG MUỐT */}
        <div className="relative z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
          {/* Chỏm lông tơ trên đỉnh đầu */}
          <div className="absolute -top-1 left-2 w-2 h-2 bg-white rounded-full border-t border-slate-200 transform rotate-12" />

          {/* MẮT ĐEN TRÒN CHỚP LÉM LỈNH */}
          <div className="absolute top-2.5 right-1.5 flex items-center space-x-1">
            <div className="relative w-2 h-2.5 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-white -mt-1 -ml-0.5" />
            </div>
          </div>

          {/* Bạn Quang đeo kính tròn 👓 */}
          {hasGlasses && (
            <div className="absolute top-2 right-1 w-4 h-3 rounded-full border-2 border-slate-900 bg-cyan-100/30" />
          )}

          {/* Má hồng chúm chím */}
          <div className="absolute bottom-1.5 right-2.5 w-2 h-1 bg-rose-400/70 rounded-full" />

          {/* MỎ VỊT MÀU CAM RỰC RỠ TƯƠI CƯỜI (Ảnh 2) */}
          <div className="absolute -right-3 top-3 w-4 h-2.5 bg-orange-500 rounded-r-full border-t border-b border-orange-600 shadow-xs flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-amber-200 rounded-full" />
          </div>
        </div>

        {/* THÂN VỊT TRẮNG MẬP MẠP & 2 CÁNH VỖ PHẦN PHẬT */}
        <div className="relative z-10 w-11 h-7 bg-white rounded-full border border-slate-200 -mt-2 shadow-xs flex items-center justify-between px-1">
          {/* Cánh trái (vẫy tung tăng khi chạy) */}
          <div className="w-4 h-3.5 bg-white rounded-full border border-slate-200 transform -rotate-25 shadow-xs animate-pulse" />

          {/* Đuôi vịt nhỏ vểnh lên phía sau */}
          <div className="w-3 h-2.5 bg-white rounded-t-sm transform -rotate-45 -ml-1 border-t border-l border-slate-200" />
        </div>

        {/* 2 CHÂN MÀNG MÀU CAM BƯỚC CHẠY TUNG TĂNG (Ảnh 2) */}
        <div className="relative flex items-center space-x-2 -mt-1 z-10">
          <div className="w-3 h-2 bg-orange-500 rounded-full border-b border-orange-600 transform rotate-12" />
          <div className="w-3 h-2 bg-orange-500 rounded-full border-b border-orange-600 transform -rotate-12" />
        </div>

        {/* Vệt gió / vệt bước chạy phía sau vịt */}
        <div className="absolute -left-3 bottom-2 flex flex-col space-y-0.5 opacity-60">
          <div className="w-2.5 h-0.5 bg-slate-300 rounded-full" />
          <div className="w-4 h-0.5 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

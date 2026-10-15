import React from 'react';
import { UFO_CITY_SHOPS } from '../data/defaultUfoData';

export const UfoCityBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 flex flex-col justify-between">
      {/* 1. Bầu trời đêm sâu thẳm với ngàn sao lấp lánh */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1128] via-[#0f1d3a] to-[#152347]" />

      {/* Hiệu ứng các ngôi sao nhỏ lấp lánh */}
      <div className="absolute inset-0 opacity-70">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              top: `${(i * 19) % 45}%`,
              left: `${(i * 31) % 100}%`,
              animationDelay: `${(i * 0.3) % 2.5}s`,
              animationDuration: `${1.5 + (i % 2)}s`
            }}
          />
        ))}
      </div>

      {/* 2. Dãy các tòa nhà & cửa hàng sầm uất (Chuẩn 100% ảnh tham chiếu của Thầy) */}
      <div className="relative mt-auto w-full h-[68%] flex items-end justify-between px-2 sm:px-6">
        {UFO_CITY_SHOPS.map((shop, index) => {
          // Chiều cao và màu sắc từng tòa nhà
          const heights = ['h-[84%]', 'h-[92%]', 'h-[88%]', 'h-[85%]', 'h-[95%]', 'h-[86%]', 'h-[89%]', 'h-[83%]', 'h-[87%]'];
          const bgColors = [
            'bg-slate-100', // Xe buýt
            'bg-amber-50',  // Nhà sách
            'bg-orange-100',// Cơm tấm
            'bg-yellow-100',// Bánh mì
            'bg-teal-100',  // Trà sữa
            'bg-slate-200', // Hớt tóc
            'bg-lime-100',  // Bún chả
            'bg-rose-100',  // Kem
            'bg-sky-100'    // Điện thoại
          ];

          return (
            <React.Fragment key={shop.id}>
              {/* Tòa nhà cửa hàng */}
              <div
                className={`relative flex-1 mx-1 ${heights[index % heights.length]} ${bgColors[index % bgColors.length]} rounded-t-xl border-t-4 border-x border-slate-300 shadow-xl flex flex-col justify-between`}
              >
                {/* Các ô cửa sổ phát ánh sáng vàng ấm áp */}
                <div className="p-2 sm:p-3 grid grid-cols-2 gap-2 sm:gap-2.5">
                  {[...Array(6)].map((_, wIdx) => (
                    <div
                      key={wIdx}
                      className="h-5 sm:h-8 rounded bg-amber-300/90 shadow-sm border border-amber-400/50 flex items-center justify-center"
                    >
                      <div className="w-[1px] h-full bg-amber-500/30" />
                    </div>
                  ))}
                </div>

                {/* Biển hiệu cửa hàng rực rỡ ở chân tầng trệt */}
                <div
                  className="w-full py-2.5 sm:py-3.5 px-1 text-center font-black tracking-wider text-[11px] sm:text-xs text-white shadow-md uppercase transition-transform"
                  style={{ backgroundColor: shop.color }}
                >
                  {shop.name}
                </div>
              </div>

              {/* Cây xanh dải phân cách ở giữa phố (giữa cửa hàng Bánh Mì và Trà Sữa) */}
              {index === 3 && (
                <div className="relative w-8 sm:w-14 h-48 mx-1 flex flex-col items-center justify-end z-10">
                  <div className="w-10 sm:w-14 h-16 sm:h-20 bg-emerald-600 rounded-full shadow-lg border-2 border-emerald-500" />
                  <div className="w-2.5 sm:w-3.5 h-16 bg-amber-800 rounded-sm" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Lòng đường / Mặt đường rộng (Vùng học sinh chạy nhảy) */}
      <div className="relative w-full h-24 sm:h-28 bg-[#1e293b] border-t-4 border-slate-400 shadow-2xl flex items-center justify-center">
        {/* Vạch kẻ đường đứt quãng */}
        <div className="absolute top-2 w-full flex justify-around opacity-40">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-8 sm:w-14 h-1.5 bg-yellow-300 rounded-full" />
          ))}
        </div>

        {/* Vùng sân khấu ánh sáng hình elip - Điểm đáp của tia hút UFO */}
        <div className="w-[72%] max-w-4xl h-16 sm:h-20 bg-gradient-to-r from-cyan-500/20 via-emerald-400/40 to-cyan-500/20 rounded-[100%] blur-sm border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.5)] transform -translate-y-2" />
      </div>
    </div>
  );
};

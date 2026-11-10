import React from 'react';
import { UfoStorefronts } from './UfoStorefronts';

/**
 * UfoCityBackground.jsx - Bối cảnh đại lộ 2 chiều rộng rãi & Dãy phố sầm uất
 * Bao gồm:
 * 1. Bầu trời đêm sâu thẳm lấp lánh sao
 * 2. Đường chân trời cao ốc mờ ảo phía xa (Skyline Silhouette)
 * 3. Dãy 9 gian hàng phố thị thiết kế chân thực như thật (UfoStorefronts)
 * 4. Vỉa hè đi bộ lát gạch tinh tế có cột đèn đường cổ điển (Streetlamps)
 * 5. Lòng đường 2 chiều rộng lớn (Wide 2-Way Boulevard) với vạch đôi vàng, mũi tên phân làn, vạch sang đường ngựa vằn (Zebra Crosswalk)
 */

export const UfoCityBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 flex flex-col justify-between">
      {/* 1. Bầu trời đêm sâu thẳm rộng mở để đĩa bay UFO bay lượn trên cao */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050a18] via-[#091226] to-[#0f1d38]" />

      {/* Các ngôi sao nhỏ lấp lánh trên tầng khí quyển */}
      <div className="absolute inset-0 opacity-80">
        {[...Array(48)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${(i % 3) + 1.2}px`,
              height: `${(i % 3) + 1.2}px`,
              top: `${(i * 13) % 45}%`, // Giữ sao ở 45% phía trên bầu trời
              left: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.25) % 3}s`,
              animationDuration: `${1.8 + (i % 2)}s`
            }}
          />
        ))}
      </div>

      {/* Mặt trăng khuyết dịu nhẹ ở góc trên bên phải */}
      <div className="absolute top-5 right-12 w-12 h-12 rounded-full bg-amber-100/20 blur-sm pointer-events-none flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-amber-200/90 shadow-[0_0_25px_rgba(254,243,199,0.6)]" />
      </div>

      {/* 2. Đường chân trời cao ốc phía xa (Far City Skyline) tạo chiều sâu 3D */}
      <div className="absolute bottom-[38%] left-0 right-0 h-28 flex items-end justify-between px-4 opacity-35 pointer-events-none">
        {[55, 75, 45, 90, 65, 80, 50, 85, 70, 60, 95, 55, 75, 85, 60].map((h, idx) => (
          <div
            key={idx}
            className="w-12 sm:w-16 bg-slate-900/90 border-t border-slate-700/50 rounded-t-sm flex flex-col justify-around p-1"
            style={{ height: `${h}%` }}
          >
            {/* Đèn đỏ cảnh báo máy bay trên đỉnh tháp */}
            {h > 70 && (
              <div className="w-1 h-1 rounded-full bg-rose-500 self-center animate-ping -mt-1" />
            )}
            {/* Chấm sáng cửa sổ cao ốc phía xa */}
            <div className="grid grid-cols-2 gap-1 opacity-60">
              <div className="w-1 h-1 bg-amber-200/60 rounded-xs" />
              <div className="w-1 h-1 bg-cyan-200/60 rounded-xs" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Dãy 9 gian hàng phố thị Việt Nam chân thực như thật */}
      <div className="relative mt-auto w-full flex flex-col justify-end">
        <UfoStorefronts />

        {/* 4. Vỉa hè đi bộ lát gạch (Sidewalk / Pavement) có cột đèn đường cổ điển */}
        <div className="relative w-full h-8 sm:h-9 bg-gradient-to-b from-[#cbd5e1] via-[#94a3b8] to-[#64748b] border-t-2 border-slate-300 shadow-md flex items-center justify-between px-4 sm:px-10 z-15">
          {/* Họa tiết gạch lát vỉa hè kẻ ô tinh tế */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Dãy cột đèn đường cổ điển (Streetlamps) tỏa ánh sáng vàng ấm */}
          {[12, 38, 62, 88].map((pct, lIdx) => (
            <div
              key={lIdx}
              className="absolute -top-16 flex flex-col items-center pointer-events-none z-20"
              style={{ left: `${pct}%` }}
            >
              {/* Quầng sáng đèn đường hình nón chiếu xuống vỉa hè */}
              <div className="w-24 h-24 rounded-full bg-amber-300/20 blur-xl transform translate-y-2 pointer-events-none" />

              {/* Đầu đèn chụp thủy tinh phát sáng vàng ấm */}
              <div className="relative w-5 h-6 bg-slate-900 rounded-t-full border border-amber-300/60 flex items-center justify-center shadow-lg">
                <div className="w-3 h-3.5 bg-amber-300 rounded-full shadow-[0_0_12px_#fde047] animate-pulse" />
                {/* Chóp nhọn đỉnh đèn */}
                <div className="absolute -top-1.5 w-1 h-2 bg-slate-900 rounded-full" />
              </div>

              {/* Tay đỡ sắt uốn mỹ thuật */}
              <div className="w-3 h-1 bg-slate-800 rounded-full" />

              {/* Thân cột đèn kim loại gang đúc màu xanh đen */}
              <div className="w-1.5 h-12 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-x border-slate-600" />

              {/* Đế cột đèn vững chãi trên vỉa hè */}
              <div className="w-3.5 h-2 bg-slate-900 rounded-t-sm shadow-md" />
            </div>
          ))}

          {/* Vài chậu cây xanh cảnh quan đặt trên vỉa hè */}
          {[25, 50, 75].map((pos, pIdx) => (
            <div
              key={pIdx}
              className="absolute -top-5 flex flex-col items-center z-15 pointer-events-none"
              style={{ left: `${pos}%` }}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 border border-emerald-400 shadow-md flex items-center justify-center text-[8px]">
                🌿
              </div>
              <div className="w-3.5 h-2.5 bg-amber-800 rounded-b-xs border border-amber-900" />
            </div>
          ))}

          {/* Gờ bó vỉa (Curbstone) ngăn cách vỉa hè và lòng đường với sọc vàng đen cảnh báo */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#475569] border-b border-slate-900 flex">
            {[...Array(40)].map((_, cIdx) => (
              <div
                key={cIdx}
                className={`flex-1 h-full ${cIdx % 4 === 0 ? 'bg-amber-400' : 'bg-slate-700'}`}
              />
            ))}
          </div>
        </div>

        {/* 5. LÒNG ĐƯỜNG 2 CHIỀU RỘNG LỚN (Wide 2-Way Boulevard) */}
        <div className="relative w-full h-32 sm:h-36 md:h-40 bg-gradient-to-b from-[#18202d] via-[#1e2736] to-[#141b24] border-t-2 border-slate-700 shadow-2xl flex flex-col justify-between overflow-hidden z-10">
          
          {/* LÀN 1 (LÀN TRONG - XE CHẠY TỪ TRÁI SANG PHẢI →) */}
          <div className="relative w-full flex-1 flex items-center justify-between px-6 sm:px-16">
            {/* Mũi tên chỉ hướng sơn trắng làn 1 */}
            <div className="flex items-center space-x-2 text-slate-500/70 font-mono font-black text-sm tracking-widest">
              <span>➔</span>
              <span className="text-[10px] hidden sm:inline">LÀN 1</span>
            </div>

            {/* Vạch kẻ sang đường cho người đi bộ (Zebra Crosswalk) ở góc bên trái */}
            <div className="absolute left-8 sm:left-16 top-0 bottom-0 w-20 sm:w-28 flex justify-around pointer-events-none opacity-85">
              {[...Array(7)].map((_, zIdx) => (
                <div key={zIdx} className="w-2 sm:w-2.5 h-full bg-slate-200/90 shadow-sm" />
              ))}
            </div>

            {/* Nắp cống thoát nước kim loại ở góc vỉa hè */}
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-inner opacity-80">
              <div className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-900 rounded-full" />
              </div>
            </div>
          </div>

          {/* DẢI PHÂN CÁCH GIỮA ĐƯỜNG 2 CHIỀU: 2 VẠCH VÀNG SONG SONG RỰC RỠ (DOUBLE YELLOW LINES) */}
          <div className="relative w-full h-3.5 bg-[#141b24] flex flex-col justify-center space-y-1 shadow-md">
            {/* Vạch vàng đôi chạy dọc suốt đại lộ */}
            <div className="w-full h-1 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <div className="w-full h-1 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />

            {/* Các mắt phản quang dạ quang giữa 2 vạch vàng */}
            <div className="absolute inset-0 flex justify-around items-center pointer-events-none">
              {[...Array(16)].map((_, rIdx) => (
                <div key={rIdx} className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_#ffffff] opacity-80" />
              ))}
            </div>
          </div>

          {/* LÀN 2 (LÀN NGOÀI - XE CHẠY TỪ PHẢI SANG TRÁI ←) */}
          <div className="relative w-full flex-1 flex items-center justify-between px-6 sm:px-16">
            {/* Nắp hố ga kim loại hình vuông */}
            <div className="w-8 h-8 rounded-sm bg-slate-800 border-2 border-slate-600 p-1 flex flex-col justify-between shadow-inner opacity-80">
              <div className="w-full h-1 bg-slate-600" />
              <div className="w-full h-1 bg-slate-600" />
            </div>

            {/* Vạch kẻ sang đường cho người đi bộ (Zebra Crosswalk) ở góc bên phải */}
            <div className="absolute right-8 sm:right-16 top-0 bottom-0 w-20 sm:w-28 flex justify-around pointer-events-none opacity-85">
              {[...Array(7)].map((_, zIdx) => (
                <div key={zIdx} className="w-2 sm:w-2.5 h-full bg-slate-200/90 shadow-sm" />
              ))}
            </div>

            {/* Mũi tên chỉ hướng sơn trắng làn 2 */}
            <div className="flex items-center space-x-2 text-slate-500/70 font-mono font-black text-sm tracking-widest">
              <span className="text-[10px] hidden sm:inline">LÀN 2</span>
              <span>⬅</span>
            </div>
          </div>

          {/* Điểm đáp của luồng sáng UFO trên đại lộ */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[65%] max-w-3xl h-14 bg-gradient-to-r from-cyan-500/10 via-emerald-400/25 to-cyan-500/10 rounded-[100%] blur-sm border border-cyan-400/40 shadow-[0_0_35px_rgba(34,211,238,0.4)] pointer-events-none" />

          {/* Vỉa hè đối diện mép dưới cùng để tạo góc nhìn đường phố hoàn chỉnh */}
          <div className="w-full h-2.5 bg-gradient-to-t from-slate-900 to-slate-700 border-t border-slate-600" />
        </div>
      </div>
    </div>
  );
};

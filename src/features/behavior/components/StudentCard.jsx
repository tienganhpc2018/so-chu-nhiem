import React from 'react';
import { Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const StudentCard = ({
  student,
  avatarSize = 'normal',
  isCalled = false,
  isAbsent = false,
  onOpenPoints
}) => {
  const isLarge = avatarSize === 'large';
  const plusPoints = Number(student.plus_points ?? student.total_stars ?? 0);
  const minusPoints = Number(student.minus_points ?? 0);

  // Khung viền danh dự theo điểm nề nếp:
  // >= 35 điểm: Kim Cương Xanh (Học sinh Xuất Sắc)
  // >= 20 điểm: Vàng Kim Hào Quang (Học sinh Gương Mẫu)
  const isDiamondTier = plusPoints >= 35;
  const isGoldTier = plusPoints >= 20 && plusPoints < 35;

  const handleClick = () => {
    if (isAbsent) return;
    soundFx.playClick();
    onOpenPoints?.(student);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group rounded-3xl p-3.5 flex flex-col items-center justify-between transition-all duration-200 select-none ${
        isAbsent
          ? 'bg-rose-50/80 border-2 border-rose-300 opacity-60 cursor-not-allowed shadow-none'
          : isCalled
          ? 'bg-slate-100/90 border-2 border-slate-300 opacity-70 cursor-pointer shadow-sm hover:opacity-100 hover:scale-[1.02]'
          : 'bg-white/90 backdrop-blur-md border-2 border-slate-200/90 shadow-soft hover:shadow-xl hover:border-purple-300 hover:scale-[1.03] cursor-pointer'
      }`}
    >
      {/* Top Left Badge: Total Plus Points (Red circle) */}
      <div
        className="absolute -top-2.5 -left-2.5 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white ring-1 ring-red-300"
        title={`Tổng điểm cộng: +${plusPoints}`}
      >
        +{plusPoints}
      </div>

      {/* Top Right Badge: Total Minus Points (Purple circle) */}
      <div
        className="absolute -top-2.5 -right-2.5 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white ring-1 ring-purple-300"
        title={`Tổng điểm trừ: -${minusPoints}`}
      >
        -{minusPoints}
      </div>

      {/* Avatar with Honorary Honor Frame */}
      <div className="relative mt-2 mb-2">
        {/* Hào quang lấp lánh (Shine Aura) */}
        {isDiamondTier && (
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 opacity-80 blur-xs animate-pulse" />
        )}
        {isGoldTier && (
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 opacity-75 blur-xs animate-pulse" />
        )}

        <div
          className={`relative rounded-full overflow-hidden transition-all duration-300 bg-gradient-to-b from-amber-50 to-orange-50 ${
            isDiamondTier
              ? 'border-2 border-cyan-300 ring-4 ring-cyan-400 shadow-lg shadow-cyan-300/60'
              : isGoldTier
              ? 'border-2 border-yellow-200 ring-4 ring-amber-400 shadow-lg shadow-amber-400/50'
              : 'border-2 border-amber-400 ring-4 ring-amber-200/60 shadow-md'
          } ${isLarge ? 'w-24 h-24' : 'w-20 h-20'}`}
        >
          <img
            src={
              student.avatar ||
              student.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.full_name || 'student')}`
            }
            alt={student.full_name}
            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Huy hiệu danh dự Kim cương hoặc Vương miện vàng */}
        {isDiamondTier && (
          <div
            className="absolute -top-1.5 -left-1 z-20 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs shadow-md border border-white animate-bounce"
            title="Học sinh Xuất Sắc: Khung viền Kim Cương Xanh (≥35 điểm)"
          >
            💎
          </div>
        )}
        {isGoldTier && (
          <div
            className="absolute -top-1.5 -left-1 z-20 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center text-xs shadow-md border border-white"
            title="Học sinh Gương Mẫu: Khung viền Vàng Kim Hào Quang (≥20 điểm)"
          >
            👑
          </div>
        )}

        {/* Gender dot */}
        <span
          className={`absolute bottom-0 right-0 z-20 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
            student.gender === 'Nữ' || student.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
          }`}
          title={student.gender === 'Nữ' || student.gender === 'female' ? 'Nữ' : 'Nam'}
        />
      </div>

      {/* Student Name and Code - HIỂN THỊ ĐẦY ĐỦ FULL HỌ TÊN (KHÔNG BỊ CẮT ...) */}
      <div className="w-full text-center space-y-1">
        <h4
          className="font-extrabold text-slate-800 text-xs sm:text-[13px] leading-snug px-0.5 line-clamp-2 min-h-[2.4rem] flex items-center justify-center text-center break-words"
          title={student.full_name}
        >
          {student.full_name}
        </h4>
        <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-400 font-bold">
          <span>{student.code || `HS${String(student.seat_row || 1).padStart(2, '0')}`}</span>
          <span>•</span>
          <span className="text-purple-600 font-extrabold">Tổ {student.team_group || 1}</span>
          {Number(student.kttx_bonus || 0) > 0 && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-black">🎓 +{student.kttx_bonus} KTTX</span>
            </>
          )}
        </div>
      </div>

      {/* Status Overlays */}
      {isAbsent && (
        <div className="mt-2 w-full py-0.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider text-center shadow-xs flex items-center justify-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>VẮNG MẶT</span>
        </div>
      )}

      {!isAbsent && isCalled && (
        <div className="mt-2 w-full py-0.5 bg-slate-700 text-amber-300 rounded-lg text-[10px] font-black uppercase tracking-wider text-center shadow-xs flex items-center justify-center space-x-1">
          <CheckCircle2 className="w-3 h-3 text-amber-300" />
          <span>ĐÃ GỌI</span>
        </div>
      )}

      {!isAbsent && !isCalled && (
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity w-full py-0.5 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-extrabold text-center flex items-center justify-center space-x-1">
          <Award className="w-3 h-3 text-purple-600" />
          <span>Cho Điểm</span>
        </div>
      )}
    </div>
  );
};

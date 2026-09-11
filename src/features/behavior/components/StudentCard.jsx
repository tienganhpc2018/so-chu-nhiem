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

      {/* Avatar with Golden Ring */}
      <div className="relative mt-2 mb-2">
        <div
          className={`rounded-full overflow-hidden border-2 border-amber-400 ring-4 ring-amber-200/60 shadow-md transition-all duration-300 bg-gradient-to-b from-amber-50 to-orange-50 ${
            isLarge ? 'w-24 h-24' : 'w-20 h-20'
          }`}
        >
          <img
            src={
              student.avatar ||
              student.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.full_name || 'student')}`
            }
            alt={student.full_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Gender dot */}
        <span
          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
            student.gender === 'Nữ' || student.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
          }`}
          title={student.gender === 'Nữ' || student.gender === 'female' ? 'Nữ' : 'Nam'}
        />
      </div>

      {/* Student Name and Code */}
      <div className="w-full text-center space-y-1">
        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm truncate px-1" title={student.full_name}>
          {student.full_name}
        </h4>
        <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-400 font-bold">
          <span>{student.code || `HS${String(student.seat_row || 1).padStart(2, '0')}`}</span>
          <span>•</span>
          <span className="text-purple-600 font-extrabold">Tổ {student.team_group || 1}</span>
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

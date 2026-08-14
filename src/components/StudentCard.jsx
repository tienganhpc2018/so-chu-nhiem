import React from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Star, Plus, Minus, Gift, Award, MoreHorizontal } from 'lucide-react';

export const StudentCard = ({
  student,
  onAddPoints,
  onDeductPoints,
  onOpenRewardShop,
  onSelectStudent,
  isDragOver = false
}) => {
  const triggerConfetti = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#10B981', '#F97316', '#FBBF24']
    });
  };

  const handleAddQuick = (e) => {
    e.stopPropagation();
    soundFx.playCorrect();
    triggerConfetti(e);
    onAddPoints(student, 5, 'Khen thưởng hăng hái nề nếp');
  };

  const handleDeductQuick = (e) => {
    e.stopPropagation();
    soundFx.playDeduct();
    onDeductPoints(student, 5, 'Nhắc nhở vi phạm nề nếp');
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', student.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onSelectStudent?.(student)}
      className={`group relative bg-white rounded-2xl p-3 border transition-all cursor-grab active:cursor-grabbing hover:shadow-lg flex flex-col justify-between select-none ${
        isDragOver
          ? 'border-mint-500 ring-2 ring-mint-400 bg-mint-50/50 scale-105'
          : 'border-mint-100/80 hover:border-mint-300 shadow-soft'
      }`}
    >
      {/* Top Bar: Seat Coordinates & Star Count */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-500 bg-mint-50 px-2 py-0.5 rounded-full border border-mint-100">
          Bàn B{student.seat_row}-C{student.seat_col}
        </span>

        {/* Total Stars Badge */}
        <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span className="text-xs font-extrabold">{student.total_stars || 0}</span>
        </div>
      </div>

      {/* Student Avatar & Name */}
      <div className="flex flex-col items-center text-center my-1">
        <div className="relative mb-2">
          <img
            src={student.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.id}`}
            alt={student.full_name}
            className="w-14 h-14 rounded-full object-cover border-2 border-mint-200 p-0.5 bg-mint-50 group-hover:border-mint-400 transition-colors shadow-sm"
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${student.id}`;
            }}
          />
        </div>
        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1 group-hover:text-mint-700 transition-colors">
          {student.full_name}
        </h4>
      </div>

      {/* Action Buttons: Quick Point Add/Deduct & Reward Shop */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between space-x-1">
        
        {/* Quick Deduct -5 */}
        <button
          onClick={handleDeductQuick}
          title="Trừ 5 sao (Vi phạm)"
          className="flex-1 flex items-center justify-center space-x-0.5 bg-coral-50 hover:bg-coral-500 text-coral-600 hover:text-white py-1 rounded-xl text-[11px] font-bold transition-all border border-coral-200 hover:border-coral-500 shadow-sm"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>5</span>
        </button>

        {/* Quick Add +5 */}
        <button
          onClick={handleAddQuick}
          title="Cộng 5 sao (Tuyên dương)"
          className="flex-1 flex items-center justify-center space-x-0.5 bg-mint-50 hover:bg-mint-500 text-mint-700 hover:text-white py-1 rounded-xl text-[11px] font-bold transition-all border border-mint-200 hover:border-mint-500 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>5</span>
        </button>

        {/* Redeem Reward */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playClick();
            onOpenRewardShop?.(student);
          }}
          title="Cửa hàng đổi quà"
          className="p-1 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white rounded-xl transition-colors border border-amber-200"
        >
          <Gift className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};

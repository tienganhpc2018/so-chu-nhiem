import React, { useState } from 'react';
import { X, Check, ArrowLeftRight, Users, Sparkles } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const SeatingChartModal = ({
  isOpen,
  onClose,
  students = [],
  currentClass,
  onSwapSeats
}) => {
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [dragOverSeat, setDragOverSeat] = useState(null);

  if (!isOpen) return null;

  // Max rows needed (usually 5 to 6 rows)
  const maxRow = Math.max(5, ...students.map(s => Number(s.seat_row || 1)));

  // Group seats by 4 Aisles (Dãy 1: col 1-2, Dãy 2: col 3-4, Dãy 3: col 5-6, Dãy 4: col 7-8)
  const aisles = [
    { aisleNumber: 1, cols: [1, 2], label: 'DÃY 1' },
    { aisleNumber: 2, cols: [3, 4], label: 'DÃY 2' },
    { aisleNumber: 3, cols: [5, 6], label: 'DÃY 3' },
    { aisleNumber: 4, cols: [7, 8], label: 'DÃY 4' },
  ];

  const handleDragStart = (e, st) => {
    setDraggedStudent(st);
    e.dataTransfer.setData('text/plain', st.id);
  };

  const handleDragOver = (e, r, c) => {
    e.preventDefault();
    setDragOverSeat(`${r}-${c}`);
  };

  const handleDrop = (e, targetRow, targetCol, targetStudent) => {
    e.preventDefault();
    setDragOverSeat(null);
    if (!draggedStudent) return;

    soundFx.playCorrect();
    onSwapSeats?.(draggedStudent, targetRow, targetCol, targetStudent);
    setDraggedStudent(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl bg-slate-900 border-4 border-amber-400 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-white flex flex-col justify-between max-h-[95vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏫</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-300">
                SƠ ĐỒ CHỖ NGỒI LỚP HỌC — KÉO THẢ HOÁN ĐỔI BÀN HỌC
              </h3>
              <p className="text-[11px] text-slate-300 font-bold">
                Kéo một bạn học sinh thả đè lên bạn khác để hoán đổi chỗ ngồi ngay lập tức
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Teacher's Blackboard at Front */}
        <div className="my-4 mx-auto w-full max-w-md bg-gradient-to-b from-emerald-900 to-emerald-950 border-4 border-amber-700 rounded-2xl p-3 shadow-lg text-center">
          <span className="text-xs font-black text-amber-200 tracking-widest uppercase">
            BẢNG LỚP HỌC — BÀN GIÁO VIÊN
          </span>
          <div className="text-[10px] text-emerald-300/80 font-bold mt-0.5">
            Lớp {currentClass?.name || '7A6'} • Bục giảng hướng nhìn xuống lớp
          </div>
        </div>

        {/* 4 Aisles Seating Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-2">
          {aisles.map(aisle => (
            <div key={aisle.aisleNumber} className="bg-slate-800/60 rounded-3xl p-3 border border-slate-700/80 flex flex-col space-y-3">
              
              {/* Aisle Title */}
              <div className="py-1.5 px-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-center">
                <span className="text-xs font-black text-amber-300">{aisle.label}</span>
              </div>

              {/* Rows */}
              {Array.from({ length: maxRow }, (_, rIdx) => {
                const r = rIdx + 1;
                return (
                  <div key={r} className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-slate-400 w-4 text-center">B{r}</span>

                    <div className="flex-1 grid grid-cols-2 gap-1.5 p-1 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                      {aisle.cols.map(c => {
                        const studentAtSeat = students.find(s => Number(s.seat_row) === r && Number(s.seat_col) === c);
                        const isOver = dragOverSeat === `${r}-${c}`;

                        return (
                          <div
                            key={c}
                            onDragOver={(e) => handleDragOver(e, r, c)}
                            onDrop={(e) => handleDrop(e, r, c, studentAtSeat)}
                            className={`min-h-[64px] rounded-xl p-1.5 flex flex-col items-center justify-center text-center transition-all ${
                              isOver
                                ? 'bg-amber-400/30 border-2 border-amber-400 scale-105'
                                : studentAtSeat
                                ? 'bg-slate-800 border border-slate-600 hover:border-purple-400 cursor-grab active:cursor-grabbing'
                                : 'bg-slate-900/40 border border-dashed border-slate-700 text-slate-500'
                            }`}
                          >
                            {studentAtSeat ? (
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, studentAtSeat)}
                                className="w-full flex flex-col items-center select-none"
                              >
                                <img
                                  src={
                                    studentAtSeat.avatar ||
                                    studentAtSeat.avatar_url ||
                                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentAtSeat.full_name)}`
                                  }
                                  alt={studentAtSeat.full_name}
                                  className="w-8 h-8 rounded-full border border-amber-400 mb-0.5 object-cover"
                                />
                                <span className="font-extrabold text-[10px] text-white truncate max-w-[65px]">
                                  {studentAtSeat.full_name}
                                </span>
                                <span className="text-[8px] text-purple-300 font-bold">
                                  Tổ {studentAtSeat.team_group || 1}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-500">Trống</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold">
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
            <span>Mẹo: Hãy kéo ảnh đại diện của một em và thả đè lên bạn khác để hoán vị trí hai em.</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition-all"
          >
            Hoàn Tất Xếp Bàn
          </button>
        </div>

      </div>
    </div>
  );
};

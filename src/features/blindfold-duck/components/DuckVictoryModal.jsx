import React from 'react';
import { Award, Trophy, RotateCcw, ArrowLeft, Flame, Timer, CheckCircle } from 'lucide-react';

export const DuckVictoryModal = ({
  sessionData,
  onRestart,
  onViewLeaderboard,
  onClose
}) => {
  if (!sessionData) return null;

  const {
    playerName = 'Người chơi',
    score = 0,
    ducksCaught = 0,
    correctAnswers = 0,
    totalQuestions = 0,
    comboMax = 1,
    durationSeconds = 60
  } = sessionData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 text-center overflow-hidden">
        {/* Pháo hoa trang trí */}
        <div className="text-4xl mb-2 animate-bounce">🎉 🦆 🏆</div>

        <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
          XUẤT SẮC HOÀN THÀNH
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-1 mb-1">
          {playerName}
        </h2>

        {/* Điểm số to tròn nổi bật */}
        <div className="my-5 p-5 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-200">
          <span className="text-xs uppercase font-extrabold tracking-wider block opacity-90">
            Tổng Điểm Nhận Được
          </span>
          <div className="text-5xl font-black tracking-tight my-1 flex items-center justify-center space-x-1">
            <span>⭐</span>
            <span>{score}</span>
          </div>
          <span className="text-xs font-bold opacity-90">Điểm Lễ Hội Dân Gian</span>
        </div>

        {/* Lưới 4 chỉ số thống kê */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <span className="text-lg">🦆</span>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5">Vịt Bắt Được</span>
            <span className="text-lg font-black text-slate-900">{ducksCaught}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <span className="text-lg">✅</span>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5">Câu Đúng</span>
            <span className="text-lg font-black text-slate-900">{correctAnswers}/{totalQuestions || ducksCaught}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <span className="text-lg">🔥</span>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5">Combo Cao Nhất</span>
            <span className="text-lg font-black text-orange-600">x{comboMax}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <span className="text-lg">⏱️</span>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5">Thời Gian</span>
            <span className="text-lg font-black text-slate-900">{durationSeconds}s</span>
          </div>
        </div>

        {/* Các nút hành động */}
        <div className="mt-5 space-y-2">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-md shadow-emerald-100 hover:scale-102 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CHƠI LẠI LƯỢT MỚI</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewLeaderboard}
              className="flex items-center justify-center space-x-1.5 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs transition-all active:scale-98"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>BẢNG XẾP HẠNG</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center space-x-1.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all active:scale-98"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>QUAY LẠI LMS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

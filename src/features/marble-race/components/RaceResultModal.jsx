import React from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Medal,
  RotateCcw,
  Settings,
  HelpCircle,
  X,
  Sparkles,
  Award,
  ArrowRight
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const RaceResultModal = ({
  isOpen,
  onClose,
  winner,
  leaderboard = [],
  raceTime = 0,
  enableQuestions = true,
  onRestartRace,
  onOpenSettings,
  onOpenQuestionModal,
  onRewardStudent
}) => {
  if (!isOpen) return null;

  const top1 = leaderboard[0] || winner;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-purple-100 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Header Vinh Danh */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              🏆
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                KẾT QUẢ CUỘC ĐUA BI — BẢNG VÀNG
              </h3>
              <p className="text-xs text-amber-100 font-bold mt-0.5">
                Thời gian cuộc đua: <span className="font-mono font-black">{raceTime.toFixed(2)}s</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung kết quả */}
        <div className="p-6 sm:p-7 space-y-6 flex-1 overflow-y-auto">
          
          {/* Bục Vinh Quang Top 3 (Podium) */}
          <div className="flex items-end justify-center gap-3 pt-2 pb-4">
            
            {/* Top 2: Bạc */}
            {top2 && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-3 border-slate-300 p-0.5 bg-slate-100 shadow-md overflow-hidden relative mb-2">
                  {top2.avatar ? (
                    <img src={top2.avatar} alt="top2" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: top2.color }}>
                      {top2.initials}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-400 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white">
                    2
                  </span>
                </div>
                <div className="text-xs font-black text-slate-800 text-center max-w-[80px] truncate">
                  {top2.name.split(' ').pop()}
                </div>
                <div className="h-18 w-20 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl flex items-center justify-center font-black text-slate-500 text-sm mt-1 shadow-inner">
                  🥈 Hạng 2
                </div>
              </div>
            )}

            {/* Top 1: Vàng (Cao nhất) */}
            {top1 && (
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-18 h-18 rounded-full border-4 border-amber-400 p-0.5 bg-amber-50 shadow-xl overflow-hidden">
                    {top1.avatar ? (
                      <img src={top1.avatar} alt="top1" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: top1.color }}>
                        {top1.initials}
                      </div>
                    )}
                  </div>
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">
                    👑
                  </span>
                  <span className="absolute -bottom-1 right-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-black border-2 border-white shadow-sm">
                    1
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 text-center max-w-[100px] truncate">
                  {top1.name}
                </div>
                <div className="h-26 w-24 bg-gradient-to-t from-amber-300 to-yellow-200 rounded-t-2xl flex flex-col items-center justify-center font-black text-amber-900 text-sm mt-1 shadow-md border-t-2 border-amber-400">
                  <Trophy className="w-5 h-5 fill-current text-amber-600 mb-0.5" />
                  <span>VỀ NHẤT</span>
                </div>
              </div>
            )}

            {/* Top 3: Đồng */}
            {top3 && (
              <div className="flex flex-col items-center">
                <div className="w-13 h-13 rounded-full border-3 border-amber-700/50 p-0.5 bg-amber-50 shadow-md overflow-hidden relative mb-2">
                  {top3.avatar ? (
                    <img src={top3.avatar} alt="top3" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: top3.color }}>
                      {top3.initials}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-700 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white">
                    3
                  </span>
                </div>
                <div className="text-xs font-black text-slate-800 text-center max-w-[80px] truncate">
                  {top3.name.split(' ').pop()}
                </div>
                <div className="h-14 w-20 bg-gradient-to-t from-amber-200/80 to-amber-100 rounded-t-2xl flex items-center justify-center font-black text-amber-800 text-sm mt-1 shadow-inner">
                  🥉 Hạng 3
                </div>
              </div>
            )}

          </div>

          {/* Banner Thử Thách Câu Hỏi Tiếng Anh (Nếu bật) */}
          {enableQuestions && top1 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-200 rounded-3xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-sm">
                  📚
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-purple-950">
                    Thử thách câu hỏi trắc nghiệm Tiếng Anh:
                  </h4>
                  <p className="text-[11px] text-purple-700 font-bold mt-0.5">
                    Mời bạn <strong>{top1.name}</strong> trả lời câu hỏi để nhận thêm điểm thưởng!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenQuestionModal}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all transform hover:scale-105 active:scale-95 shrink-0"
              >
                <span>Mở câu hỏi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Toàn bộ bảng xếp hạng (Full Leaderboard) */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">
              Bảng xếp hạng đầy đủ ({leaderboard.length} học sinh):
            </h4>
            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white">
              {leaderboard.map((m, idx) => (
                <div
                  key={m.id}
                  className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 text-center font-black ${
                      idx === 0 ? 'text-amber-500 font-extrabold text-sm' : idx < 3 ? 'text-purple-600 font-bold' : 'text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    {m.avatar ? (
                      <img src={m.avatar} alt="av" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: m.color }}>
                        {m.initials}
                      </div>
                    )}
                    <span className="font-extrabold text-slate-800">
                      {m.name}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-slate-400 font-bold">
                    {m.finishTime ? `${m.finishTime.toFixed(2)}s` : 'Chưa hoàn thành'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="p-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cài đặt lại</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onRestartRace}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all transform hover:scale-102 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đua lại ngay</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

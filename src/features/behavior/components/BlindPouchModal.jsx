import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Gift, Check, Sparkles, RotateCcw } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const BlindPouchModal = ({
  isOpen,
  onClose,
  students = [],
  calledStudentIds = [],
  openedPouchNumbers = [],
  onOpenPouch,
  onResetPouches
}) => {
  const [activeStep, setActiveStep] = useState(1); // 1: 32 Grid, 2: Tearing, 3: Winner
  const [selectedPouch, setSelectedPouch] = useState(null);
  const [winnerStudent, setWinnerStudent] = useState(null);

  if (!isOpen) return null;

  const availableStudents = students.filter(
    s => !calledStudentIds.includes(s.id) && s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
  );
  const pool = availableStudents.length > 0 ? availableStudents : students;

  const handleSelectPouch = (num) => {
    if (openedPouchNumbers.includes(num)) return;
    soundFx.playClick();
    setSelectedPouch(num);
    setActiveStep(2); // Start tearing

    soundFx.playTear();

    // After 1.2s tearing animation, reveal winner
    setTimeout(() => {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setWinnerStudent(rand);
      onOpenPouch?.(num, rand?.id);

      soundFx.playWinner();
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#EC4899', '#06B6D4', '#F59E0B', '#10B981']
      });

      setActiveStep(3);
    }, 1200);
  };

  const handleClaimPoints = (pts = 5) => {
    soundFx.playCorrect();
    setActiveStep(1);
    setSelectedPouch(null);
    setWinnerStudent(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border-4 border-emerald-600 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-white flex flex-col items-center justify-between min-h-[620px] overflow-hidden">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-emerald-700/50 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎁</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-emerald-400 tracking-wide">
                BẢNG 32 TÚI MÙ MAY MẮN (BLIND POUCH)
              </h3>
              <p className="text-[11px] text-emerald-200/80 font-bold">
                Xé mở túi mù khám phá bạn học sinh may mắn & quà tặng bí mật
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onResetPouches?.();
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-800/60 hover:bg-emerald-700 text-xs font-bold text-emerald-200 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm Mới Túi ({openedPouchNumbers.length}/32)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* STEP 1: 32 Pouches on Green Craft Cutting Mat */}
        {activeStep === 1 && (
          <div className="flex-1 w-full flex flex-col items-center justify-center py-4 z-10">
            {/* Green Cutting Mat Simulation */}
            <div
              className="w-full p-4 sm:p-6 rounded-3xl border-4 border-emerald-800 shadow-inner overflow-hidden"
              style={{
                backgroundColor: '#064e3b',
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            >
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3">
                {Array.from({ length: 32 }, (_, i) => i + 1).map(num => {
                  const isOpened = openedPouchNumbers.includes(num);
                  const isPink = num % 2 !== 0;

                  return (
                    <button
                      key={num}
                      onClick={() => handleSelectPouch(num)}
                      disabled={isOpened}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-200 shadow-md ${
                        isOpened
                          ? 'bg-slate-700/60 text-slate-400 border border-slate-600 opacity-40 grayscale cursor-not-allowed scale-95'
                          : isPink
                          ? 'bg-gradient-to-tr from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-white border-2 border-pink-200 hover:scale-110 active:scale-95 cursor-pointer shadow-pink-500/30'
                          : 'bg-gradient-to-tr from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-white border-2 border-cyan-200 hover:scale-110 active:scale-95 cursor-pointer shadow-cyan-500/30'
                      }`}
                    >
                      {/* Top ribbon / notch */}
                      <div className="absolute top-1 w-5 h-1.5 bg-white/40 rounded-full" />
                      <Gift className="w-5 h-5 mb-0.5" />
                      <span className="text-xs sm:text-sm font-black">{num}</span>

                      {isOpened && (
                        <div className="absolute inset-0 bg-slate-900/70 rounded-2xl flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Tearing Animated Simulation */}
        {activeStep === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 z-10 animate-in zoom-in-90">
            <div className="relative w-48 h-56 flex items-center justify-center animate-bounce">
              {/* Shaking Pouch Graphic */}
              <div className="w-40 h-48 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-400 border-4 border-white shadow-2xl flex flex-col items-center justify-center p-4 transform rotate-1 animate-pulse">
                <Gift className="w-16 h-16 text-white mb-2" />
                <span className="text-2xl font-black text-white">TÚI #{selectedPouch}</span>
                <span className="text-xs font-bold text-pink-100 mt-2">Đang xé mở... ✂️</span>
              </div>
            </div>
            <p className="text-sm font-extrabold text-pink-300 tracking-wider">
              HỒI HỘP CHỜ ĐỢI PHẦN QUÀ BÍ MẬT...
            </p>
          </div>
        )}

        {/* STEP 3: Reveal Winner + Pixar Mascot Graphic */}
        {activeStep === 3 && winnerStudent && (
          <div className="flex-1 w-full flex flex-col items-center justify-center py-6 z-10 space-y-5 animate-in zoom-in-75">
            
            {/* Mascot Capybara / Pixar Box */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-b from-slate-800 to-slate-900 border-4 border-pink-400/80 rounded-[3rem] shadow-[0_0_50px_rgba(244,114,182,0.4)] flex flex-col items-center text-center max-w-md w-full">
              
              {/* Mascot Capybara Badge */}
              <div className="absolute -top-10 w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-xl flex items-center justify-center text-3xl">
                🦫
              </div>

              {/* Winner Student Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-300 shadow-2xl mb-3 mt-4 bg-purple-100">
                <img
                  src={
                    winnerStudent.avatar ||
                    winnerStudent.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(winnerStudent.full_name)}`
                  }
                  alt={winnerStudent.full_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-xs font-black text-pink-400 uppercase tracking-widest">
                CHÚC MỪNG TÚI MÙ #{selectedPouch}
              </span>
              
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1">
                {winnerStudent.full_name}
              </h2>
              <span className="text-xs text-slate-400 font-bold mt-1">
                Mã: {winnerStudent.code || 'HS'} • Tổ {winnerStudent.team_group || 1}
              </span>

              {/* Reward Button */}
              <div className="mt-5 flex items-center space-x-3 w-full">
                <button
                  onClick={() => handleClaimPoints(5)}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-pink-500/30 flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>+ THƯỞNG 5 ĐIỂM TÚI MÙ</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveStep(1)}
              className="text-xs font-bold text-slate-400 hover:text-white underline transition-colors"
            >
              Mở túi mù tiếp theo ➔
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

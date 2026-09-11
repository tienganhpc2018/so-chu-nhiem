import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X, Zap, Users, Sparkles, Award, RotateCcw } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const SuspenseCallModal = ({
  isOpen,
  onClose,
  mode = 'single', // 'single' | 'multi'
  students = [],
  calledStudentIds = [],
  onConfirmWinner
}) => {
  const [stage, setStage] = useState('idle'); // 'idle' | 'spinning' | 'revealed'
  const [countdown, setCountdown] = useState(6);
  const [currentFlickerStudent, setCurrentFlickerStudent] = useState(null);
  const [winnerStudents, setWinnerStudents] = useState([]);

  const spinTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Available students who are not absent and haven't been called
  const uncalledStudents = students.filter(
    s => !calledStudentIds.includes(s.id) && s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
  );
  const pool = uncalledStudents.length > 0 ? uncalledStudents : students;

  useEffect(() => {
    if (!isOpen) {
      clearInterval(spinTimerRef.current);
      clearInterval(countdownTimerRef.current);
      setStage('idle');
      setCountdown(6);
      setWinnerStudents([]);
    } else {
      if (mode === 'single') {
        // Auto start suspense for single call
        startSuspenseSpin();
      } else {
        setStage('idle');
      }
    }
  }, [isOpen, mode]);

  const startSuspenseSpin = () => {
    soundFx.playClick();
    setStage('spinning');
    setCountdown(6);

    soundFx.playSuspenseSpin();

    // Rapid flicker
    spinTimerRef.current = setInterval(() => {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setCurrentFlickerStudent(rand);
      soundFx.playTick();
    }, 70);

    // 6-second countdown
    let count = 6;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count <= 0) {
        clearInterval(countdownTimerRef.current);
        clearInterval(spinTimerRef.current);

        // Pick winners
        if (mode === 'single') {
          const winner = pool[Math.floor(Math.random() * pool.length)] || pool[0];
          setWinnerStudents([winner]);
        } else {
          // Pick 3 distinct winners
          const shuffled = [...pool].sort(() => 0.5 - Math.random());
          const winners = shuffled.slice(0, Math.min(3, shuffled.length));
          setWinnerStudents(winners);
        }

        soundFx.playWinner();
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']
        });

        setStage('revealed');
      }
    }, 1000);
  };

  const handleClaimReward = (points = 3) => {
    soundFx.playCorrect();
    winnerStudents.forEach(w => {
      onConfirmWinner?.(w.id, points);
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border-4 border-purple-500 rounded-[2.5rem] shadow-2xl p-5 sm:p-7 text-white flex flex-col items-center justify-between min-h-[560px] overflow-hidden">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-purple-800/60 z-10">
          <div className="flex items-center space-x-2">
            {mode === 'single' ? (
              <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
            ) : (
              <Users className="w-6 h-6 text-cyan-400" />
            )}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-purple-300 tracking-wide">
                {mode === 'single' ? 'GỌI 1 HỌC SINH (6S HỒI HỘP)' : 'GỌI NHIỀU (XEM FULL LỚP)'}
              </h3>
              <p className="text-[11px] text-purple-200/70 font-bold">
                {pool.length} học sinh chưa gọi trong danh sách quay
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

        {/* STAGE: IDLE (For Multi-call Full Class View) */}
        {stage === 'idle' && mode === 'multi' && (
          <div className="flex-1 w-full flex flex-col items-center justify-between py-4 space-y-4 z-10">
            <div className="w-full text-center">
              <span className="text-xs font-black text-purple-300 uppercase tracking-widest">
                DANH SÁCH TOÀN BỘ SĨ SỐ LỚP ({students.length} HỌC SINH)
              </span>
            </div>

            {/* Class Avatars Grid Preview */}
            <div className="w-full max-h-[300px] overflow-y-auto p-3 bg-slate-800/70 rounded-2xl border border-slate-700 grid grid-cols-3 sm:grid-cols-6 gap-2.5 custom-scrollbar">
              {students.map(st => {
                const isCalled = calledStudentIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    className={`p-2 rounded-xl flex flex-col items-center text-center text-xs transition-all ${
                      isCalled
                        ? 'bg-slate-800 opacity-40 grayscale'
                        : 'bg-slate-700/60 hover:bg-slate-600'
                    }`}
                  >
                    <img
                      src={
                        st.avatar ||
                        st.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(st.full_name)}`
                      }
                      alt={st.full_name}
                      className="w-10 h-10 rounded-full mb-1 border-2 border-purple-400"
                    />
                    <span className="font-extrabold text-[11px] truncate w-full">{st.full_name}</span>
                    {isCalled && <span className="text-[9px] text-amber-300 font-bold">[Đã gọi]</span>}
                  </div>
                );
              })}
            </div>

            {/* Launch Button */}
            <button
              onClick={startSuspenseSpin}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/40 flex items-center space-x-2 transform hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>🚀 BẮT ĐẦU VÒNG QUAY GỌI 3 HỌC SINH</span>
            </button>
          </div>
        )}

        {/* STAGE: SPINNING (6s Suspense Countdown) */}
        {stage === 'spinning' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 z-10 py-6">
            
            {/* Suspense Countdown Badge */}
            <div className="relative w-28 h-28 rounded-full border-4 border-purple-400 bg-purple-950 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] animate-pulse">
              <span className="font-mono text-5xl font-black text-amber-300">
                {countdown}
              </span>
            </div>

            {/* Rapidly Flickering Card */}
            {currentFlickerStudent && (
              <div className="p-4 bg-slate-800/90 border-2 border-purple-400/80 rounded-3xl flex flex-col items-center text-center shadow-xl w-64 animate-in zoom-in-95">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-300 mb-2">
                  <img
                    src={
                      currentFlickerStudent.avatar ||
                      currentFlickerStudent.avatar_url ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentFlickerStudent.full_name)}`
                    }
                    alt={currentFlickerStudent.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-lg font-black text-white truncate max-w-[220px]">
                  {currentFlickerStudent.full_name}
                </h4>
                <span className="text-xs text-purple-300 font-bold">
                  {currentFlickerStudent.code || 'Đang chọn ngẫu nhiên...'}
                </span>
              </div>
            )}

            <p className="text-xs font-black text-amber-300 tracking-widest uppercase animate-bounce">
              ⚡ ĐANG QUAY SỐ HỒI HỘP — CHUẨN BỊ XƯỚNG TÊN...
            </p>
          </div>
        )}

        {/* STAGE: REVEALED (Winner Reveal) */}
        {stage === 'revealed' && winnerStudents.length > 0 && (
          <div className="flex-1 w-full flex flex-col items-center justify-center space-y-6 z-10 py-4 animate-in zoom-in-75">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
              🎉 XIN CHÚC MỪNG BẠN HỌC SINH MAY MẮN!
            </span>

            {/* Winner(s) Display */}
            <div className={`grid gap-4 w-full justify-center ${winnerStudents.length === 1 ? 'grid-cols-1 max-w-xs' : 'grid-cols-1 sm:grid-cols-3 max-w-2xl'}`}>
              {winnerStudents.map((winner, idx) => (
                <div
                  key={winner.id || idx}
                  className="p-5 bg-gradient-to-b from-purple-900/90 to-slate-800 border-3 border-amber-400 rounded-3xl shadow-[0_0_35px_rgba(251,191,36,0.4)] flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-amber-300 shadow-xl mb-2 bg-purple-100">
                    <img
                      src={
                        winner.avatar ||
                        winner.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(winner.full_name)}`
                      }
                      alt={winner.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span className="text-[10px] font-black text-amber-300 uppercase">
                    {mode === 'multi' ? `HỌC SINH #${idx + 1}` : 'NGƯỜI ĐƯỢC CHỌN'}
                  </span>
                  
                  <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                    {winner.full_name}
                  </h4>
                  
                  <span className="text-[11px] text-purple-200 font-bold mt-0.5">
                    Tổ {winner.team_group || 1} • Bàn H{winner.seat_row || 1}-C{winner.seat_col || 1}
                  </span>

                  <span className="mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                    ĐÃ GỌI TÊN
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={startSuspenseSpin}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-xs font-bold text-purple-200 rounded-xl transition-all"
              >
                Quay Lại Lượt Mới
              </button>

              <button
                onClick={() => handleClaimReward(3)}
                className="px-7 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-400/40 flex items-center space-x-2 transform hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>+ THƯỞNG 3 ĐIỂM {mode === 'multi' ? 'CHO CẢ 3 BẠN' : ''}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

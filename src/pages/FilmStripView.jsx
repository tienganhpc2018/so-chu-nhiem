import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Film,
  Play,
  RotateCcw,
  Trophy,
  Users,
  Coins,
  Sparkles,
  X,
  Plus,
  CheckCircle2
} from 'lucide-react';

export const FilmStripView = ({ currentClass, students = [] }) => {
  const [availableStudents, setAvailableStudents] = useState([]);
  const [excludedStudents, setExcludedStudents] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [autoExclude, setAutoExclude] = useState(true);

  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerStudent, setWinnerStudent] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [rewardCoinCount, setRewardCoinCount] = useState(2);

  // Horizontal reel offset for animation
  const [reelOffset, setReelOffset] = useState(0);
  const reelRef = useRef(null);

  useEffect(() => {
    if (students && students.length > 0) {
      setAvailableStudents(students);
    }
  }, [students]);

  // Handle Spin Film Strip Animation
  const handleStartSpin = () => {
    if (availableStudents.length === 0) {
      alert('Tất cả học sinh đã trúng cuộn phim! Thầy bấm "Cho tất cả vào lại" để nạp lại nhé.');
      return;
    }

    soundFx.playClick();
    soundFx.playSuspenseSpin();
    setIsSpinning(true);
    setWinnerStudent(null);

    // Animate horizontal film reel sliding
    let count = 0;
    const interval = setInterval(() => {
      setReelOffset(prev => (prev + 120) % (availableStudents.length * 140));
      count += 1;
    }, 80);

    // Pick winner after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      const winner = availableStudents[randomIndex];

      setWinnerStudent(winner);
      setIsSpinning(false);
      setShowWinnerModal(true);

      soundFx.playWinner();
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } });

      // Record to history
      setHistoryLogs(prev => [
        { id: Date.now(), student: winner, time: new Date().toLocaleTimeString('vi-VN') },
        ...prev
      ]);

      // Auto exclude winner if checked
      if (autoExclude) {
        setAvailableStudents(prev => prev.filter(s => s.id !== winner.id));
        setExcludedStudents(prev => [...prev, winner]);
      }
    }, 3200);
  };

  // Add Coins to Winner
  const handleRewardCoins = (amount) => {
    if (!winnerStudent) return;
    soundFx.playCorrect();
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });

    winnerStudent.total_stars = (winnerStudent.total_stars || 0) + amount;
    alert(`Đã cộng +${amount} xu cho học sinh ${winnerStudent.full_name}!`);
  };

  // Re-include excluded student
  const handleReIncludeStudent = (student) => {
    soundFx.playClick();
    setExcludedStudents(prev => prev.filter(s => s.id !== student.id));
    setAvailableStudents(prev => [...prev, student]);
  };

  // Re-include ALL excluded students
  const handleReIncludeAll = () => {
    soundFx.playCorrect();
    setAvailableStudents(students);
    setExcludedStudents([]);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
      
      {/* HEADER BANNER (Screenshot 2) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-purple-glow">
              <Film className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Cuộn Phim May Mắn - Lớp {currentClass?.name || '8A5'}
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Băng phim cuộn ngang qua từng học sinh, dừng ngẫu nhiên để chiếu sáng người may mắn!
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-2xl text-xs font-black text-purple-900">
          <Users className="w-4 h-4 text-purple-600" />
          <span>Trong phim: {availableStudents.length} / {students.length} em</span>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT (Screenshots 2 & 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (7 Cols): MÁY CHIẾU PHIM MAY MẮN */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
            <Film className="w-4 h-4 text-purple-600" />
            <span>🎞️ 🎬 MÁY CHIẾU PHIM MAY MẮN 🎬 🎞️</span>
          </div>

          {/* CINEMA FILM STRIP PROJECTOR VIEWPORT (Screenshot 2) */}
          <div className="relative w-full bg-slate-950 rounded-3xl p-6 border-4 border-purple-900 shadow-2xl overflow-hidden min-h-[220px] flex items-center justify-center">
            
            {/* Top & Bottom Sprocket Holes */}
            <div className="absolute top-2 left-0 right-0 flex justify-between px-4 opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`th-${i}`} className="w-3 h-2 bg-amber-400 rounded-sm"></div>
              ))}
            </div>
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`bh-${i}`} className="w-3 h-2 bg-amber-400 rounded-sm"></div>
              ))}
            </div>

            {/* Center Yellow Spotlight Target Rectangle */}
            <div className="absolute z-20 w-32 h-36 border-4 border-amber-400 bg-amber-400/10 rounded-2xl shadow-coral-glow pointer-events-none flex items-center justify-center">
              <span className="absolute -top-3 bg-amber-400 text-purple-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md uppercase">
                SPOTLIGHT ✦
              </span>
            </div>

            {/* Horizontal Rolling Film Strip Track */}
            <div
              ref={reelRef}
              className="flex items-center space-x-6 transition-all duration-75 px-32"
              style={{
                transform: `translateX(-${reelOffset}px)`
              }}
            >
              {[...availableStudents, ...availableStudents, ...availableStudents].map((st, idx) => (
                <div
                  key={`film-${st.id}-${idx}`}
                  className="flex flex-col items-center shrink-0 space-y-2 opacity-80 scale-95"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-purple-400 p-0.5 bg-white shadow-md overflow-hidden">
                    <img
                      src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                      alt={st.full_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-[11px] font-black text-white max-w-[90px] truncate block text-center">
                    {st.full_name}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* RESULT DISPLAY BOX (Screenshot 2 & 3) */}
          <div className="w-full bg-gradient-to-r from-amber-50 via-white to-purple-50 rounded-3xl p-5 border-2 border-amber-300/80 shadow-md space-y-3">
            <div className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center justify-center space-x-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>🏆 PHIM DỪNG TẠI... 🏆</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              {winnerStudent ? winnerStudent.full_name : '???'}
            </h3>

            {/* Quick Reward Action Pill (Screenshot 2 & 3) */}
            {winnerStudent && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <select
                  value={rewardCoinCount}
                  onChange={(e) => setRewardCoinCount(Number(e.target.value))}
                  className="bg-white border border-amber-300 text-amber-950 font-black text-xs px-3 py-1.5 rounded-xl outline-none"
                >
                  <option value={1}>+1 xu</option>
                  <option value={2}>+2 xu</option>
                  <option value={5}>+5 xu</option>
                  <option value={10}>+10 xu</option>
                </select>

                <button
                  onClick={() => handleRewardCoins(rewardCoinCount)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1"
                >
                  <Coins className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Thưởng xu</span>
                </button>

                <button
                  onClick={() => setWinnerStudent(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>

          {/* MAIN START FILM REEL BUTTON (Screenshot 2 & 3) */}
          <div className="w-full space-y-3 pt-2">
            <button
              onClick={handleStartSpin}
              disabled={isSpinning || availableStudents.length === 0}
              className={`w-full py-4 rounded-3xl font-black text-base tracking-wider uppercase transition-all shadow-2xl flex items-center justify-center space-x-2 transform active:scale-95 ${
                isSpinning
                  ? 'bg-purple-400 text-white cursor-not-allowed animate-pulse'
                  : 'bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white shadow-coral-glow hover:scale-[1.02]'
              }`}
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{isSpinning ? '🎬 ĐANG QUAY BĂNG PHIM...' : '▶️ 🎬 BẤM QUAY CUỘN PHIM!'}</span>
            </button>

            {/* Auto Exclude Toggle Switch (Screenshot 3) */}
            <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                id="autoExcludeFilmCheck"
                checked={autoExclude}
                onChange={(e) => setAutoExclude(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="autoExcludeFilmCheck" className="cursor-pointer">
                Tự động loại học sinh sau khi chọn
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (5 Cols): STUDENTS IN FILM & HISTORY LOGS (Screenshot 2) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD 1: HỌC SINH TRONG PHIM (Screenshot 2) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800 flex items-center space-x-2">
                <Film className="w-4 h-4 text-purple-600" />
                <span>Học sinh trong phim ({availableStudents.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {availableStudents.map(st => (
                <div key={st.id} className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
                  <img
                    src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                    alt={st.full_name}
                    className="w-10 h-10 rounded-full border border-purple-200 bg-white object-cover"
                  />
                  <span className="text-[10px] font-black text-slate-800 line-clamp-1">{st.full_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: LỊCH SỬ QUAY (Screenshot 2 & 3) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800 flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Lịch sử ({historyLogs.length})</span>
              </h3>

              {historyLogs.length > 0 && (
                <button onClick={() => setHistoryLogs([])} className="text-[11px] font-bold text-coral-600 hover:underline">
                  Xóa lịch sử
                </button>
              )}
            </div>

            {historyLogs.length === 0 ? (
              <div className="py-6 text-center text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl">
                Chưa có lượt quay cuộn phim nào.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {historyLogs.map((log, idx) => (
                  <div key={log.id} className="p-2.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center space-x-2">
                      <img
                        src={log.student.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${log.student.id}`}
                        alt={log.student.full_name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-slate-800 font-black">{log.student.full_name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* EXCLUDED STUDENTS TRAY SECTION (Screenshot 3) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Đã loại ({excludedStudents.length} em) — bấm để cho vào lại</span>
          </h3>

          {excludedStudents.length > 0 && (
            <button
              onClick={handleReIncludeAll}
              className="text-xs font-extrabold text-purple-600 hover:text-purple-900 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cho tất cả vào lại</span>
            </button>
          )}
        </div>

        {excludedStudents.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-2">Chưa có học sinh nào bị loại khỏi cuộn phim.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {excludedStudents.map(st => (
              <button
                key={st.id}
                onClick={() => handleReIncludeStudent(st)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full text-xs font-bold text-purple-900 flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <img
                  src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                  alt={st.full_name}
                  className="w-5 h-5 rounded-full"
                />
                <span>{st.full_name}</span>
                <span className="text-purple-400">✕</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* WINNER REVEAL MODAL (Screenshot 1) */}
      {showWinnerModal && winnerStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border-4 border-amber-400 text-center space-y-6 animate-in zoom-in">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-purple-950 flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>🎉 CHÚC MỪNG HỌC SINH MAY MẮN!</span>
              </h3>
              <button onClick={() => setShowWinnerModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-28 h-28 mx-auto">
              <img
                src={winnerStudent.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerStudent.id}`}
                alt={winnerStudent.full_name}
                className="w-full h-full object-cover rounded-3xl border-4 border-amber-400 shadow-xl bg-white"
              />
              <span className="absolute -bottom-2 -right-2 bg-amber-500 text-purple-950 p-1.5 rounded-full shadow-md">
                🏆
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">{winnerStudent.full_name}</h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">Thành viên may mắn nhất trong cuộn phim!</p>
            </div>

            {/* Quick Reward Coins Pills (Screenshot 1) */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
              <span className="text-xs font-black text-amber-900 block">🪙 Thưởng xu ngay cho {winnerStudent.full_name}:</span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5, 10].map(cnt => (
                  <button
                    key={`win-c-${cnt}`}
                    onClick={() => handleRewardCoins(cnt)}
                    className="py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs shadow-md transition-all"
                  >
                    +{cnt} xu
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowWinnerModal(false);
                  handleStartSpin();
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow flex items-center justify-center space-x-1"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Quay Tiếp Lượt Sau</span>
              </button>

              <button
                onClick={() => setShowWinnerModal(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl"
              >
                ✕ Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

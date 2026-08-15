import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { MascotRobot } from '../components/MascotRobot';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Settings,
  Heart,
  Check,
  Trophy,
  Users,
  Shuffle,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const LuckyWheelView = ({ currentClass, students = [] }) => {
  // Sound mute state
  const [isMuted, setIsMuted] = useState(false);

  // Mode switcher: 'auto' | 'manual' | 'favorite'
  const [effectMode, setEffectMode] = useState('manual');

  // Selected single effect for manual mode
  const [selectedEffect, setSelectedEffect] = useState('xoay_tron');

  // Favorite effects selection for favorite mode
  const [favoriteEffects, setFavoriteEffects] = useState(['xoay_tron', 'tung_nay', 'bay_quy_dao', 'san_khau']);

  // Exclude winner toggle
  const [excludeWinner, setExcludeWinner] = useState(false);

  // Available students in cage
  const [availableStudents, setAvailableStudents] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);

  // Spinning State
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentActiveEffect, setCurrentActiveEffect] = useState('xoay_tron');
  const [winnerStudent, setWinnerStudent] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Animation Frame State
  const [ballPositions, setBallPositions] = useState([]);
  const animationRef = useRef(null);

  // 7 Preset Effects (Matching Screenshots 1, 2, 3)
  const effectPresets = [
    { id: 'xoay_tron', name: 'Xoáy tròn 💫', desc: 'Các quả cầu xoáy quanh tâm lồng' },
    { id: 'tung_nay', name: 'Tung nảy 🤹', desc: 'Bóng nảy va đập tự do tưng bừng' },
    { id: 'hut_vao_tam', name: 'Hút vào tâm 🌀', desc: 'Tất cả quả cầu xoáy dồn tụ vào tâm' },
    { id: 'bay_quy_dao', name: 'Bay theo quỹ đạo 🛸', desc: 'Bay đảo quanh lồng cầu theo vòng lặp' },
    { id: 'mua_bong', name: 'Mưa bóng 🌧️', desc: 'Quả cầu rơi tự do từ trên xuống' },
    { id: 'san_khau', name: 'Sân khấu ánh sáng 🎭', desc: 'Chiếu đèn ngẫu nhiên phát sáng' },
    { id: 'song_bong_benh', name: 'Sóng bồng bềnh 🌊', desc: 'Bóng dao động nhấp nhô bồng bềnh' }
  ];

  useEffect(() => {
    if (students && students.length > 0) {
      setAvailableStudents(students);
      initBallPositions(students);
    }
  }, [students]);

  // Initialize sphere coordinates inside the circular lottery cage
  const initBallPositions = (stList) => {
    const total = stList.length;
    const initial = stList.map((st, idx) => {
      const angle = (idx / total) * 2 * Math.PI;
      const radius = 65 + Math.random() * 25; // Inside cage circle radius
      return {
        id: st.id,
        student: st,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        angle
      };
    });
    setBallPositions(initial);
  };

  // Continuous animation loop for balls based on current active effect
  useEffect(() => {
    let frameId;
    const updatePhysics = () => {
      setBallPositions(prevBalls => {
        return prevBalls.map(ball => {
          let { x, y, vx, vy, angle } = ball;

          if (isSpinning) {
            switch (currentActiveEffect) {
              case 'xoay_tron':
                angle += 0.08;
                const r = Math.sqrt(x * x + y * y) || 75;
                x = Math.cos(angle) * r;
                y = Math.sin(angle) * r;
                break;

              case 'tung_nay':
                x += vx * 2.5;
                y += vy * 2.5;
                if (x * x + y * y > 95 * 95) {
                  vx = -vx * 0.9;
                  vy = -vy * 0.9;
                }
                break;

              case 'hut_vao_tam':
                x *= 0.94;
                y *= 0.94;
                break;

              case 'bay_quy_dao':
                angle += 0.1;
                x = Math.cos(angle * 2) * 85;
                y = Math.sin(angle * 3) * 60;
                break;

              case 'mua_bong':
                y += 4;
                if (y > 90) y = -90;
                break;

              case 'song_bong_benh':
                x += Math.sin(angle) * 2;
                y += Math.cos(angle * 1.5) * 2;
                angle += 0.05;
                break;

              default:
                angle += 0.05;
                x = Math.cos(angle) * 75;
                y = Math.sin(angle) * 75;
                break;
            }
          } else {
            // Gentle floating when idle
            angle += 0.015;
            x += Math.cos(angle) * 0.5;
            y += Math.sin(angle) * 0.5;
          }

          return { ...ball, x, y, vx, vy, angle };
        });
      });

      frameId = requestAnimationFrame(updatePhysics);
    };

    frameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(frameId);
  }, [isSpinning, currentActiveEffect]);

  // Handle Start Spin Button
  const handleStartSpin = () => {
    if (availableStudents.length === 0) {
      alert('Không còn học sinh nào trong lồng cầu! Thầy bấm "Làm mới lượt quay" để nạp lại nhé.');
      return;
    }

    if (!isMuted) soundFx.playClick();

    // Determine effect to run for this turn based on effectMode
    let activeEff = selectedEffect;
    if (effectMode === 'auto') {
      const randomIndex = Math.floor(Math.random() * effectPresets.length);
      activeEff = effectPresets[randomIndex].id;
    } else if (effectMode === 'favorite' && favoriteEffects.length > 0) {
      const randomIndex = Math.floor(Math.random() * favoriteEffects.length);
      activeEff = favoriteEffects[randomIndex];
    }

    setCurrentActiveEffect(activeEff);
    setIsSpinning(true);

    // Pick winner after 3 seconds of animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      const winner = availableStudents[randomIndex];

      setWinnerStudent(winner);
      setIsSpinning(false);
      setShowWinnerModal(true);

      if (!isMuted) soundFx.playWinner();
      confetti({ particleCount: 70, spread: 100, origin: { y: 0.5 } });

      // Record to history
      setHistoryLogs(prev => [
        { id: Date.now(), student: winner, time: new Date().toLocaleTimeString('vi-VN') },
        ...prev
      ]);

      // Handle exclude winner toggle
      if (excludeWinner) {
        setAvailableStudents(prev => prev.filter(s => s.id !== winner.id));
      }
    }, 3200);
  };

  // Toggle favorite effect item
  const handleToggleFavorite = (effId) => {
    soundFx.playClick();
    if (favoriteEffects.includes(effId)) {
      setFavoriteEffects(favoriteEffects.filter(id => id !== effId));
    } else {
      setFavoriteEffects([...favoriteEffects, effId]);
    }
  };

  // Reset cage list
  const handleResetCage = () => {
    soundFx.playCorrect();
    setAvailableStudents(students);
    initBallPositions(students);
    setHistoryLogs([]);
  };

  const activeEffectObj = effectPresets.find(e => e.id === currentActiveEffect) || effectPresets[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
      
      {/* HEADER BANNER (Screenshot 3) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-purple-glow">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Vòng Quay May Mắn (Lồng Cầu 3D)
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Quay số ngẫu nhiên gọi tên học sinh trả lời hoặc nhận quà tuyên dương...
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-black flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Đang dùng: {activeEffectObj.name}</span>
          </span>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsMuted(!isMuted);
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              isMuted ? 'bg-coral-50 text-coral-600 border-coral-200' : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
            title={isMuted ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetCage}
            className="px-4 py-2.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-extrabold text-xs rounded-xl border border-slate-200 flex items-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Nạp Lại ({students.length} HS)</span>
          </button>
        </div>

      </div>

      {/* MAIN 2-COLUMN LAYOUT (Matching Screenshots 1, 2, 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (7 Cols): 3D LOTTERY CAGE GLOBE & SPIN BUTTON */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6 flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[560px]">
          
          {/* Top Status Pill Bar (Screenshot 3) */}
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-black text-purple-900 bg-purple-50 border border-purple-200 px-3.5 py-1 rounded-full flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Trong lồng: {availableStudents.length} học sinh</span>
            </span>

            <span className="text-xs font-black text-slate-500 bg-slate-100 px-3.5 py-1 rounded-full flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isSpinning ? '🔥 Đang quay lồng cầu...' : 'Sẵn sàng'}</span>
            </span>
          </div>

          {/* 3D LOTTERY CAGE CANVAS / GLOBE DISPLAY (Screenshots 1, 2, 3) */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
            
            {/* Outer Globe Glass Ring */}
            <div className={`absolute inset-0 rounded-full border-8 border-purple-400/80 bg-gradient-to-b from-purple-100/50 via-white/80 to-purple-50/50 shadow-2xl backdrop-blur-sm flex items-center justify-center ${
              isSpinning ? 'animate-spin border-purple-600 ring-8 ring-purple-300/60' : ''
            }`}>
              
              {/* Internal Spoke Pins */}
              <div className="absolute inset-4 rounded-full border-2 border-purple-200 border-dashed opacity-40"></div>
              <div className="w-12 h-12 bg-purple-600 rounded-full border-4 border-white shadow-md z-20 flex items-center justify-center text-white text-xs font-black">
                ★
              </div>

              {/* Floating Spheres inside Cage */}
              {ballPositions.slice(0, 16).map((ball) => {
                const isSelectedWinner = winnerStudent?.id === ball.id && !isSpinning;
                return (
                  <div
                    key={ball.id}
                    className={`absolute w-11 h-11 rounded-full p-0.5 shadow-md border-2 transition-transform duration-75 flex items-center justify-center bg-white ${
                      isSelectedWinner
                        ? 'scale-125 border-amber-400 ring-4 ring-amber-300 z-30'
                        : 'border-purple-300 z-10'
                    }`}
                    style={{
                      transform: `translate(${ball.x}px, ${ball.y}px)`
                    }}
                  >
                    <img
                      src={ball.student.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${ball.id}`}
                      alt={ball.student.full_name}
                      className="w-full h-full object-cover rounded-full bg-purple-50"
                    />
                  </div>
                );
              })}

            </div>

            {/* Stand Pedestal (Screenshot 1 & 2 Base) */}
            <div className="absolute -bottom-8 w-44 h-8 bg-slate-300 rounded-b-3xl border-2 border-slate-400 shadow-md"></div>
          </div>

          {/* MAIN START SPIN ACTION BUTTON (Screenshots 1, 2, 3) */}
          <div className="w-full space-y-3 pt-4">
            <button
              onClick={handleStartSpin}
              disabled={isSpinning || availableStudents.length === 0}
              className={`w-full py-4 rounded-3xl font-black text-base tracking-wider uppercase transition-all shadow-2xl flex items-center justify-center space-x-2 transform active:scale-95 ${
                isSpinning
                  ? 'bg-purple-400 text-white cursor-not-allowed animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-glow hover:scale-[1.02]'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSpinning ? '✨ ĐANG QUAY LỒNG CẦU...' : '✨ QUAY NGAY'}</span>
            </button>

            {/* Bottom Exclude Toggle Switch (Screenshot 3) */}
            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200 flex items-center justify-between text-xs">
              <span className="font-extrabold text-purple-950 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Loại trừ sau khi trúng (Không lặp lại học sinh)</span>
              </span>

              <input
                type="checkbox"
                checked={excludeWinner}
                onChange={(e) => setExcludeWinner(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (5 Cols): EFFECT CONFIGURATOR & HISTORY LOGS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD 1: THIẾT LẬP HIỆU ỨNG LỒNG CẦU (Screenshots 1, 2, 3) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-800">Thiết Lập Hiệu Ứng Lồng Cầu</h3>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                7 hiệu ứng sẵn sàng
              </span>
            </div>

            {/* Mode Switcher Tabs (Screenshot 1, 2, 3: Tự động đổi | Chọn thủ công | Nhóm yêu thích) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setEffectMode('auto')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  effectMode === 'auto' ? 'bg-white text-purple-700 shadow-sm font-black' : 'text-slate-500'
                }`}
              >
                🪄 Tự động đổi
              </button>

              <button
                onClick={() => setEffectMode('manual')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  effectMode === 'manual' ? 'bg-white text-purple-700 shadow-sm font-black' : 'text-slate-500'
                }`}
              >
                ⚙️ Chọn thủ công
              </button>

              <button
                onClick={() => setEffectMode('favorite')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  effectMode === 'favorite' ? 'bg-white text-purple-700 shadow-sm font-black' : 'text-slate-500'
                }`}
              >
                ❤️ Nhóm yêu thích
              </button>
            </div>

            {/* Manual Selection Mode (Screenshot 1) */}
            {effectMode === 'manual' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700">Chọn hiệu ứng cố định cho lượt quay:</label>
                <div className="flex flex-wrap gap-2">
                  {effectPresets.map(eff => (
                    <button
                      key={eff.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedEffect(eff.id);
                        setCurrentActiveEffect(eff.id);
                      }}
                      className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
                        selectedEffect === eff.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-purple-glow'
                          : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {eff.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Selection Mode (Screenshot 2) */}
            {effectMode === 'favorite' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700">Chọn các hiệu ứng bạn yêu thích (Hệ thống sẽ random trong nhóm này):</label>
                <div className="grid grid-cols-2 gap-2">
                  {effectPresets.map(eff => {
                    const isFav = favoriteEffects.includes(eff.id);
                    return (
                      <div
                        key={eff.id}
                        onClick={() => handleToggleFavorite(eff.id)}
                        className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                          isFav ? 'bg-purple-100 border-purple-400 text-purple-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="truncate">{eff.name}</span>
                        {isFav && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Auto Change Mode Info (Screenshot 3) */}
            {effectMode === 'auto' && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs font-semibold text-purple-900 space-y-1">
                <p>Mỗi lượt quay sẽ tự chọn một hiệu ứng khác nhau ngẫu nhiên.</p>
                <p className="text-[11px] text-purple-700">Hệ thống tự động tránh lặp lại hiệu ứng của lượt quay vừa thực hiện.</p>
              </div>
            )}

          </div>

          {/* CARD 2: LỊCH SỬ QUAY (Screenshots 1, 2, 3) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-800">
                  Lịch Sử Quay ({historyLogs.length})
                </h3>
              </div>

              {historyLogs.length > 0 && (
                <button
                  onClick={() => setHistoryLogs([])}
                  className="text-[11px] font-bold text-coral-600 hover:underline"
                >
                  Xóa lịch sử
                </button>
              )}
            </div>

            {historyLogs.length === 0 ? (
              <div className="py-8 text-center text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                Chưa có lượt quay nào trong phiên làm việc. Hãy bấm quay ngay!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {historyLogs.map((log, idx) => (
                  <div
                    key={log.id}
                    className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <img
                        src={log.student.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${log.student.id}`}
                        alt={log.student.full_name}
                        className="w-8 h-8 rounded-xl object-cover border border-purple-200"
                      />
                      <span className="text-slate-800 font-extrabold">{log.student.full_name}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* WINNER REVEAL CELEBRATION MODAL */}
      {showWinnerModal && winnerStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border-4 border-amber-400 text-center space-y-6 animate-in zoom-in">
            
            <div className="relative inline-block">
              <div className="w-28 h-28 mx-auto rounded-3xl p-1 bg-gradient-to-tr from-amber-400 to-purple-600 shadow-2xl overflow-hidden">
                <img
                  src={winnerStudent.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerStudent.id}`}
                  alt={winnerStudent.full_name}
                  className="w-full h-full object-cover rounded-2xl bg-white"
                />
              </div>
              <span className="absolute -top-3 -right-3 bg-amber-500 text-purple-950 font-black text-xs px-3 py-1 rounded-full shadow-lg border-2 border-white">
                CHÚC MỪNG ★
              </span>
            </div>

            <div>
              <div className="text-xs font-black text-amber-600 uppercase tracking-widest">HỌC SINH MAY MẮN TRÚNG LƯỢT QUAY</div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{winnerStudent.full_name}</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">Tổ {winnerStudent.team_group || 1} • {currentClass?.name || '8A5'}</p>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setShowWinnerModal(false);
              }}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow uppercase tracking-wider"
            >
              TIẾP TỤC QUAY LƯỢT MỚI
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

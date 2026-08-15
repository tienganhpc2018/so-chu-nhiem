import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { MascotRobot } from '../components/MascotRobot';
import { PrintWinnerCardModal } from '../components/PrintWinnerCardModal';
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
  CheckCircle2,
  Gift,
  Printer,
  ShieldAlert
} from 'lucide-react';

export const LuckyWheelView = ({ currentClass, students = [], teacherProfile }) => {
  // Sound mute state
  const [isMuted, setIsMuted] = useState(false);

  // Mode switcher: 'auto' | 'manual' | 'favorite'
  const [effectMode, setEffectMode] = useState('manual');

  // Selected single effect for manual mode
  const [selectedEffect, setSelectedEffect] = useState('xoay_tron');

  // Favorite effects selection for favorite mode
  const [favoriteEffects, setFavoriteEffects] = useState(['xoay_tron', 'tung_nay', 'bay_quy_dao', 'san_khau']);

  // Feature 3: Quiet Students Priority Toggle
  const [quietPriority, setQuietPriority] = useState(false);

  // Feature 4: Vote Friendly / Hardworking Student Mode
  const [isVoteMode, setIsVoteMode] = useState(false);

  // Feature 5: Attached Reward Selection
  const [attachedReward, setAttachedReward] = useState('plus_5_stars');

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
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Animation Frame State
  const [ballPositions, setBallPositions] = useState([]);

  const effectPresets = [
    { id: 'xoay_tron', name: 'Xoáy tròn 💫', desc: 'Các quả cầu xoáy quanh tâm lồng' },
    { id: 'tung_nay', name: 'Tung nảy 🤹', desc: 'Bóng nảy va đập tự do tưng bừng' },
    { id: 'hut_vao_tam', name: 'Hút vào tâm 🌀', desc: 'Tất cả quả cầu xoáy dồn tụ vào tâm' },
    { id: 'bay_quy_dao', name: 'Bay theo quỹ đạo 🛸', desc: 'Bay đảo quanh lồng cầu theo vòng lặp' },
    { id: 'mua_bong', name: 'Mưa bóng 🌧️', desc: 'Quả cầu rơi tự do từ trên xuống' },
    { id: 'san_khau', name: 'Sân khấu ánh sáng 🎭', desc: 'Chiếu đèn ngẫu nhiên phát sáng' },
    { id: 'song_bong_benh', name: 'Sóng bồng bềnh 🌊', desc: 'Bóng dao động nhấp nhô bồng bềnh' }
  ];

  const rewardOptions = [
    { id: 'plus_5_stars', title: '+5 Xu Sao Thi Đua Nề Nếp', coins: 5 },
    { id: 'plus_10_stars', title: '+10 Xu Sao Thi Đua Xuất Sắc', coins: 10 },
    { id: 'free_homework', title: 'Thẻ Miễn Bài Tập 1 Lần', coins: 0 },
    { id: 'change_seat', title: 'Thẻ Đổi Vị Trí Chỗ Ngồi', coins: 0 }
  ];

  useEffect(() => {
    if (students && students.length > 0) {
      setAvailableStudents(students);
      initBallPositions(students);
    }
  }, [students]);

  const initBallPositions = (stList) => {
    const total = stList.length;
    const initial = stList.map((st, idx) => {
      const angle = (idx / total) * 2 * Math.PI;
      const radius = 65 + Math.random() * 25;
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

  // Feature 1: Play Suspense Lottery Audio Spin
  const handleStartSpin = () => {
    if (availableStudents.length === 0) {
      alert('Không còn học sinh nào trong lồng cầu! Thầy bấm "Làm mới lượt quay" để nạp lại nhé.');
      return;
    }

    if (!isMuted) {
      soundFx.playClick();
      soundFx.playSuspenseSpin(); // Feature 1: Accelerating suspense sound
    }

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

    // Pick winner after 3.2 seconds
    setTimeout(() => {
      let winner;

      // Feature 3: Quiet Students Priority (Pick from lowest stars)
      if (quietPriority) {
        const sortedByQuiet = [...availableStudents].sort((a, b) => (a.total_stars || 0) - (b.total_stars || 0));
        const quietCandidates = sortedByQuiet.slice(0, Math.max(3, Math.floor(availableStudents.length / 2)));
        winner = quietCandidates[Math.floor(Math.random() * quietCandidates.length)];
      } else {
        const randomIndex = Math.floor(Math.random() * availableStudents.length);
        winner = availableStudents[randomIndex];
      }

      // Feature 4: Apply Attached Reward
      const rewardObj = rewardOptions.find(r => r.id === attachedReward) || rewardOptions[0];
      if (rewardObj.coins > 0) {
        winner.total_stars = (winner.total_stars || 0) + rewardObj.coins;
      }

      setWinnerStudent(winner);
      setIsSpinning(false);
      setShowWinnerModal(false); // Display inline inside yellow box on page (No popup modal)

      if (!isMuted) soundFx.playWinner();
      confetti({ particleCount: 75, spread: 100, origin: { y: 0.5 } });

      setHistoryLogs(prev => [
        { id: Date.now(), student: winner, reward: rewardObj.title, time: new Date().toLocaleTimeString('vi-VN') },
        ...prev
      ]);

      if (excludeWinner) {
        setAvailableStudents(prev => prev.filter(s => s.id !== winner.id));
      }
    }, 3200);
  };

  const handleToggleFavorite = (effId) => {
    soundFx.playClick();
    if (favoriteEffects.includes(effId)) {
      setFavoriteEffects(favoriteEffects.filter(id => id !== effId));
    } else {
      setFavoriteEffects([...favoriteEffects, effId]);
    }
  };

  const handleResetCage = () => {
    soundFx.playCorrect();
    setAvailableStudents(students);
    initBallPositions(students);
    setHistoryLogs([]);
  };

  const activeEffectObj = effectPresets.find(e => e.id === currentActiveEffect) || effectPresets[0];
  const selectedRewardObj = rewardOptions.find(r => r.id === attachedReward) || rewardOptions[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
      
      {/* HEADER BANNER */}
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
          
          {/* Feature 4: Vote Friendly / Hardworking Student Mode Button */}
          <button
            onClick={() => {
              soundFx.playCorrect();
              setIsVoteMode(!isVoteMode);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center space-x-1.5 border shadow-sm ${
              isVoteMode
                ? 'bg-amber-400 text-purple-950 border-amber-500 shadow-amber-glow animate-bounce'
                : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-500" />
            <span>⭐ Bầu Chọn Học Sinh Chăm Chỉ / Thân Thiện</span>
          </button>

          <span className="px-3.5 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-black flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Hiệu ứng: {activeEffectObj.name}</span>
          </span>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsMuted(!isMuted);
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              isMuted ? 'bg-coral-50 text-coral-600 border-coral-200' : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
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

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 3D CAGE GLOBE & SPIN BUTTON */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6 flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[560px]">
          
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

          {/* COMPUTER MONITOR WHEEL FRAME WITH PINWHEEL & COMPUTER MOUSE (Screenshot 3) */}
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto flex flex-col items-center justify-center pt-2">
            
            {/* Outer Circle Wheel Frame */}
            <div className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-indigo-500 bg-gradient-to-b from-purple-100/60 via-white/90 to-indigo-50/60 shadow-2xl backdrop-blur-sm flex items-center justify-center overflow-hidden ${
              isSpinning ? 'ring-8 ring-indigo-300' : ''
            }`}>
              
              {/* Outer Dashed Ring */}
              <div className="absolute inset-4 rounded-full border-2 border-indigo-200 border-dashed opacity-50"></div>

              {/* PINWHEEL PROPELLER SPINNER IN CENTER (Chong chóng chính giữa - Screenshot 3) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className={`w-40 h-40 relative transition-transform duration-300 ${isSpinning ? 'animate-spin' : ''}`}>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-18 bg-purple-400/50 rounded-t-full origin-bottom rotate-0"></div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-18 bg-purple-400/50 rounded-t-full origin-bottom rotate-90"></div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-18 bg-purple-400/50 rounded-t-full origin-bottom rotate-180"></div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-18 bg-purple-400/50 rounded-t-full origin-bottom rotate-270"></div>
                  <div className="absolute inset-0 m-auto w-8 h-8 bg-indigo-600 rounded-full border-4 border-white shadow-md z-30 flex items-center justify-center text-white text-xs font-black">
                    ✦
                  </div>
                </div>
              </div>

              {/* STUDENT AVATARS FLOATING ON WHEEL RING */}
              {ballPositions.slice(0, 16).map((ball) => {
                const isSelectedWinner = winnerStudent?.id === ball.id && !isSpinning;
                return (
                  <div
                    key={ball.id}
                    className={`absolute w-12 h-12 rounded-full p-0.5 shadow-md border-2 transition-transform duration-75 flex items-center justify-center bg-white ${
                      isSelectedWinner
                        ? 'scale-125 border-amber-400 ring-4 ring-amber-300 z-30'
                        : 'border-indigo-300 z-10'
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

            {/* COMPUTER MONITOR STAND BASE & COMPUTER MOUSE (Màn hình máy tính & Con chuột - Screenshot 3) */}
            <div className="relative flex flex-col items-center mt-1">
              <div className="w-10 h-6 bg-slate-700 rounded-sm"></div>
              <div className="w-56 h-8 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-t-xl border-t-2 border-slate-300 shadow-md"></div>
              
              {/* Wire & Computer Mouse */}
              <div className="absolute right-[-45px] bottom-1 flex items-center">
                <svg className="w-14 h-6 text-slate-400" viewBox="0 0 60 30" fill="none">
                  <path d="M0 15 Q25 28 40 15" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                <div className="w-7 h-11 bg-white border-2 border-slate-300 rounded-t-2xl rounded-b-xl shadow-md p-1 flex flex-col items-center justify-start">
                  <div className="w-1 h-3 bg-indigo-500 rounded-full mt-0.5"></div>
                </div>
              </div>
            </div>

          </div>

          {/* INLINE RESULT DISPLAY BOX ON THE PAGE (Thầy yêu cầu hiển thị trực tiếp vào khung này, không dùng popup) */}
          <div className="w-full bg-gradient-to-r from-amber-50 via-white to-purple-50 rounded-3xl p-5 border-2 border-amber-300/80 shadow-md space-y-3">
            <div className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center justify-center space-x-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>🏆 KẾT QUẢ VÒNG QUAY 🏆</span>
            </div>

            {winnerStudent ? (
              <div className="space-y-3 animate-in zoom-in">
                
                {/* Student Avatar & Name */}
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src={winnerStudent.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerStudent.id}`}
                    alt={winnerStudent.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md bg-white"
                  />
                  <div className="text-left">
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {winnerStudent.full_name}
                    </h3>
                    <span className="text-[11px] font-bold text-amber-700">
                      Tổ {winnerStudent.team_group || 1} • {currentClass?.name || '8A5'}
                    </span>
                  </div>
                </div>

                {/* Quick Reward Xu Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {[1, 2, 5, 10].map(cnt => (
                    <button
                      key={`inline-c-${cnt}`}
                      onClick={() => {
                        soundFx.playCorrect();
                        confetti({ particleCount: 30, spread: 60 });
                        winnerStudent.total_stars = (winnerStudent.total_stars || 0) + cnt;
                        alert(`Đã cộng +${cnt} xu cho học sinh ${winnerStudent.full_name}!`);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
                    >
                      <Coins className="w-3.5 h-3.5 fill-amber-400" />
                      <span>+{cnt} xu</span>
                    </button>
                  ))}

                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In thẻ A5</span>
                  </button>

                  <button
                    onClick={() => setWinnerStudent(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

              </div>
            ) : (
              <h3 className="text-2xl font-black text-slate-900 py-1">
                ???
              </h3>
            )}
          </div>

          {/* MAIN START SPIN BUTTON (Screenshot 2 & 3) */}
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
              <span>{isSpinning ? '✨ ĐANG QUAY VÒNG QUAY...' : '► 🎡 Bấm Quay Vòng Quay!'}</span>
            </button>

            {/* TOGGLE OPTIONS (Screenshot 2) */}
            <div className="flex items-center justify-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="autoExCheck"
                checked={excludeWinner}
                onChange={(e) => setExcludeWinner(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="autoExCheck" className="text-xs font-black text-slate-700 cursor-pointer">
                Tự động loại học sinh sau khi chọn
              </label>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: EFFECT CONFIGURATOR & HISTORY LOGS */}
        <div className="lg:col-span-5 space-y-6">
          
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

            {effectMode === 'auto' && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs font-semibold text-purple-900 space-y-1">
                <p>Mỗi lượt quay sẽ tự chọn một hiệu ứng khác nhau ngẫu nhiên.</p>
                <p className="text-[11px] text-purple-700">Hệ thống tự động tránh lặp lại hiệu ứng của lượt quay vừa thực hiện.</p>
              </div>
            )}

          </div>

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
                      <div>
                        <span className="text-slate-800 font-extrabold block">{log.student.full_name}</span>
                        <span className="text-[9px] text-amber-700 font-extrabold">{log.reward}</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* FEATURE 2: PRINT WINNER CERTIFICATE MODAL */}
      <PrintWinnerCardModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        winnerStudent={winnerStudent}
        rewardTitle={selectedRewardObj?.title || 'Phần thưởng thi đua'}
        currentClass={currentClass}
        teacherProfile={teacherProfile}
      />

    </div>
  );
};

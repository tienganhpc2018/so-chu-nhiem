import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { X, Play, RotateCcw, Trophy, Sparkles, Check, Volume2, ListOrdered } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const BeeRaceModal = ({
  isOpen,
  onClose,
  students = [],
  onRewardTop3
}) => {
  const [screen, setScreen] = useState('setup'); // 'setup' | 'race'
  const [duckCount, setDuckCount] = useState(35);
  const [duration, setDuration] = useState(12); // in seconds
  const [timeLeft, setTimeLeft] = useState(12);
  const [raceState, setRaceState] = useState('ready'); // 'ready' | 'running' | 'finished'
  const [rankedDucks, setRankedDucks] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [excludeWinnerNext, setExcludeWinnerNext] = useState(true);
  const [excludedIds, setExcludedIds] = useState([]);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const ducksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Hat accessories styles for ducks
  const DUCK_ACCESSORIES = ['cap', 'beanie', 'sunglasses', 'headband', 'crown', 'none'];
  const DUCK_COLORS = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  // Available students pool (optionally excluding previous winners)
  const activeStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    const filtered = list.filter(s => s && s.id && !excludedIds.includes(s.id));
    return filtered.length > 0 ? filtered : list;
  }, [students, excludedIds]);

  // Cleanup upon closing
  useEffect(() => {
    if (!isOpen) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      soundFx.stopRaceAudio();
      setScreen('setup');
      setRaceState('ready');
      setShowLeaderboard(false);
    }
  }, [isOpen]);

  // Vẽ chú vịt trên Canvas (chuẩn tương thích mọi trình duyệt)
  const drawDuck = (ctx, d, isWinnerSolo = false) => {
    ctx.save();
    ctx.translate(d.x, d.y);

    const scale = isWinnerSolo ? 1.6 : 0.95;
    ctx.scale(scale, scale);

    // Water ripple under duck
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(0, 10, 16, 5, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 10, 8, 0, Math.PI * 2);
    }
    ctx.fill();

    // Duck body
    ctx.fillStyle = d.color || '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Duck tail feathers
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-18, -6);
    ctx.lineTo(-12, 5);
    ctx.closePath();
    ctx.fill();

    // Duck head
    ctx.beginPath();
    ctx.arc(10, -5, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Orange Beak
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(17, -5);
    ctx.lineTo(26, -3);
    ctx.lineTo(17, -1);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(12, -7, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(12.5, -7.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Cute Hat / Accessory
    if (d.accessory === 'beanie') {
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(9, -12, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(9, -14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (d.accessory === 'sunglasses') {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(8, -8, 10, 4);
    } else if (d.accessory === 'crown' || isWinnerSolo) {
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(5, -12);
      ctx.lineTo(7, -19);
      ctx.lineTo(10, -14);
      ctx.lineTo(13, -19);
      ctx.lineTo(15, -12);
      ctx.closePath();
      ctx.fill();
    }

    // Number Badge on Duck Body (túi đeo số ở hình 4 & 5)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-8, -4, 14, 11, 3);
    } else {
      ctx.rect(-8, -4, 14, 11);
    }
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(d.id), -1, 1.5);

    // Student Name Tag above duck
    ctx.fillStyle = isWinnerSolo ? '#FEF08A' : '#FFFFFF';
    ctx.font = isWinnerSolo ? 'bold 12px sans-serif' : 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    const shortName = d.name.length > 12 ? d.name.substring(0, 11) + '..' : d.name;
    ctx.fillText(shortName, 0, -18);

    ctx.restore();
  };

  // Vòng lặp render chính (Canvas loop) - Đặt TRƯỚC mọi return để tuân thủ tuyệt đối Rules of Hooks
  useEffect(() => {
    if (!isOpen || screen !== 'race') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const totalDucks = ducksRef.current.length;

    const startTop = 70;
    const startBottom = height - 40;
    const availableHeight = startBottom - startTop;

    ducksRef.current.forEach((d, idx) => {
      d.laneY = startTop + (idx / Math.max(1, totalDucks - 1)) * availableHeight;
      if (raceState === 'ready') {
        const slantOffset = (idx / totalDucks) * 50;
        d.x = 90 + slantOffset + (idx % 2 === 0 ? -10 : 8);
        d.y = d.laneY;
      }
    });

    const render = () => {
      // 1. Vẽ bờ cỏ và sông nước (Hình 4 & 5)
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 0, width, 45);

      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, 45, width, 12);

      const waterGrad = ctx.createLinearGradient(0, 57, 0, height);
      waterGrad.addColorStop(0, '#0284c7');
      waterGrad.addColorStop(0.5, '#0369a1');
      waterGrad.addColorStop(1, '#075985');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 57, width, height - 57);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      const waveOffset = (Date.now() / 25) % 40;
      for (let y = 75; y < height; y += 32) {
        ctx.beginPath();
        for (let x = -40; x < width + 40; x += 36) {
          ctx.arc(x + waveOffset, y, 9, 0, Math.PI);
        }
        ctx.stroke();
      }

      // 2. Trạng thái READY - Vẽ vạch kẻ caro nghiêng và toàn bộ vịt xếp hàng xuất phát (Hình 4)
      if (raceState === 'ready') {
        ctx.save();
        const startLineX1 = 155;
        const startLineX2 = 225;
        const startLineY1 = 57;
        const startLineY2 = height;

        ctx.beginPath();
        ctx.moveTo(startLineX1, startLineY1);
        ctx.lineTo(startLineX2, startLineY2);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 26;
        ctx.stroke();

        const numSquares = 22;
        for (let s = 0; s < numSquares; s++) {
          const ratio = s / numSquares;
          const sx = startLineX1 + ratio * (startLineX2 - startLineX1);
          const sy = startLineY1 + ratio * (startLineY2 - startLineY1);

          ctx.fillStyle = s % 2 === 0 ? '#FFFFFF' : '#0F172A';
          ctx.fillRect(sx - 12, sy - 8, 12, 16);
          ctx.fillStyle = s % 2 === 0 ? '#0F172A' : '#FFFFFF';
          ctx.fillRect(sx, sy - 8, 12, 16);
        }
        ctx.restore();

        ducksRef.current.forEach((d) => {
          drawDuck(ctx, d, false);
        });
      }

      // 3. Trạng thái RUNNING - Các chú vịt bơi đua
      else if (raceState === 'running') {
        const finishX = width - 70;

        for (let y = 57; y < height; y += 18) {
          ctx.fillStyle = (y / 18) % 2 === 0 ? '#FFFFFF' : '#0F172A';
          ctx.fillRect(finishX, y, 16, 18);
        }

        ducksRef.current.forEach((d) => {
          drawDuck(ctx, d, false);
        });
      }

      // 4. Trạng thái FINISHED - Chỉ hiển thị duy nhất 1 người về đích ở giữa sông (Hình 5)
      else if (raceState === 'finished') {
        const winner = ducksRef.current[0];
        if (winner) {
          const centerDuck = {
            ...winner,
            x: width / 2,
            y: height / 2 + Math.sin(Date.now() / 300) * 6,
            accessory: 'crown'
          };
          drawDuck(ctx, centerDuck, true);

          ctx.fillStyle = '#FEF08A';
          ctx.font = 'black 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🏆 QUÁN QUÂN: ${winner.name.toUpperCase()} (#${winner.id})`, width / 2, height / 2 + 55);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, screen, raceState]);

  // SCREEN 1: Setup ducks lineup
  const handleConfirmSetup = () => {
    soundFx.playClick();
    setTimeLeft(duration);
    setShowLeaderboard(false);

    const pool = activeStudents.length > 0 ? activeStudents : (Array.isArray(students) ? students : []);
    const count = Math.min(duckCount, Math.max(pool.length, 10));
    const newDucks = [];

    for (let i = 0; i < count; i++) {
      const student = (pool.length > 0 && pool[i % pool.length]) || { full_name: `Vịt #${i + 1}`, id: `duck-${i + 1}` };
      newDucks.push({
        id: i + 1,
        student,
        name: student.full_name || `Vịt #${i + 1}`,
        color: DUCK_COLORS[i % DUCK_COLORS.length],
        accessory: DUCK_ACCESSORIES[i % DUCK_ACCESSORIES.length],
        startX: 110 - (i % 2) * 12,
        x: 0,
        y: 0,
        laneY: 0,
        speed: 0,
        baseSpeed: (Math.random() * 0.45 + 0.85),
        boostTimer: Math.random() * 2,
        wiggleOffset: Math.random() * Math.PI * 2,
        finished: false,
        finishRank: null
      });
    }

    ducksRef.current = newDucks;
    setScreen('race');
    setRaceState('ready');
  };

  // Bắt đầu cuộc đua
  const handleStartRace = () => {
    soundFx.playClick();
    setRaceState('running');
    setTimeLeft(duration);
    setShowLeaderboard(false);

    // Bật nhạc nền đua vui nhộn
    soundFx.startRaceAudio();

    const startTime = Date.now();
    const durationMs = duration * 1000;
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 940;
    const finishX = width - 70;

    // Đếm ngược thời gian
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Di chuyển vịt
    let raceInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      ducksRef.current.forEach((d) => {
        if (progress < 1) {
          d.boostTimer -= 0.05;
          if (d.boostTimer <= 0) {
            d.speed = (Math.random() * 2.8 + 1.4) * d.baseSpeed;
            d.boostTimer = Math.random() * 1.6 + 0.4;
          }
          d.x += d.speed * (width / 500);
          d.y = d.laneY + Math.sin(Date.now() / 150 + d.wiggleOffset) * 4;

          if (d.x > finishX - 15 && progress < 0.96) {
            d.x = finishX - 18 - Math.random() * 20;
          }
        } else {
          d.x = finishX + 40 + d.baseSpeed * 30;
        }
      });

      if (progress >= 1) {
        clearInterval(raceInterval);
        soundFx.stopRaceAudio();

        const sorted = [...ducksRef.current].sort((a, b) => b.x - a.x);
        sorted.forEach((d, idx) => {
          d.finishRank = idx + 1;
        });

        ducksRef.current = sorted;
        setRankedDucks(sorted);
        setRaceState('finished');

        soundFx.playWinner();
        soundFx.playFanfare();

        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899']
        });

        if (excludeWinnerNext && sorted[0]?.student?.id) {
          setExcludedIds(prev => [...prev, sorted[0].student.id]);
        }
      }
    }, 40);
  };

  const handleRaceAgain = () => {
    soundFx.playClick();
    handleConfirmSetup();
  };

  // NẾU MODAL CHƯA MỞ THÌ RETURN NULL SAU KHI ĐÃ GỌI TẤT CẢ HOOKS HỢP LỆ
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border-4 border-amber-400 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-white flex flex-col justify-between min-h-[620px] overflow-hidden">
        
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between pb-2.5 border-b border-amber-500/30">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐥</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-400 tracking-wider">
                BEE RACE — ĐƯỜNG ĐUA VỊT HỌC SINH 4.0
              </h3>
              <p className="text-[11px] text-amber-200/80 font-bold">
                Mô phỏng đường đua nước, âm thanh sôi động và bảng xếp hạng thứ tự về đích
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

        {/* SCREEN 1: Setup Sliders */}
        {screen === 'setup' && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full space-y-7 py-4">
            
            {/* Sĩ số học sinh tham gia */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <span>Số lượng vịt đua đại diện:</span>
                <span className="text-sm font-black text-white">{duckCount} chú vịt (Sĩ số lớp: {(students || []).length} HS)</span>
              </div>

              <div className="relative pt-6">
                <div
                  className="absolute -top-1 px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-full shadow-md -translate-x-1/2 pointer-events-none"
                  style={{ left: `${((duckCount - 1) / 99) * 100}%` }}
                >
                  {duckCount} 🐥
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-emerald-500" />
                </div>

                <input
                  type="range"
                  min={1}
                  max={Math.max(50, (students || []).length || 35)}
                  value={duckCount}
                  onChange={(e) => setDuckCount(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Duration Selector Pills */}
            <div className="w-full space-y-2">
              <label className="text-xs font-bold text-amber-200 block">Thời Gian Cuộc Đua:</label>
              <div className="grid grid-cols-4 gap-3">
                {[8, 12, 15, 20].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      soundFx.playClick();
                      setDuration(t);
                    }}
                    className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${
                      duration === t
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/40 scale-105'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {t} Giây
                  </button>
                ))}
              </div>
            </div>

            {/* Option to exclude previous winners */}
            <div className="w-full flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs">
              <span className="font-bold text-slate-300">Tự động loại người thắng ở vòng sau:</span>
              <button
                type="button"
                onClick={() => setExcludeWinnerNext(!excludeWinnerNext)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                  excludeWinnerNext ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-700 border-slate-600'
                }`}
              >
                {excludeWinnerNext && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            </div>

            {/* SET Button */}
            <button
              onClick={handleConfirmSetup}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>XÁC NHẬN CÀI ĐẶT & VÀO VẠCH XUẤT PHÁT</span>
              <Play className="w-5 h-5 fill-slate-950" />
            </button>
          </div>
        )}

        {/* SCREEN 2: Water Race Track Canvas */}
        {screen === 'race' && (
          <div className="flex-1 flex flex-col justify-between py-1 space-y-2 relative">
            
            {/* Top Control Bar with Big Timer */}
            <div className="flex items-center justify-between bg-slate-800/90 px-4 py-2 rounded-2xl border border-slate-700 shadow-md">
              
              <div className="flex items-center space-x-2">
                {raceState === 'finished' && (
                  <button
                    onClick={handleRaceAgain}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đua Lại (Race Again)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    soundFx.stopRaceAudio();
                    setScreen('setup');
                  }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-300 rounded-xl"
                >
                  Cài Đặt Lại
                </button>
              </div>

              {/* Big Center Digital Timer (Hình 4 & 5) */}
              <div className="bg-slate-950 px-6 py-1 rounded-2xl border-2 border-slate-700 shadow-inner">
                <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 tracking-wider">
                  00:00:{String(timeLeft).padStart(2, '0')}
                </span>
              </div>

              {/* Right Action: Xuất phát */}
              <div className="flex items-center space-x-2">
                {raceState === 'ready' && (
                  <button
                    onClick={handleStartRace}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>XUẤT PHÁT!</span>
                  </button>
                )}

                {raceState === 'running' && (
                  <span className="flex items-center space-x-1 text-xs font-black text-amber-400 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-400/40 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5 animate-spin" />
                    <span>ĐANG ĐUA SÔI ĐỘNG...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Canvas River Track */}
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-sky-400 shadow-2xl bg-sky-800">
              <canvas
                ref={canvasRef}
                width={940}
                height={400}
                className="w-full h-[370px] sm:h-[400px] block"
              />

              {/* Floating Bottom-Right Trophy 🏆 Button (Hình 5) */}
              {raceState === 'finished' && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setShowLeaderboard(true);
                  }}
                  title="Xem thứ tự về đích của các em học sinh"
                  className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-slate-950 border-3 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30 group"
                >
                  <Trophy className="w-7 h-7 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="absolute -top-2 -left-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                    Top
                  </span>
                </button>
              )}
            </div>

            {/* FINISH BANNER ON BOTTOM */}
            {raceState === 'finished' && rankedDucks.length > 0 && (
              <div className="flex items-center justify-between bg-slate-800/95 border-2 border-amber-400 px-4 py-2.5 rounded-2xl shadow-xl animate-in zoom-in-95">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🥇</span>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                      Chúc mừng quán quân cuộc đua:
                    </span>
                    <span className="text-sm font-black text-white">
                      {rankedDucks[0]?.name} (Vịt #{rankedDucks[0]?.id})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
                  >
                    <ListOrdered className="w-4 h-4 text-slate-950" />
                    <span>XEM THỨ TỰ VỀ ĐÍCH 🏆</span>
                  </button>
                </div>
              </div>
            )}

            {/* MODAL BẢNG THỨ TỰ VỀ ĐÍCH (KHI BẤM ICON CÚP 🏆) */}
            {showLeaderboard && (
              <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between animate-in zoom-in-95 border-2 border-amber-400">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <h4 className="font-black text-base text-amber-300">
                      BẢNG XẾP HẠNG THỨ TỰ VỀ ĐÍCH CUỘC ĐUA
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Top 3 Podium Highlights */}
                <div className="grid grid-cols-3 gap-3 my-2">
                  <div className="p-3 bg-amber-500/20 border-2 border-amber-400 rounded-2xl text-center">
                    <span className="text-xl">🥇 Quán Quân</span>
                    <span className="block font-black text-sm text-amber-300 mt-1 truncate">
                      {rankedDucks[0]?.name}
                    </span>
                    <span className="text-xs text-amber-200 font-bold block">Vịt #{rankedDucks[0]?.id} • +5 Sao ⭐</span>
                  </div>

                  <div className="p-3 bg-slate-400/20 border-2 border-slate-300 rounded-2xl text-center">
                    <span className="text-xl">🥈 Á Quân</span>
                    <span className="block font-black text-sm text-slate-200 mt-1 truncate">
                      {rankedDucks[1]?.name || 'N/A'}
                    </span>
                    <span className="text-xs text-slate-300 font-bold block">Vịt #{rankedDucks[1]?.id} • +3 Sao ⭐</span>
                  </div>

                  <div className="p-3 bg-amber-700/20 border-2 border-amber-600 rounded-2xl text-center">
                    <span className="text-xl">🥉 Quý Quân</span>
                    <span className="block font-black text-sm text-amber-400 mt-1 truncate">
                      {rankedDucks[2]?.name || 'N/A'}
                    </span>
                    <span className="text-xs text-amber-300 font-bold block">Vịt #{rankedDucks[2]?.id} • +2 Sao ⭐</span>
                  </div>
                </div>

                {/* Full Ranking Scroll List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-48 custom-scrollbar my-1">
                  {rankedDucks.map((d, index) => (
                    <div
                      key={d.id}
                      className={`p-2 rounded-xl flex items-center justify-between text-xs ${
                        index === 0
                          ? 'bg-amber-400/20 text-amber-300 font-black border border-amber-400/50'
                          : index === 1
                          ? 'bg-slate-300/20 text-slate-200 font-bold border border-slate-400/30'
                          : index === 2
                          ? 'bg-amber-700/20 text-amber-300 font-bold border border-amber-600/30'
                          : 'bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-6 font-mono font-black text-center">
                          #{index + 1}
                        </span>
                        <span>{d.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          (Vịt số {d.id})
                        </span>
                      </div>
                      <span className="text-[11px] font-bold">
                        {index === 0 ? '+5 Sao' : index === 1 ? '+3 Sao' : index === 2 ? '+2 Sao' : 'Hoàn thành'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Reward Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">
                    Tổng cộng: {rankedDucks.length} học sinh tham gia
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        soundFx.playWinner();
                        onRewardTop3?.(rankedDucks.slice(0, 3));
                        setShowLeaderboard(false);
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>CỘNG ĐIỂM CHO TOP 3</span>
                    </button>
                    <button
                      onClick={() => setShowLeaderboard(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                    >
                      Đóng Bảng
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};



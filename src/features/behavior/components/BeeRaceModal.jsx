import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X, Play, RotateCcw, Trophy, Award, Sparkles } from 'lucide-react';
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
  const [topDucks, setTopDucks] = useState([]);

  // Canvas ref
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const ducksRef = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setScreen('setup');
      setRaceState('ready');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Screen 1: Settings
  const handleConfirmSetup = () => {
    soundFx.playClick();
    setTimeLeft(duration);

    // Initialize ducks
    const numDucks = Math.min(duckCount, Math.max(students.length, 12));
    const newDucks = [];

    for (let i = 0; i < numDucks; i++) {
      const student = students[i % students.length] || { full_name: `Vịt #${i + 1}`, id: `duck-${i}` };
      newDucks.push({
        id: i + 1,
        student,
        name: student.full_name,
        x: 30, // Start x
        y: 0,  // Will be set based on canvas height
        speed: 0,
        baseSpeed: (Math.random() * 0.4 + 0.8),
        boostTimer: Math.random() * 2,
        color: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'][i % 6]
      });
    }

    ducksRef.current = newDucks;
    setScreen('race');
    setRaceState('ready');
  };

  // Start the Race
  const handleStartRace = () => {
    soundFx.playClick();
    setRaceState('running');
    setTimeLeft(duration);

    const startTime = Date.now();
    const finishDistance = 820; // x coordinate for finish line

    const tickInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tickInterval);
          return 0;
        }
        soundFx.playTick();
        return prev - 1;
      });
    }, 1000);

    const updateLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const laneHeight = height / (ducksRef.current.length || 1);

      // Clear Canvas & draw water track
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, width, height);

      // Water waves
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      for (let y = 15; y < height; y += 25) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 30) {
          ctx.arc(x + ((Date.now() / 20) % 30), y, 8, 0, Math.PI);
        }
        ctx.stroke();
      }

      // Checkered Finish Line at x = finishDistance
      const finishX = width - 80;
      for (let y = 0; y < height; y += 16) {
        ctx.fillStyle = (y / 16) % 2 === 0 ? '#FFFFFF' : '#000000';
        ctx.fillRect(finishX, y, 14, 16);
      }

      // Update and draw ducks
      const elapsed = (Date.now() - startTime) / 1000;
      const progressRatio = Math.min(elapsed / duration, 1);

      ducksRef.current.forEach((d, idx) => {
        d.y = idx * laneHeight + laneHeight / 2;

        if (progressRatio < 1) {
          // Random acceleration bursts
          d.boostTimer -= 0.016;
          if (d.boostTimer <= 0) {
            d.speed = (Math.random() * 2.2 + 1.2) * d.baseSpeed;
            d.boostTimer = Math.random() * 1.5 + 0.5;
            if (Math.random() < 0.1) soundFx.playQuack();
          }
          d.x += d.speed * (width / 450);
          // Keep before finish until end
          if (d.x > finishX - 10 && progressRatio < 0.95) {
            d.x = finishX - 12 - Math.random() * 15;
          }
        } else {
          // Cross finish line
          d.x = Math.max(d.x, finishX + 10 + (d.baseSpeed * 20));
        }

        // Draw duck
        ctx.save();
        ctx.translate(d.x, d.y);

        // Duck body
        ctx.fillStyle = d.color || '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Duck head & beak
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(10, -4, 8, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.moveTo(16, -4);
        ctx.lineTo(24, -2);
        ctx.lineTo(16, 0);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(12, -6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Duck name tag
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(d.name.substring(0, 8), -15, -15);

        ctx.restore();
      });

      // Check if finished
      if (progressRatio >= 1) {
        setRaceState('finished');
        clearInterval(tickInterval);

        // Sort Top 3 ducks by x coordinate
        const sorted = [...ducksRef.current].sort((a, b) => b.x - a.x).slice(0, 3);
        setTopDucks(sorted);

        soundFx.playFanfare();
        confetti({
          particleCount: 140,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#FBBF24', '#3B82F6', '#10B981']
        });
        return;
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border-4 border-amber-400 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-white flex flex-col justify-between min-h-[600px] overflow-hidden">
        
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐥</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-400 tracking-wider">
                BEE RACE — ĐƯỜNG ĐUA VỊT BẤT HỦ
              </h3>
              <p className="text-[11px] text-amber-200/80 font-bold">
                Cài đặt số lượng vịt, thời gian đua và vinh danh Top 1-2-3 học sinh
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

        {/* SCREEN 1: Setup Slider & Time */}
        {screen === 'setup' && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full space-y-8 py-6">
            
            {/* Duck Count Range Slider with Floating Green Bubble */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <span>Số Lượng Vịt Đua (1 - 100):</span>
                <span className="text-sm font-black text-white">{duckCount} con vịt</span>
              </div>

              <div className="relative pt-6">
                {/* Floating Green Number Bubble */}
                <div
                  className="absolute -top-1 px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-full shadow-md -translate-x-1/2 transition-all pointer-events-none"
                  style={{ left: `${((duckCount - 1) / 99) * 100}%` }}
                >
                  {duckCount} 🐥
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-emerald-500" />
                </div>

                <input
                  type="range"
                  min={1}
                  max={100}
                  value={duckCount}
                  onChange={(e) => setDuckCount(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Duration Selector Pills */}
            <div className="w-full space-y-2">
              <label className="text-xs font-bold text-amber-200 block">Thời Gian Đua (Giây):</label>
              <div className="grid grid-cols-4 gap-3">
                {[10, 12, 15, 30].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      soundFx.playClick();
                      setDuration(t);
                    }}
                    className={`py-3 rounded-2xl font-black text-xs transition-all border ${
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

            {/* SET Button */}
            <button
              onClick={handleConfirmSetup}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>XÁC NHẬN CÀI ĐẶT (SET)</span>
              <Play className="w-5 h-5 fill-slate-950" />
            </button>
          </div>
        )}

        {/* SCREEN 2: Water Race Track Canvas & Live Podium */}
        {screen === 'race' && (
          <div className="flex-1 flex flex-col justify-between py-2 space-y-3">
            
            {/* Top Bar: Timer 00:00:12 & Action Controls */}
            <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-slate-400 uppercase">ĐỒNG HỒ ĐUA:</span>
                <span className="font-mono text-xl font-black text-amber-400">
                  00:00:{String(timeLeft).padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {raceState === 'ready' && (
                  <button
                    onClick={handleStartRace}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>XUẤT PHÁT!</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setScreen('setup');
                    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-300 rounded-xl"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Water Track */}
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-sky-400 shadow-xl bg-sky-600">
              <canvas
                ref={canvasRef}
                width={920}
                height={380}
                className="w-full h-[360px] sm:h-[380px] block"
              />
            </div>

            {/* Finished State: Top 1-2-3 Podium Leaderboard */}
            {raceState === 'finished' && topDucks.length >= 3 && (
              <div className="p-4 bg-slate-800/95 border-2 border-amber-400 rounded-3xl animate-in zoom-in-90 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-7 h-7 text-amber-400" />
                  <div>
                    <h4 className="font-black text-sm text-amber-300">VINH DANH TOP 3 ĐUA VỊT</h4>
                    <span className="text-[11px] text-slate-400">Chúc mừng 3 chú vịt bứt phá về đích xuất sắc</span>
                  </div>
                </div>

                {/* Top 3 Cards */}
                <div className="flex items-center space-x-3">
                  {/* Top 1 (Gold) */}
                  <div className="p-2.5 bg-amber-500/20 border-2 border-amber-400 rounded-2xl text-center min-w-[100px]">
                    <span className="text-base">🥇</span>
                    <span className="block font-black text-xs text-amber-300 truncate max-w-[90px]">
                      {topDucks[0]?.name}
                    </span>
                    <span className="text-[10px] text-amber-200 font-bold">+5 Điểm</span>
                  </div>

                  {/* Top 2 (Silver) */}
                  <div className="p-2.5 bg-slate-400/20 border-2 border-slate-300 rounded-2xl text-center min-w-[100px]">
                    <span className="text-base">🥈</span>
                    <span className="block font-black text-xs text-slate-200 truncate max-w-[90px]">
                      {topDucks[1]?.name}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold">+3 Điểm</span>
                  </div>

                  {/* Top 3 (Bronze) */}
                  <div className="p-2.5 bg-amber-700/20 border-2 border-amber-600 rounded-2xl text-center min-w-[100px]">
                    <span className="text-base">🥉</span>
                    <span className="block font-black text-xs text-amber-400 truncate max-w-[90px]">
                      {topDucks[2]?.name}
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold">+2 Điểm</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playWinner();
                    onRewardTop3?.(topDucks);
                    setScreen('setup');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>CỘNG ĐIỂM TOP 3</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

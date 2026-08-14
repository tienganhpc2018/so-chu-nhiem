import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { MascotRobot } from './MascotRobot';
import { X, Sparkles, Trophy, RefreshCw } from 'lucide-react';

export const LuckyWheelModal = ({ isOpen, onClose, students = [] }) => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);

  const colors = [
    '#10B981', '#F97316', '#3B82F6', '#EC4899', 
    '#8B5CF6', '#F59E0B', '#14B8A6', '#6366F1'
  ];

  useEffect(() => {
    if (isOpen && canvasRef.current && students.length > 0) {
      drawWheel(rotation);
    }
  }, [isOpen, rotation, students]);

  const drawWheel = (currentRotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    if (students.length === 0) return;

    const sliceAngle = (2 * Math.PI) / students.length;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((currentRotation * Math.PI) / 180);

    // Draw Slices
    students.forEach((st, idx) => {
      const angle = idx * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      
      const displayName = st.full_name.length > 14 
        ? st.full_name.substring(0, 12) + '...' 
        : st.full_name;
        
      ctx.fillText(displayName, radius - 15, 4);
      ctx.restore();
    });

    ctx.restore();

    // Center Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#10B981';
    ctx.stroke();

    // Center Star Icon
    ctx.fillStyle = '#F97316';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', centerX, centerY);
  };

  const handleSpin = () => {
    if (spinning || students.length === 0) return;

    setSpinning(true);
    setWinner(null);
    soundFx.playClick();

    // Random winner index
    const winnerIdx = Math.floor(Math.random() * students.length);
    const sliceAngle = 360 / students.length;

    // Additional full spins (5 to 8 rotations)
    const extraDegrees = (5 + Math.floor(Math.random() * 3)) * 360;
    // Align wheel so top pointer points to winner
    const targetDegree = extraDegrees + (360 - (winnerIdx * sliceAngle + sliceAngle / 2)) - 90;

    let currentDeg = rotation % 360;
    const totalDelta = targetDegree - currentDeg;
    const duration = 4000; // 4 seconds spin
    const startTime = performance.now();

    const tickInterval = setInterval(() => {
      soundFx.playWheelTick();
    }, 120);

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newRot = currentDeg + totalDelta * easeOut;

      setRotation(newRot);
      drawWheel(newRot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        clearInterval(tickInterval);
        setSpinning(false);
        const selectedWinner = students[winnerIdx];
        setWinner(selectedWinner);

        soundFx.playWinner();
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.5 }
        });
      }
    };

    requestAnimationFrame(animate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-mint-100 flex flex-col items-center relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex p-2 bg-amber-50 rounded-full mb-2 border border-amber-200">
            <MascotRobot mode={winner ? 'celebrate' : 'happy'} size={48} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Vòng Quay May Mắn Chọn Học Sinh</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Gọi tên học sinh ngẫu nhiên phát biểu / nhận quà / trả lời bài</p>
        </div>

        {/* Wheel Canvas Container */}
        <div className="relative my-2 flex items-center justify-center">
          
          {/* Top Pointer Arrow */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-coral-500 drop-shadow-md"></div>

          {/* Canvas Wheel */}
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="rounded-full shadow-lg border-4 border-mint-200 bg-white"
          />
        </div>

        {/* Winner Showcase Popup */}
        {winner && (
          <div className="w-full my-4 bg-gradient-to-r from-amber-50 via-coral-50 to-amber-50 border-2 border-amber-300 p-4 rounded-2xl text-center animate-bounce shadow-md">
            <div className="flex items-center justify-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Chúc Mừng Học Sinh May Mắn</span>
            </div>
            <h2 className="text-2xl font-black text-coral-600">{winner.full_name}</h2>
            <p className="text-xs text-slate-600 mt-1">Bàn H{winner.seat_row}-C{winner.seat_col} • {winner.total_stars || 0} Sao Tích Lũy</p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 w-full flex items-center justify-center">
          <button
            onClick={handleSpin}
            disabled={spinning || students.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-mint-500 via-mint-600 to-coral-500 hover:from-mint-600 hover:to-coral-600 text-white font-extrabold text-base rounded-2xl shadow-mint-glow hover:shadow-coral-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
            <span>{spinning ? 'Đang quay may mắn...' : 'QUAY NGẪU NHIÊN NGAY'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Gift, ArrowRight, RotateCcw } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const TetHaiHoaModal = ({
  isOpen,
  onClose,
  students = [],
  calledStudentIds = [],
  onRewardStudent
}) => {
  const [step, setStep] = useState(1); // 1: Intro, 2: 16 Lanterns Tree, 3: Winner Reveal
  const [selectedLantern, setSelectedLantern] = useState(null);
  const [winnerStudent, setWinnerStudent] = useState(null);
  const [openedLanterns, setOpenedLanterns] = useState([]);

  if (!isOpen) return null;

  // Filter available students (uncalled & present)
  const availableStudents = students.filter(
    s => !calledStudentIds.includes(s.id) && s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
  );
  const pool = availableStudents.length > 0 ? availableStudents : students;

  const handleStartHaiHoa = () => {
    soundFx.playClick();
    setStep(2);
  };

  const handlePickLantern = (num) => {
    if (openedLanterns.includes(num)) return;
    soundFx.playCorrect();

    // Pick random student
    const rand = pool[Math.floor(Math.random() * pool.length)];
    setSelectedLantern(num);
    setWinnerStudent(rand);
    setOpenedLanterns(prev => [...prev, num]);

    // Fireworks
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#EF4444', '#F59E0B', '#FCD34D', '#10B981']
    });

    setStep(3);
  };

  const handleClaimReward = () => {
    if (!winnerStudent) return;
    soundFx.playWinner();
    onRewardStudent?.(winnerStudent.id, 5, 'Lộc Xuân Hái Hoa Dân Chủ 🌸 (+5)');
    setStep(2);
    setSelectedLantern(null);
    setWinnerStudent(null);
  };

  const handleResetLanterns = () => {
    soundFx.playClick();
    setOpenedLanterns([]);
  };

  // 16 Lantern positions on the golden apricot tree (SVG coordinates %)
  const lanternPositions = [
    { id: 1, top: '22%', left: '32%' },
    { id: 2, top: '18%', left: '48%' },
    { id: 3, top: '24%', left: '64%' },
    { id: 4, top: '35%', left: '25%' },
    { id: 5, top: '32%', left: '42%' },
    { id: 6, top: '36%', left: '58%' },
    { id: 7, top: '33%', left: '72%' },
    { id: 8, top: '48%', left: '20%' },
    { id: 9, top: '46%', left: '38%' },
    { id: 10, top: '49%', left: '60%' },
    { id: 11, top: '47%', left: '78%' },
    { id: 12, top: '60%', left: '28%' },
    { id: 13, top: '58%', left: '46%' },
    { id: 14, top: '62%', left: '68%' },
    { id: 15, top: '70%', left: '35%' },
    { id: 16, top: '72%', left: '62%' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-amber-950 via-red-950 to-amber-950 border-4 border-amber-400/80 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-white overflow-hidden flex flex-col items-center min-h-[600px] justify-between">
        
        {/* Background decorative blossoms */}
        <div className="absolute top-2 left-3 text-2xl animate-spin text-amber-300 opacity-60 pointer-events-none">🌸</div>
        <div className="absolute bottom-3 right-4 text-3xl animate-bounce text-amber-300 opacity-60 pointer-events-none">🌸</div>
        <div className="absolute top-10 right-10 text-xl text-yellow-300 opacity-40 pointer-events-none">✨</div>

        {/* Header Bar */}
        <div className="w-full flex items-center justify-between z-10 border-b border-amber-500/30 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌸</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-300 tracking-wider font-serif">
                HÁI HOA DÂN CHỦ MỪNG XUÂN
              </h3>
              <p className="text-[11px] text-amber-200/80 font-bold">
                Hoạt động bốc thăm may mắn & trả lời câu hỏi nề nếp đầu xuân
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-amber-300 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEP 1: Intro Screen with Big Golden Tree */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-6 z-10">
            {/* Golden Apricot Tree Vector SVG */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.4)]">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Pot */}
                <ellipse cx="100" cy="180" rx="35" ry="10" fill="#92400E" />
                <path d="M70 180 L80 150 L120 150 L130 180 Z" fill="#B45309" stroke="#FDE68A" strokeWidth="2" />
                <text x="100" y="172" fontSize="11" fill="#FEF3C7" fontWeight="bold" textAnchor="middle">XUÂN</text>
                {/* Trunk */}
                <path d="M100 150 Q105 110 95 80 Q110 50 100 25" stroke="#78350F" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M98 100 Q65 85 45 75" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M102 90 Q135 80 155 65" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M96 65 Q70 50 55 35" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M100 55 Q130 45 140 25" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Golden Blossoms */}
                {[
                  [100, 20], [85, 30], [115, 30], [55, 35], [140, 25],
                  [45, 75], [155, 65], [70, 50], [130, 45], [95, 80],
                  [35, 65], [165, 55], [60, 90], [135, 95], [105, 55]
                ].map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="8" fill="#FBBF24" />
                    <circle cx={x} cy={y} r="4" fill="#DC2626" />
                    <circle cx={x - 4} cy={y - 4} r="4" fill="#FDE047" />
                    <circle cx={x + 4} cy={y - 4} r="4" fill="#FDE047" />
                    <circle cx={x - 4} cy={y + 4} r="4" fill="#FDE047" />
                    <circle cx={x + 4} cy={y + 4} r="4" fill="#FDE047" />
                  </g>
                ))}
              </svg>
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 px-8 py-3 rounded-full border-2 border-yellow-200 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-black text-yellow-100 tracking-wider font-serif">
                CÂY MAI VÀNG — 16 LỒNG ĐÈN LỘC XUÂN
              </h2>
            </div>

            <button
              onClick={handleStartHaiHoa}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-red-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 flex items-center space-x-2 transform hover:scale-105 active:scale-95 transition-all"
            >
              <span>BẮT ĐẦU HÁI HOA LỘC</span>
              <ArrowRight className="w-4 h-4 text-red-950" />
            </button>
          </div>
        )}

        {/* STEP 2: Interactive Tree with 16 Red Lanterns */}
        {step === 2 && (
          <div className="flex-1 w-full flex flex-col items-center justify-center z-10 py-2">
            <div className="w-full flex items-center justify-between px-4 mb-2 text-xs font-bold text-amber-200">
              <span>👉 Bấm chọn một lồng đèn may mắn trên cành mai:</span>
              <button
                onClick={handleResetLanterns}
                className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Mở Lại 16 Đèn</span>
              </button>
            </div>

            {/* Tree Canvas with Lanterns */}
            <div className="relative w-full max-w-2xl h-[420px] bg-gradient-to-b from-amber-900/30 to-red-950/40 rounded-3xl border border-amber-500/20 overflow-hidden flex items-center justify-center">
              {/* Background SVG Tree */}
              <svg viewBox="0 0 400 350" className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
                <ellipse cx="200" cy="330" rx="60" ry="15" fill="#78350F" />
                <path d="M200 320 Q210 240 190 170 Q210 110 200 40" stroke="#78350F" strokeWidth="14" fill="none" strokeLinecap="round" />
                <path d="M195 210 Q120 180 70 140" stroke="#78350F" strokeWidth="9" fill="none" strokeLinecap="round" />
                <path d="M205 190 Q280 160 330 130" stroke="#78350F" strokeWidth="9" fill="none" strokeLinecap="round" />
                <path d="M190 140 Q130 100 90 60" stroke="#78350F" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M200 110 Q270 80 300 40" stroke="#78350F" strokeWidth="7" fill="none" strokeLinecap="round" />
              </svg>

              {/* 16 Lanterns */}
              {lanternPositions.map((pos) => {
                const isOpened = openedLanterns.includes(pos.id);
                return (
                  <button
                    key={pos.id}
                    onClick={() => handlePickLantern(pos.id)}
                    disabled={isOpened}
                    style={{ top: pos.top, left: pos.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group ${
                      isOpened
                        ? 'opacity-30 grayscale cursor-not-allowed scale-90'
                        : 'cursor-pointer hover:scale-125 animate-pulse'
                    }`}
                  >
                    {/* Lantern String */}
                    <div className="w-0.5 h-3 bg-yellow-400 mx-auto" />
                    {/* Lantern Body */}
                    <div className="w-10 h-12 rounded-2xl bg-gradient-to-b from-red-600 via-rose-500 to-red-700 border-2 border-yellow-300 flex flex-col items-center justify-center shadow-lg shadow-red-500/50">
                      <span className="text-[9px] font-black text-yellow-300 font-serif">LỘC</span>
                      <span className="text-xs font-black text-white">{pos.id}</span>
                    </div>
                    {/* Lantern Tassel */}
                    <div className="w-1 h-3 bg-yellow-400 mx-auto rounded-b" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Royal Blossom Frame with Winner Calligraphy */}
        {step === 3 && winnerStudent && (
          <div className="flex-1 w-full flex flex-col items-center justify-center py-6 z-20 space-y-6">
            
            {/* Royal Circular Blossom Frame */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_50px_rgba(251,191,36,0.6)] flex items-center justify-center animate-in zoom-in-75">
              
              {/* Inner Red Pattern Ring */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-red-700 via-red-800 to-rose-950 border-4 border-yellow-200 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                
                {/* Floating Blossom Icons */}
                <span className="absolute top-3 text-lg animate-spin">🌸</span>
                <span className="absolute bottom-3 text-lg">🌸</span>

                {/* AI Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-yellow-300 shadow-xl mb-2 bg-yellow-50">
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

                {/* Calligraphy Style Student Name */}
                <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">
                  Chúc Mừng Năm Mới
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-yellow-100 font-serif tracking-wide drop-shadow-md">
                  {winnerStudent.full_name}
                </h3>
                <span className="text-[10px] text-yellow-200/80 font-bold">
                  {winnerStudent.code || 'Lớp Chủ Nhiệm'} • Đèn Số {selectedLantern}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-200 transition-all"
              >
                Hái Tiếp Cành Khác
              </button>
              <button
                onClick={handleClaimReward}
                className="px-7 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-red-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-400/40 flex items-center space-x-2 transform hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-red-950" />
                <span>+ THƯỞNG LỘC 5 ĐIỂM 🧧</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

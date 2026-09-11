import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, ArrowRight, RotateCcw, Volume2, Timer } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const TetHaiHoaModal = ({
  isOpen,
  onClose,
  students = [],
  calledStudentIds = [],
  onRewardStudent
}) => {
  const [step, setStep] = useState(1); // 1: Intro, 2: Tree, 'suspense': 6s suspense countdown, 3: Winner Reveal
  const [selectedLantern, setSelectedLantern] = useState(null);
  const [winnerStudent, setWinnerStudent] = useState(null);
  const [openedLanterns, setOpenedLanterns] = useState([]);
  const [suspenseCountdown, setSuspenseCountdown] = useState(6);
  const [rollingCandidate, setRollingCandidate] = useState(null);

  const suspenseTimerRef = useRef(null);
  const shuffleIntervalRef = useRef(null);

  // Filter available students (uncalled & present)
  const availableStudents = useMemo(() => {
    return students.filter(
      s => !calledStudentIds.includes(s.id) && s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
    );
  }, [students, calledStudentIds]);

  const pool = availableStudents.length > 0 ? availableStudents : (students.length > 0 ? students : []);

  // Tổng số hoa/lồng đèn theo đúng sĩ số thực tế của lớp (nếu chưa có thì tối thiểu 16)
  const totalCount = Math.max(students.length, 16);

  // Phân bổ toạ độ lồng đèn theo hình tán cây mai vàng cân đối
  const lanternPositions = useMemo(() => {
    const count = totalCount;
    const numRows = count <= 16 ? 4 : count <= 28 ? 5 : count <= 40 ? 6 : 7;
    const rowCapacities = [];
    let remaining = count;

    for (let r = 0; r < numRows; r++) {
      const isEdge = r === 0 || r === numRows - 1;
      const baseShare = Math.round((count / (numRows + 0.4)) * (isEdge ? 0.75 : 1.25));
      const assigned = r === numRows - 1 ? remaining : Math.min(remaining, Math.max(2, baseShare));
      rowCapacities.push(assigned);
      remaining -= assigned;
    }

    while (remaining > 0) {
      for (let r = 1; r < numRows - 1 && remaining > 0; r++) {
        rowCapacities[r]++;
        remaining--;
      }
    }

    const positions = [];
    let id = 1;
    const startY = 16;
    const endY = 78;

    rowCapacities.forEach((itemsInRow, r) => {
      if (itemsInRow <= 0) return;
      const y = startY + (r / Math.max(1, numRows - 1)) * (endY - startY);
      const widthFactor = Math.sin(((r + 0.5) / numRows) * Math.PI);
      const minX = 50 - 39 * widthFactor;
      const maxX = 50 + 39 * widthFactor;

      for (let i = 0; i < itemsInRow; i++) {
        const x = itemsInRow === 1 ? 50 : minX + (i / (itemsInRow - 1)) * (maxX - minX);
        const staggerY = (i % 2 === 0 ? -2.5 : 2.5) * (count > 25 ? 0.8 : 1.2);
        positions.push({
          id,
          top: `${Math.max(12, Math.min(84, Math.round(y + staggerY)))}%`,
          left: `${Math.max(10, Math.min(90, Math.round(x)))}%`
        });
        id++;
      }
    });

    return positions;
  }, [totalCount]);

  // Dọn dẹp âm thanh & timer khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      if (suspenseTimerRef.current) clearInterval(suspenseTimerRef.current);
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
      soundFx.stopSuspenseDrum();
      setStep(1);
      setSelectedLantern(null);
      setWinnerStudent(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartHaiHoa = () => {
    soundFx.playClick();
    setStep(2);
  };

  // Chọn lồng đèn -> Kích hoạt giai đoạn HỒI HỘP 6.5s
  const handlePickLantern = (num) => {
    if (openedLanterns.includes(num) || pool.length === 0) return;

    // Chọn ngẫu nhiên học sinh chiến thắng trước
    const randWinner = pool[Math.floor(Math.random() * pool.length)];
    setSelectedLantern(num);
    setWinnerStudent(randWinner);
    setOpenedLanterns(prev => [...prev, num]);

    // Bắt đầu hồi hộp 6.5s
    setStep('suspense');
    setSuspenseCountdown(6);

    // Kích hoạt âm thanh dồn trống
    soundFx.startSuspenseDrum(6.5);

    // Quay tít tên các bạn học sinh liên tục tạo cảm giác bốc thăm hồi hộp
    let speed = 60;
    const rollNames = () => {
      if (pool.length > 0) {
        const candidate = pool[Math.floor(Math.random() * pool.length)];
        setRollingCandidate(candidate);
      }
    };
    shuffleIntervalRef.current = setInterval(rollNames, speed);

    const startTime = Date.now();
    const durationMs = 6500;

    suspenseTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setSuspenseCountdown(remainingSec);

      // Khi còn dưới 1.8 giây, giảm tốc độ quay tên dần và chốt vào người thắng
      if (elapsed >= 4700 && shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = setInterval(rollNames, 220);
      }

      if (elapsed >= durationMs) {
        clearInterval(suspenseTimerRef.current);
        if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
        soundFx.stopSuspenseDrum();

        // Reveal người thắng
        setRollingCandidate(randWinner);
        soundFx.playWinner();
        soundFx.playFanfare();

        // Pháo hoa tưng bừng mừng xuân
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#EF4444', '#F59E0B', '#FCD34D', '#10B981', '#EC4899']
        });

        setStep(3);
      }
    }, 200);
  };

  const handleClaimReward = () => {
    if (!winnerStudent) return;
    soundFx.playWinner();
    onRewardStudent?.(winnerStudent.id, 5, `Lộc Xuân Hái Hoa Đèn #${selectedLantern} 🌸 (+5)`);
    setStep(2);
    setSelectedLantern(null);
    setWinnerStudent(null);
  };

  const handleResetLanterns = () => {
    soundFx.playClick();
    setOpenedLanterns([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-amber-950 via-red-950 to-amber-950 border-4 border-amber-400/80 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-white overflow-hidden flex flex-col items-center min-h-[640px] justify-between">
        
        {/* Background decorative blossoms */}
        <div className="absolute top-2 left-3 text-2xl animate-spin text-amber-300 opacity-50 pointer-events-none">🌸</div>
        <div className="absolute bottom-3 right-4 text-3xl animate-bounce text-amber-300 opacity-50 pointer-events-none">🌸</div>
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
                Sĩ số lớp: <span className="text-yellow-300 underline font-black">{students.length} học sinh</span> • Tổng số hoa/lồng đèn: <span className="text-yellow-300 font-black">{totalCount} lộc</span>
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

        {/* STEP 1: Intro Screen */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-6 z-10">
            {/* Golden Apricot Tree Vector SVG */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.4)]">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <ellipse cx="100" cy="180" rx="35" ry="10" fill="#92400E" />
                <path d="M70 180 L80 150 L120 150 L130 180 Z" fill="#B45309" stroke="#FDE68A" strokeWidth="2" />
                <text x="100" y="172" fontSize="11" fill="#FEF3C7" fontWeight="bold" textAnchor="middle">XUÂN</text>
                <path d="M100 150 Q105 110 95 80 Q110 50 100 25" stroke="#78350F" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M98 100 Q65 85 45 75" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M102 90 Q135 80 155 65" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M96 65 Q70 50 55 35" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M100 55 Q130 45 140 25" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
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

            {/* Dynamic Banner matching class size */}
            <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 px-6 sm:px-8 py-3 rounded-full border-2 border-yellow-200 shadow-xl text-center">
              <h2 className="text-lg sm:text-2xl font-black text-yellow-100 tracking-wider font-serif">
                CÂY MAI VÀNG — {totalCount} LỒNG ĐÈN HOA LỘC
              </h2>
              <span className="text-xs text-yellow-200 font-bold block mt-1">
                (Mỗi học sinh có cơ hội trúng lộc riêng, không em nào bị bỏ sót!)
              </span>
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

        {/* STEP 2: Interactive Tree with N Dynamic Lanterns */}
        {step === 2 && (
          <div className="flex-1 w-full flex flex-col items-center justify-center z-10 py-1">
            <div className="w-full flex items-center justify-between px-3 mb-2 text-xs font-bold text-amber-200">
              <span className="flex items-center space-x-1.5">
                <span>👉 Bấm chọn một lồng đèn may mắn trên cành mai ({totalCount} lộc):</span>
              </span>
              <button
                onClick={handleResetLanterns}
                className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Mở Lại Tất Cả ({openedLanterns.length}/{totalCount} đã mở)</span>
              </button>
            </div>

            {/* Tree Canvas with Responsive Lantern Grid */}
            <div className="relative w-full max-w-4xl h-[460px] sm:h-[480px] bg-gradient-to-b from-amber-950/40 via-red-950/50 to-amber-950/60 rounded-3xl border border-amber-500/30 overflow-hidden flex items-center justify-center shadow-inner">
              
              {/* Background SVG Tree with Spreading Foliage */}
              <svg viewBox="0 0 500 400" className="absolute inset-0 w-full h-full pointer-events-none opacity-85">
                <ellipse cx="250" cy="380" rx="90" ry="18" fill="#78350F" opacity="0.6" />
                <path d="M250 370 Q265 260 240 180 Q265 110 250 40" stroke="#78350F" strokeWidth="18" fill="none" strokeLinecap="round" />
                <path d="M245 230 Q140 200 60 150" stroke="#78350F" strokeWidth="11" fill="none" strokeLinecap="round" />
                <path d="M255 210 Q360 175 440 135" stroke="#78350F" strokeWidth="11" fill="none" strokeLinecap="round" />
                <path d="M240 150 Q150 110 90 60" stroke="#78350F" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M250 120 Q350 90 410 45" stroke="#78350F" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M240 80 Q190 50 160 25" stroke="#78350F" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M255 75 Q310 45 340 20" stroke="#78350F" strokeWidth="6" fill="none" strokeLinecap="round" />

                {/* Decorative blossoms on tree */}
                {[
                  [70, 145], [120, 180], [170, 215], [300, 195], [380, 160], [435, 130],
                  [100, 58], [150, 95], [200, 130], [290, 105], [360, 75], [405, 42],
                  [170, 25], [250, 35], [335, 20]
                ].map(([bx, by], idx) => (
                  <circle key={idx} cx={bx} cy={by} r="5" fill="#FBBF24" opacity="0.7" />
                ))}
              </svg>

              {/* Dynamic Lanterns */}
              {lanternPositions.map((pos) => {
                const isOpened = openedLanterns.includes(pos.id);
                // Adjust size if high count
                const sizeClass = totalCount > 30 ? 'w-8 h-10' : 'w-10 h-12';
                const fontClass = totalCount > 30 ? 'text-[10px]' : 'text-xs';

                return (
                  <button
                    key={pos.id}
                    onClick={() => handlePickLantern(pos.id)}
                    disabled={isOpened}
                    style={{ top: pos.top, left: pos.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group z-20 ${
                      isOpened
                        ? 'opacity-25 grayscale cursor-not-allowed scale-80'
                        : 'cursor-pointer hover:scale-125 hover:z-30 animate-pulse'
                    }`}
                  >
                    {/* Lantern String */}
                    <div className="w-0.5 h-2.5 bg-yellow-300 mx-auto" />
                    
                    {/* Lantern Body */}
                    <div className={`${sizeClass} rounded-2xl bg-gradient-to-b from-red-600 via-rose-500 to-red-700 border-2 border-yellow-300 flex flex-col items-center justify-center shadow-lg shadow-red-500/60`}>
                      <span className="text-[8px] font-black text-yellow-300 font-serif leading-none">LỘC</span>
                      <span className={`${fontClass} font-black text-white leading-tight`}>{pos.id}</span>
                    </div>

                    {/* Lantern Tassel */}
                    <div className="w-1 h-2.5 bg-yellow-400 mx-auto rounded-b" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP SUSPENSE: 6.5s Suspense Phase with Drumroll & Fast Name Cycling */}
        {step === 'suspense' && (
          <div className="flex-1 w-full flex flex-col items-center justify-center py-6 z-20 space-y-5 animate-in zoom-in-95">
            
            {/* Suspense Header */}
            <div className="text-center space-y-2">
              <span className="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 font-black text-xs uppercase tracking-widest inline-flex items-center space-x-2 animate-pulse">
                <Volume2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span>ĐANG KHUI LỘC XUÂN ĐÈN SỐ #{selectedLantern}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-yellow-200 font-serif tracking-wide">
                HỒI HỘP CHỜ ĐỢI... AI SẼ LÀ NGƯỜI MAY MẮN?
              </h2>
            </div>

            {/* Giant Pulsing Golden Lantern with Countdown */}
            <div className="relative flex flex-col items-center justify-center my-2">
              <div className="relative w-40 h-48 sm:w-48 sm:h-56 rounded-3xl bg-gradient-to-b from-red-600 via-rose-600 to-red-800 border-4 border-yellow-300 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.7)] animate-bounce">
                
                <span className="text-xs font-black text-yellow-300 tracking-widest font-serif">ĐÈN SỐ</span>
                <span className="text-4xl sm:text-5xl font-black text-white my-1 font-mono">
                  #{selectedLantern}
                </span>

                {/* Countdown Timer Badge */}
                <div className="mt-2 px-3 py-1 bg-yellow-400 text-red-950 font-black text-xs rounded-full flex items-center space-x-1 shadow-md">
                  <Timer className="w-3.5 h-3.5" />
                  <span>{suspenseCountdown} GIÂY NỮA</span>
                </div>
              </div>

              {/* Lantern Tassel */}
              <div className="w-3 h-8 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-b shadow-md" />
            </div>

            {/* Rolling Candidates Slot Box */}
            <div className="w-full max-w-md bg-slate-900/90 border-2 border-amber-400 rounded-2xl p-3 flex items-center justify-center space-x-3 shadow-xl">
              {rollingCandidate && (
                <>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-300 bg-amber-100 flex-shrink-0">
                    <img
                      src={
                        rollingCandidate.avatar ||
                        rollingCandidate.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(rollingCandidate.full_name)}`
                      }
                      alt={rollingCandidate.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left truncate">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                      Đang rà soát danh sách...
                    </span>
                    <span className="text-base font-black text-white truncate block">
                      {rollingCandidate.full_name}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md h-2.5 bg-red-950 rounded-full overflow-hidden border border-amber-500/40">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300 ease-linear rounded-full"
                style={{ width: `${Math.max(5, (1 - suspenseCountdown / 6) * 100)}%` }}
              />
            </div>

          </div>
        )}

        {/* STEP 3: Royal Blossom Frame with Winner Calligraphy */}
        {step === 3 && winnerStudent && (
          <div className="flex-1 w-full flex flex-col items-center justify-center py-4 z-20 space-y-5 animate-in zoom-in-75">
            
            {/* Royal Circular Blossom Frame */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_60px_rgba(251,191,36,0.8)] flex items-center justify-center">
              
              {/* Inner Red Pattern Ring */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-red-700 via-red-800 to-rose-950 border-4 border-yellow-200 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                
                <span className="absolute top-2 text-xl animate-spin">🌸</span>
                <span className="absolute bottom-2 text-xl">🌸</span>

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
                <span className="text-[10px] text-yellow-200/90 font-bold">
                  {winnerStudent.code || 'Học Sinh Lớp'} • Trúng Lộc Đèn #{selectedLantern}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-200 transition-all"
              >
                Hái Tiếp Lộc Khác ({totalCount - openedLanterns.length} còn lại)
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

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Sparkles, Trophy, Coins, RotateCw, CheckCircle2, AlertCircle, Gift, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../utils/soundEffects';

const WHEEL_PRIZES = [
  { id: 'p1', name: 'Bộ Bút Gel 4 Màu', icon: '🖊️', color: '#F43F5E', type: 'gift', coinsSpent: 5 },
  { id: 'p2', name: 'Kẹo Mút Chupa Chups', icon: '🍭', color: '#F59E0B', type: 'gift', coinsSpent: 5 },
  { id: 'p3', name: '+2 Xu May Mắn', icon: '🪙', color: '#10B981', type: 'coins', value: 2 },
  { id: 'p4', name: 'Voucher Miễn Trực Nhật', icon: '🧹', color: '#6366F1', type: 'gift', coinsSpent: 5 },
  { id: 'p5', name: 'Sổ Tay Mini A7', icon: '📓', color: '#EC4899', type: 'gift', coinsSpent: 5 },
  { id: 'p6', name: '+5 Xu Hoàn Lại', icon: '⭐', color: '#8B5CF6', type: 'coins', value: 5 },
  { id: 'p7', name: 'Thẻ Miễn Bài Tập 1 Lần', icon: '🎟️', color: '#3B82F6', type: 'gift', coinsSpent: 5 },
  { id: 'p8', name: 'Móc Khóa Capybara', icon: '🧸', color: '#14B8A6', type: 'gift', coinsSpent: 5 },
];

export const GiftLuckyWheelModal = ({
  isOpen,
  onClose,
  students = [],
  onSpinSuccess,
  costPerSpin = 5
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const canvasRef = useRef(null);
  const audioIntervalRef = useRef(null);

  // Chuẩn hóa danh sách học sinh
  const studentList = useMemo(() => {
    return (students || []).map(st => ({
      ...st,
      currentCoins: Number(st.coins ?? st.total_stars ?? 0)
    }));
  }, [students]);

  const selectedStudent = studentList.find(s => s.id === selectedStudentId);
  const canSpin = selectedStudent && selectedStudent.currentCoins >= costPerSpin && !isSpinning;

  // Lọc học sinh tìm kiếm
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentList;
    const q = searchQuery.toLowerCase();
    return studentList.filter(s => s.full_name?.toLowerCase().includes(q));
  }, [studentList, searchQuery]);

  // Vẽ bánh xe vòng quay lên Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numSegments = WHEEL_PRIZES.length;
    const arc = (2 * Math.PI) / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    WHEEL_PRIZES.forEach((prize, i) => {
      const angle = i * arc;
      // Vẽ cánh quạt
      ctx.beginPath();
      ctx.fillStyle = prize.color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Viền cánh quạt
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Vẽ chữ và icon
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(`${prize.icon} ${prize.name}`, radius - 20, 4);
      ctx.restore();
    });

    // Vẽ tâm bánh xe
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    // Icon giữa tâm
    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎁', centerX, centerY);
  }, [isOpen]);

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setIsSpinning(false);
      setWonPrize(null);
    }
  }, [isOpen]);

  // Xử lý quay bánh xe
  const handleSpin = () => {
    if (!canSpin) return;

    soundFx?.playClick();
    setIsSpinning(true);
    setWonPrize(null);

    // Chọn ngẫu nhiên phần quà
    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const selectedPrize = WHEEL_PRIZES[prizeIndex];

    const numSegments = WHEEL_PRIZES.length;
    const segmentAngle = 360 / numSegments;
    // Góc dừng: kim chỉ ở trên cùng (270 độ hoặc 90 độ tùy canvas, ở đây 0 độ là 3h, kim ở 3h = 0 độ)
    // Để kim ở phía trên (270 độ): targetAngle = 270 - (prizeIndex * segmentAngle + segmentAngle / 2)
    const extraRounds = 5 + Math.floor(Math.random() * 3); // 5-7 vòng
    const targetDeg = extraRounds * 360 + (360 - (prizeIndex * segmentAngle + segmentAngle / 2));

    const totalAngle = rotationAngle + targetDeg;
    setRotationAngle(totalAngle);

    // Phát âm thanh tíc tắc đều đặn
    let tickCount = 0;
    audioIntervalRef.current = setInterval(() => {
      soundFx?.playWheelTick();
      tickCount++;
      if (tickCount > 35) clearInterval(audioIntervalRef.current);
    }, 110);

    // Kết thúc sau 4.2 giây
    setTimeout(() => {
      clearInterval(audioIntervalRef.current);
      setIsSpinning(false);
      setWonPrize(selectedPrize);

      soundFx?.playWinner();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Gọi callback cập nhật xu và lịch sử
      onSpinSuccess?.({
        student: selectedStudent,
        prize: selectedPrize,
        coinsDeducted: costPerSpin
      });
    }, 4200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🎡</span>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Vòng Quay May Mắn Đổi Quà Thi Đua
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Chỉ <strong>{costPerSpin} xu/lượt</strong> quay trúng ngay các phần quà hấp dẫn!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSpinning}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col md:flex-row items-center gap-6">
          
          {/* Cột 1: Vòng Quay May Mắn */}
          <div className="flex flex-col items-center justify-center relative shrink-0">
            {/* Kim chỉ phần thưởng mạ vàng */}
            <div className="absolute -top-3 z-20 flex flex-col items-center pointer-events-none drop-shadow-md">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-sm" />
            </div>

            {/* Bánh xe quay xoay mượt */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-amber-300 shadow-2xl p-1 bg-gradient-to-tr from-amber-200 to-yellow-100 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="w-full h-full rounded-full transition-transform"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transitionDuration: isSpinning ? '4.2s' : '0s',
                  transitionTimingFunction: 'cubic-bezier(0.15, 0.95, 0.2, 1.0)'
                }}
              />
            </div>
          </div>

          {/* Cột 2: Chọn học sinh & Kết quả trúng thưởng */}
          <div className="flex-1 w-full space-y-4 text-left">
            
            {/* Hộp chọn học sinh quay */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Chọn học sinh quay thưởng:
              </label>
              
              <input
                type="text"
                placeholder="Tìm tên học sinh..."
                disabled={isSpinning}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <div className="max-h-36 overflow-y-auto space-y-1 p-1 bg-slate-50 rounded-xl border border-slate-200 custom-scrollbar">
                {filteredStudents.map(st => {
                  const isSelected = selectedStudentId === st.id;
                  const isAffordable = st.currentCoins >= costPerSpin;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={isSpinning}
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`w-full p-2 rounded-lg text-left flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{st.full_name}</span>
                      <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isAffordable
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        🪙 {st.currentCoins} xu
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thông tin học sinh đã chọn */}
            {selectedStudent && (
              <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                selectedStudent.currentCoins >= costPerSpin
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div>
                  <span className="font-bold block">{selectedStudent.full_name}</span>
                  <span className="text-[11px]">
                    Số dư hiện có: <strong>{selectedStudent.currentCoins} xu</strong>
                  </span>
                </div>
                {selectedStudent.currentCoins < costPerSpin && (
                  <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                    Cần tối thiểu {costPerSpin} xu
                  </span>
                )}
              </div>
            )}

            {/* Kết quả sau khi quay */}
            {wonPrize && !isSpinning && (
              <div className="p-4 bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 border-2 border-amber-300 rounded-2xl text-center space-y-1.5 animate-in zoom-in-95">
                <span className="text-3xl block animate-bounce">{wonPrize.icon}</span>
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 block">
                  🎉 CHÚC MỪNG EM ĐÃ TRÚNG THƯỞNG!
                </span>
                <h4 className="text-base font-black text-slate-800">
                  {wonPrize.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {wonPrize.type === 'coins'
                    ? `Em đã được cộng lại +${wonPrize.value} xu vào tài khoản!`
                    : 'Phần thưởng đã được ghi nhận vào nhật ký đổi quà của lớp!'}
                </p>
              </div>
            )}

            {/* Nút bấm quay chính */}
            <button
              type="button"
              disabled={!canSpin}
              onClick={handleSpin}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-xl transition-all ${
                canSpin
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white hover:shadow-rose-200 hover:scale-102 active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>
                {isSpinning
                  ? 'Đang quay hồi hộp...'
                  : !selectedStudent
                  ? 'Chọn học sinh để quay'
                  : selectedStudent.currentCoins < costPerSpin
                  ? `Chưa đủ ${costPerSpin} xu để quay`
                  : `QUAY NGAY (-${costPerSpin} XU)`}
              </span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

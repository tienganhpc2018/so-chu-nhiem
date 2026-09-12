import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, Gift, Crown, Gem, Package, RotateCcw, Printer, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../utils/soundEffects';

const MYSTERY_POOL = [
  // 1. LEGENDARY (10%)
  { id: 'm-leg-1', name: 'Vé Miễn Trực Nhật 1 Tuần', icon: '👑', rarity: 'legendary', value: 35, color: 'from-amber-400 to-yellow-500', weight: 5 },
  { id: 'm-leg-2', name: 'Bình Giữ Nhiệt Học Sinh 500ml', icon: '🥤', rarity: 'legendary', value: 30, color: 'from-amber-400 to-yellow-500', weight: 5 },

  // 2. EPIC (30%)
  { id: 'm-epic-1', name: 'Bộ Bút Highlight Pastel 6 Màu', icon: '🎨', rarity: 'epic', value: 25, color: 'from-purple-500 to-indigo-600', weight: 10 },
  { id: 'm-epic-2', name: 'Sổ Tay Bìa Da Khóa Nam Châm', icon: '📖', rarity: 'epic', value: 20, color: 'from-purple-500 to-indigo-600', weight: 10 },
  { id: 'm-epic-3', name: 'Thẻ Chọn Chỗ Ngồi Yêu Thích 1 Tháng', icon: '🪑', rarity: 'epic', value: 25, color: 'from-purple-500 to-indigo-600', weight: 10 },

  // 3. COMMON (60%)
  { id: 'm-com-1', name: 'Hộp Bút Canvas Nhiều Ngăn', icon: '👝', rarity: 'common', value: 18, color: 'from-blue-500 to-cyan-500', weight: 15 },
  { id: 'm-com-2', name: 'Móc Khóa Capybara Phát Sáng', icon: '🧸', rarity: 'common', value: 15, color: 'from-blue-500 to-cyan-500', weight: 15 },
  { id: 'm-com-3', name: 'Bộ Thước Kẻ & Com-pa Đa Năng', icon: '📐', rarity: 'common', value: 15, color: 'from-blue-500 to-cyan-500', weight: 15 },
  { id: 'm-com-4', name: 'Bộ Bút Gel Ngòi 0.5mm 5 Chiếc', icon: '✏️', rarity: 'common', value: 12, color: 'from-blue-500 to-cyan-500', weight: 15 },
];

export const MysteryBoxModal = ({
  isOpen,
  onClose,
  students = [],
  onUnboxSuccess,
  boxCost = 15,
  onOpenVoucher
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unboxingState, setUnboxingState] = useState('idle'); // 'idle' | 'shaking' | 'revealed'
  const [revealedItem, setRevealedItem] = useState(null);
  const [createdRedemption, setCreatedRedemption] = useState(null);

  // Chuẩn hóa học sinh
  const studentList = useMemo(() => {
    return (students || []).map(st => ({
      ...st,
      currentCoins: Number(st.coins ?? st.total_stars ?? 0)
    }));
  }, [students]);

  const selectedStudent = studentList.find(s => s.id === selectedStudentId);
  const canUnbox = selectedStudent && selectedStudent.currentCoins >= boxCost && unboxingState === 'idle';

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentList;
    const q = searchQuery.toLowerCase();
    return studentList.filter(s => s.full_name?.toLowerCase().includes(q));
  }, [studentList, searchQuery]);

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setUnboxingState('idle');
      setRevealedItem(null);
      setCreatedRedemption(null);
    }
  }, [isOpen]);

  // Xử lý mở hộp quà
  const handleStartUnbox = () => {
    if (!canUnbox) return;

    soundFx?.playClick();
    setUnboxingState('shaking');

    // Âm thanh rung lắc hồi hộp
    soundFx?.playSuspenseSpin();

    // Rung lắc trong 2.5s rồi nổ quà
    setTimeout(() => {
      // Thuật toán bốc quà theo trọng số (weighted random)
      const totalWeight = MYSTERY_POOL.reduce((acc, item) => acc + item.weight, 0);
      let randomNum = Math.random() * totalWeight;
      let chosen = MYSTERY_POOL[0];

      for (const item of MYSTERY_POOL) {
        if (randomNum < item.weight) {
          chosen = item;
          break;
        }
        randomNum -= item.weight;
      }

      setRevealedItem(chosen);
      setUnboxingState('revealed');

      soundFx?.playWinner();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: chosen.rarity === 'legendary' ? ['#F59E0B', '#FBBF24', '#EF4444', '#FFFFFF'] : undefined
      });

      const newRedemption = onUnboxSuccess?.({
        student: selectedStudent,
        item: chosen,
        coinsSpent: boxCost
      });
      setCreatedRedemption(newRedemption);
    }, 2500);
  };

  const handlePrintVoucher = () => {
    if (!revealedItem || !selectedStudent) return;
    onOpenVoucher?.({
      student: selectedStudent,
      gift: {
        id: revealedItem.id,
        name: `[Hộp Bí Ẩn] ${revealedItem.name}`,
        requiredCoins: boxCost,
        image: revealedItem.icon
      },
      redemption: createdRedemption || {
        id: `red-${Date.now()}`,
        studentId: selectedStudent.id,
        studentName: selectedStudent.full_name,
        giftName: `[Hộp Bí Ẩn] ${revealedItem.name}`,
        coinsSpent: boxCost,
        timestamp: new Date().toISOString()
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl animate-bounce">🎁</span>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center space-x-1.5">
                <span>Hộp Quà Bí Ẩn (Mystery Box)</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                Giá <strong>{boxCost} xu</strong> • Cơ hội nhận vật phẩm cực phẩm trị giá đến 35 xu!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={unboxingState === 'shaking'}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-center">
          
          {/* GIAI ĐOẠN 1 & 2: HỘP QUÀ CHƯA MỞ HOẶC ĐANG RUNG LẮC */}
          {unboxingState !== 'revealed' ? (
            <>
              {/* Animation Hộp Quà */}
              <div className="relative py-4 flex flex-col items-center justify-center">
                {/* Hào quang nền */}
                <div className="absolute w-44 h-44 bg-gradient-to-tr from-amber-400/30 via-rose-400/30 to-purple-400/30 rounded-full blur-2xl animate-pulse pointer-events-none" />

                <div className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 p-1 shadow-2xl flex items-center justify-center transition-all ${
                  unboxingState === 'shaking'
                    ? 'animate-bounce scale-110 rotate-6 filter drop-shadow-2xl'
                    : 'hover:scale-105'
                }`}>
                  <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-slate-900 rounded-[22px] flex flex-col items-center justify-center text-white border-2 border-amber-300/60 shadow-inner">
                    <span className={`text-6xl drop-shadow-md select-none transition-transform ${
                      unboxingState === 'shaking' ? 'scale-125' : ''
                    }`}>
                      🎁
                    </span>
                    <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase mt-1">
                      MYSTERY BOX
                    </span>
                  </div>
                </div>

                {unboxingState === 'shaking' && (
                  <div className="mt-4 flex items-center space-x-2 text-amber-600 font-black text-xs animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>ĐANG PHÁ KHOÁ RƯƠNG BÍ MẬT... HỒI HỘP QUÁ!</span>
                  </div>
                )}
              </div>

              {/* Bảng tỷ lệ rơi minh bạch */}
              <div className="grid grid-cols-3 gap-2 text-left">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-amber-700">
                    <Crown className="w-3 h-3" />
                    <span>Cực Phẩm (10%)</span>
                  </div>
                  <span className="text-[11px] font-bold block mt-0.5">Trị giá 30-35 xu</span>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
                  <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-purple-700">
                    <Gem className="w-3 h-3" />
                    <span>Hiếm (30%)</span>
                  </div>
                  <span className="text-[11px] font-bold block mt-0.5">Trị giá 20-25 xu</span>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-blue-700">
                    <Package className="w-3 h-3" />
                    <span>Phổ Thông (60%)</span>
                  </div>
                  <span className="text-[11px] font-bold block mt-0.5">Trị giá 12-18 xu</span>
                </div>
              </div>

              {/* Chọn học sinh mở rương */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Chọn học sinh mở hộp quà:
                </label>
                <input
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  value={searchQuery}
                  disabled={unboxingState === 'shaking'}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />

                <div className="max-h-32 overflow-y-auto space-y-1 p-1 bg-slate-50 rounded-xl border border-slate-200 custom-scrollbar">
                  {filteredStudents.map(st => {
                    const isSelected = selectedStudentId === st.id;
                    const isAffordable = st.currentCoins >= boxCost;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        disabled={unboxingState === 'shaking'}
                        onClick={() => setSelectedStudentId(st.id)}
                        className={`w-full p-2 rounded-lg text-left flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{st.full_name}</span>
                        <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : isAffordable
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          🪙 {st.currentCoins} xu
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút bấm mở rương */}
              <button
                type="button"
                disabled={!canUnbox}
                onClick={handleStartUnbox}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-xl transition-all ${
                  canUnbox
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white hover:shadow-purple-300 hover:scale-102 active:scale-98 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Gift className="w-5 h-5" />
                <span>
                  {!selectedStudent
                    ? 'Chọn học sinh để mở hộp'
                    : selectedStudent.currentCoins < boxCost
                    ? `Chưa đủ ${boxCost} xu`
                    : `MỞ HỘP QUÀ NGAY (-${boxCost} XU)`}
                </span>
              </button>
            </>
          ) : (
            /* GIAI ĐOẠN 3: BẬT MÍ PHẦN QUÀ NHẬN ĐƯỢC */
            revealedItem && (
              <div className="space-y-4 animate-in zoom-in-90 duration-500">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center text-3xl mx-auto shadow-xl shadow-amber-200 animate-bounce">
                  ✨
                </div>

                <div className="space-y-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
                    revealedItem.rarity === 'legendary'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border border-amber-300'
                      : revealedItem.rarity === 'epic'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}>
                    {revealedItem.rarity === 'legendary' ? '🌟 VẬT PHẨM CỰC PHẨM' : revealedItem.rarity === 'epic' ? '💎 VẬT PHẨM HIẾM' : '🎁 VẬT PHẨM PHỔ THÔNG'}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 pt-1">
                    {revealedItem.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Trị giá thị trường: <strong className="text-amber-600">{revealedItem.value} Xu Thi Đua</strong> (Em chỉ tốn {boxCost} xu!)
                  </p>
                </div>

                {/* Thẻ minh họa quà */}
                <div className={`p-6 rounded-3xl bg-gradient-to-br ${revealedItem.color} text-white shadow-2xl space-y-2 relative overflow-hidden`}>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
                  <span className="text-6xl drop-shadow-md block">{revealedItem.icon}</span>
                  <div className="text-xs font-bold text-white/90">
                    Người mở: <strong>{selectedStudent?.full_name}</strong>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePrintVoucher}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center space-x-2 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>IN PHIẾU NHẬN QUÀ CHO HỌC SINH</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUnboxingState('idle');
                      setRevealedItem(null);
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Mở tiếp hộp khác
                  </button>
                </div>
              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
};

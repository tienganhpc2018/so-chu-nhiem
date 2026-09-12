import React, { useState, useMemo, useEffect } from 'react';
import { X, Gift, CheckCircle2, AlertCircle, Coins, Search, Sparkles, Printer, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../utils/soundEffects';
import { COLOR_THEMES } from '../constants/presetGifts';

export const RedeemGiftModal = ({
  isOpen,
  onClose,
  gift,
  students = [],
  redemptions = [],
  flashSale = null,
  onConfirmRedeem,
  onOpenVoucher
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideLimit, setOverrideLimit] = useState(false);
  const [redeemedResult, setRedeemedResult] = useState(null);

  // Reset khi mở modal hoặc đổi quà
  useEffect(() => {
    if (isOpen) {
      setSelectedStudentId('');
      setSearchQuery('');
      setOverrideLimit(false);
      setRedeemedResult(null);
    }
  }, [isOpen, gift?.id]);

  // Tính toán giá xu thực tế nếu đang trong Flash Sale Giờ Vàng
  const isFlashActive = flashSale?.active && new Date(flashSale?.endTime) > new Date();
  const discountPercent = isFlashActive ? Number(flashSale.discountPercent || 0) : 0;
  const originalCoins = gift?.requiredCoins ?? 0;
  const requiredCoins = isFlashActive
    ? Math.max(1, Math.round(originalCoins * (1 - discountPercent / 100)))
    : originalCoins;

  // Chuẩn hóa số xu của từng học sinh (coins hoặc total_stars)
  const studentsWithCoins = useMemo(() => {
    return (students || []).map(st => {
      const coins = Number(st.coins ?? st.total_stars ?? 0);
      const isEligible = coins >= requiredCoins;
      return {
        ...st,
        currentCoins: coins,
        isEligible
      };
    });
  }, [students, requiredCoins]);

  // Lọc theo tìm kiếm
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentsWithCoins;
    const q = searchQuery.toLowerCase();
    return studentsWithCoins.filter(st =>
      st.full_name?.toLowerCase().includes(q) ||
      String(st.code || '').toLowerCase().includes(q)
    );
  }, [studentsWithCoins, searchQuery]);

  // Kiểm tra giới hạn tần suất đổi quà của học sinh được chọn
  const limitInfo = useMemo(() => {
    if (!gift || !gift.redemptionLimit || gift.redemptionLimit === 'none' || !selectedStudentId) {
      return { exceeded: false };
    }

    const limit = gift.redemptionLimit;
    const now = new Date();

    const studentHistory = (redemptions || []).filter(
      r => r.studentId === selectedStudentId && (r.giftId === gift.id || r.giftName === gift.name)
    );

    if (studentHistory.length === 0) {
      return { exceeded: false };
    }

    const sorted = [...studentHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastRedeem = sorted[0];
    const lastDate = new Date(lastRedeem.timestamp);

    if (limit === 'week') {
      const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays < 7) {
        return {
          exceeded: true,
          limitType: '1 lần / tuần',
          lastDate: `${lastDate.getDate()}/${lastDate.getMonth() + 1}/${lastDate.getFullYear()}`
        };
      }
    } else if (limit === 'month') {
      const isSameMonth = now.getMonth() === lastDate.getMonth() && now.getFullYear() === lastDate.getFullYear();
      const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
      if (isSameMonth || diffDays < 30) {
        return {
          exceeded: true,
          limitType: '1 lần / tháng',
          lastDate: `${lastDate.getDate()}/${lastDate.getMonth() + 1}/${lastDate.getFullYear()}`
        };
      }
    } else if (limit === 'semester') {
      const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays < 120) {
        return {
          exceeded: true,
          limitType: '1 lần / học kỳ',
          lastDate: `${lastDate.getDate()}/${lastDate.getMonth() + 1}/${lastDate.getFullYear()}`
        };
      }
    }

    return { exceeded: false };
  }, [gift, selectedStudentId, redemptions]);

  if (!isOpen || !gift) return null;

  const theme = COLOR_THEMES.find(t => t.id === gift.color) || COLOR_THEMES[0];
  const selectedStudent = studentsWithCoins.find(s => s.id === selectedStudentId);
  const isOutOfStock = (gift.stock ?? 0) <= 0;
  const isLimitBlocked = limitInfo.exceeded && !overrideLimit;
  const canRedeem = selectedStudent && selectedStudent.isEligible && !isOutOfStock && !isLimitBlocked;

  const handleConfirm = () => {
    if (!canRedeem) return;

    soundFx?.playCorrect();
    soundFx?.playWinner();

    // Bắn pháo hoa ăn mừng
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#F59E0B', '#10B981', '#6366F1', '#EC4899']
    });

    const newRedemption = onConfirmRedeem?.({
      gift,
      student: selectedStudent,
      coinsSpent: requiredCoins
    });

    // Chuyển sang màn hình chúc mừng & in voucher
    setRedeemedResult({
      student: selectedStudent,
      gift,
      coinsSpent: requiredCoins,
      redemption: newRedemption
    });
  };

  const handlePrintVoucherFromSuccess = () => {
    if (!redeemedResult) return;
    onOpenVoucher?.({
      student: redeemedResult.student,
      gift: redeemedResult.gift,
      redemption: redeemedResult.redemption
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🎁</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                {redeemedResult ? 'Đổi Quà Thành Công! 🎉' : 'Xác Nhận Đổi Phần Thưởng'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {redeemedResult ? 'Phần thưởng đã được trừ xu và lưu vào nhật ký' : 'Chọn học sinh đủ xu để quy đổi quà tặng thi đua'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {redeemedResult ? (
          /* MÀN HÌNH CHÚC MỪNG & IN VOUCHER */
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-rose-200 animate-bounce">
              🎉
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">
                Đã Đổi Quà Thành Công Cho Em!
              </h3>
              <p className="text-sm font-black text-purple-700">
                {redeemedResult.student?.full_name}
              </p>
              <p className="text-xs text-slate-500">
                Đã trừ <strong>{redeemedResult.coinsSpent} xu</strong> cho món quà <strong>"{redeemedResult.gift?.name}"</strong>.
              </p>
            </div>

            {/* Thẻ tóm tắt */}
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between text-left">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {redeemedResult.gift?.image && (redeemedResult.gift.image.startsWith('http') || redeemedResult.gift.image.startsWith('data:image')) ? (
                    <img src={redeemedResult.gift.image} alt="gift" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>{redeemedResult.gift?.image || '🎁'}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">{redeemedResult.gift?.name}</h4>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    -{redeemedResult.coinsSpent} xu
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">Số dư xu còn lại</span>
                <span className="text-sm font-black text-emerald-600">
                  {(redeemedResult.student?.currentCoins ?? 0) - redeemedResult.coinsSpent} xu
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handlePrintVoucherFromSuccess}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center space-x-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>IN PHIẾU VOUCHER A6 TRAO TAY HỌC SINH</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Hoàn tất & Đóng cửa sổ
              </button>
            </div>
          </div>
        ) : (
          /* MÀN HÌNH CHỌN HỌC SINH ĐỔI QUÀ */
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Hộp tóm tắt phần quà */}
            <div className={`p-4 rounded-2xl border-2 ${theme.border} ${theme.bg} flex items-center space-x-4 shadow-sm`}>
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {gift.image && (gift.image.startsWith('data:image') || gift.image.startsWith('http')) ? (
                  <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{gift.image || '🎁'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${theme.badge}`}>
                    {gift.category || 'Dụng cụ học tập'}
                  </span>
                  {gift.redemptionLimit && gift.redemptionLimit !== 'none' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                      Tối đa 1 lần/{gift.redemptionLimit === 'week' ? 'tuần' : gift.redemptionLimit === 'month' ? 'tháng' : 'kỳ'}
                    </span>
                  )}
                </div>
                <h4 className="font-black text-base text-slate-800 truncate mt-0.5">
                  {gift.name}
                </h4>
                <div className="flex items-center space-x-3 text-xs font-bold mt-1">
                  {isFlashActive ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="line-through text-slate-400 font-medium text-xs">
                        {originalCoins} xu
                      </span>
                      <span className="text-rose-700 font-black flex items-center bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300">
                        🔥 {requiredCoins} xu (-{discountPercent}%)
                      </span>
                    </div>
                  ) : (
                    <span className="text-amber-700 font-extrabold flex items-center bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300/60">
                      🪙 Giá: {requiredCoins} xu
                    </span>
                  )}
                  <span className={gift.stock > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                    {gift.stock > 0 ? `Còn ${gift.stock} món` : 'Hết hàng'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dropdown chọn học sinh nhận quà */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Chọn học sinh nhận quà trong lớp:
              </label>

              {/* Ô tìm kiếm nhanh */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên học sinh nhanh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Danh sách học sinh chọn */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-200 custom-scrollbar">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(st => {
                    const isSelected = selectedStudentId === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(st.id);
                          setOverrideLimit(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all border ${
                          isSelected
                            ? 'bg-white border-rose-400 shadow-md ring-2 ring-rose-200'
                            : 'bg-white/80 border-slate-100 hover:bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">
                            {st.full_name ? st.full_name.charAt(0).toUpperCase() : 'H'}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-xs text-slate-800 block truncate">
                              {st.full_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Tổ {st.team_group || 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="font-black text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            🪙 {st.currentCoins} xu
                          </span>
                          {st.isEligible ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center">
                              ✅ Đủ xu
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md flex items-center">
                              ❌ Chưa đủ
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium">
                    Không tìm thấy học sinh phù hợp
                  </div>
                )}
              </div>
            </div>

            {/* Hộp cảnh báo giới hạn tần suất đổi quà */}
            {limitInfo.exceeded && selectedStudent && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-start space-x-2 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-black text-amber-950">Vượt quá giới hạn tần suất!</strong>
                    <span>
                      Phần quà này áp dụng giới hạn <strong>{limitInfo.limitType}</strong>. Em <strong>{selectedStudent.full_name}</strong> đã đổi vào ngày <strong>{limitInfo.lastDate}</strong>.
                    </span>
                  </div>
                </div>

                {/* Tùy chọn đặc cách của giáo viên */}
                <label className="flex items-center space-x-2 pt-2 border-t border-amber-200/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={overrideLimit}
                    onChange={(e) => setOverrideLimit(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    Thầy/Cô đặc cách phê duyệt cho học sinh đổi thêm lần này
                  </span>
                </label>
              </div>
            )}

            {/* Hộp thông báo trạng thái xu thông minh */}
            {selectedStudent && (
              <div className="animate-in fade-in duration-200">
                {selectedStudent.isEligible ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-black text-emerald-900">
                        Đủ điều kiện đổi quà! 🎉
                      </p>
                      <p>
                        Em <strong>{selectedStudent.full_name}</strong> hiện có <strong>{selectedStudent.currentCoins} xu</strong>. Sau khi đổi sẽ trừ <strong>{gift.requiredCoins} xu</strong> và còn lại <strong>{selectedStudent.currentCoins - gift.requiredCoins} xu</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-black text-rose-900">
                        Chưa đủ xu quy đổi!
                      </p>
                      <p>
                        Em <strong>{selectedStudent.full_name}</strong> hiện chỉ có <strong>{selectedStudent.currentCoins} xu</strong>, còn thiếu <strong>{gift.requiredCoins - selectedStudent.currentCoins} xu</strong> nữa để đổi phần quà này.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isOutOfStock && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Phần quà này hiện đã hết hàng trong kho. Thầy/Cô vui lòng cập nhật thêm tồn kho!</span>
              </div>
            )}

          </div>
        )}

        {/* Footer Actions (chỉ hiện khi chưa đổi quà) */}
        {!redeemedResult && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={!canRedeem}
              onClick={handleConfirm}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all ${
                canRedeem
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-200 transform hover:scale-105 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>XÁC NHẬN ĐỔI QUÀ</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

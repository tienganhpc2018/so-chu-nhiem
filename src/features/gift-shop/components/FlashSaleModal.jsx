import React, { useState, useEffect } from 'react';
import { X, Flame, Clock, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const FlashSaleModal = ({
  isOpen,
  onClose,
  currentFlashSale,
  onStartSale,
  onEndSale
}) => {
  const [discountPercent, setDiscountPercent] = useState(30);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [saleTitle, setSaleTitle] = useState('Ưu Đãi Giờ Vàng Đổi Quà');

  const isCurrentlyActive = currentFlashSale?.active && new Date(currentFlashSale?.endTime) > new Date();

  useEffect(() => {
    if (isOpen) {
      if (currentFlashSale?.active) {
        setDiscountPercent(currentFlashSale.discountPercent || 30);
        setSaleTitle(currentFlashSale.title || 'Ưu Đãi Giờ Vàng Đổi Quà');
      } else {
        setDiscountPercent(30);
        setDurationMinutes(30);
        setSaleTitle('Ưu Đãi Giờ Vàng Đổi Quà');
      }
    }
  }, [isOpen, currentFlashSale]);

  if (!isOpen) return null;

  const DISCOUNT_OPTIONS = [20, 30, 40, 50];
  const DURATION_OPTIONS = [
    { label: '15 phút', value: 15 },
    { label: '30 phút', value: 30 },
    { label: '45 phút', value: 45 },
    { label: '60 phút', value: 60 }
  ];

  const handleStart = (e) => {
    e.preventDefault();
    soundFx?.playWinner();
    const endTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    onStartSale({
      active: true,
      discountPercent: Number(discountPercent),
      durationMinutes: Number(durationMinutes),
      title: saleTitle.trim() || 'Ưu Đãi Giờ Vàng Đổi Quà',
      startTime: new Date().toISOString(),
      endTime
    });
    onClose();
  };

  const handleEnd = () => {
    soundFx?.playClick();
    onEndSale();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🔥
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Cấu Hình Flash Sale Giờ Vàng
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Giảm số xu quy đổi quà thi đua trong thời gian giới hạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleStart} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Thông báo nếu đang diễn ra */}
          {isCurrentlyActive && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-amber-900 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span>
                  Đang diễn ra: <strong>{currentFlashSale.title}</strong> (Giảm <strong>{currentFlashSale.discountPercent}%</strong>)
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnd}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-sm transition-colors shrink-0"
              >
                Dừng ngay
              </button>
            </div>
          )}

          {/* Tiêu đề chương trình */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Tên sự kiện giờ vàng:
            </label>
            <input
              type="text"
              value={saleTitle}
              onChange={(e) => setSaleTitle(e.target.value)}
              placeholder="VD: Giờ Vàng Đổi Quà Cuối Tuần..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          {/* Mức giảm giá (%) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Mức giảm giá xu:
              </label>
              <span className="text-sm font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-xl border border-rose-200">
                🔥 Giảm {discountPercent}%
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {DISCOUNT_OPTIONS.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDiscountPercent(val)}
                  className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
                    discountPercent === val
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  -{val}%
                </button>
              ))}
            </div>

            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full accent-rose-500 h-2 bg-slate-100 rounded-lg cursor-pointer mt-1"
            />
          </div>

          {/* Thời lượng đếm ngược */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Thời lượng diễn ra:
              </label>
              <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-xl border border-amber-200 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{durationMinutes} phút</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDurationMinutes(opt.value)}
                  className={`py-2 rounded-xl font-bold text-xs transition-all border ${
                    durationMinutes === opt.value
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hộp xem trước ví dụ */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 rounded-2xl text-xs space-y-1">
            <span className="font-black text-slate-800 block flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ví dụ quy đổi khi áp dụng:</span>
            </span>
            <p className="text-slate-600">
              Món quà <strong>10 xu</strong> ➔ chỉ còn <strong className="text-rose-600 font-black">{Math.max(1, Math.round(10 * (1 - discountPercent / 100)))} xu</strong>.
            </p>
            <p className="text-slate-600">
              Món quà <strong>25 xu</strong> ➔ chỉ còn <strong className="text-rose-600 font-black">{Math.max(1, Math.round(25 * (1 - discountPercent / 100)))} xu</strong>.
            </p>
          </div>

          {/* Nút hành động */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="flex-2 py-3 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-600 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-200 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>{isCurrentlyActive ? 'Cập Nhật Flash Sale' : 'Kích Hoạt Flash Sale'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { X, QrCode, Search, CheckCircle2, AlertTriangle, ShieldCheck, Gift, Calendar, User, Clock, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../utils/soundEffects';

export const VoucherScannerModal = ({
  isOpen,
  onClose,
  redemptions = [],
  onConfirmGive
}) => {
  const [inputCode, setInputCode] = useState('');
  const [searchedItem, setSearchedItem] = useState(null);
  const [searchStatus, setSearchStatus] = useState('idle'); // 'idle' | 'found' | 'already_given' | 'not_found'

  // Reset state khi mở modal
  useEffect(() => {
    if (isOpen) {
      setInputCode('');
      setSearchedItem(null);
      setSearchStatus('idle');
    }
  }, [isOpen]);

  // Chuẩn hóa mã voucher từ ID
  const getVoucherCode = (item) => {
    if (!item) return '';
    if (item.voucherCode) return item.voucherCode.toUpperCase();
    return `VC-${(item.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;
  };

  // Tra cứu mã voucher
  const handleSearchCode = (codeToSearch) => {
    const clean = (codeToSearch || inputCode).trim().toUpperCase();
    if (!clean) {
      setSearchedItem(null);
      setSearchStatus('idle');
      return;
    }

    soundFx?.playClick();

    // Tìm kiếm khớp mã voucher hoặc id
    const found = redemptions.find(item => {
      const vCode = getVoucherCode(item);
      return vCode === clean || item.id?.toUpperCase() === clean || clean.includes(vCode);
    });

    if (!found) {
      setSearchedItem(null);
      setSearchStatus('not_found');
      soundFx?.playDeduct();
      return;
    }

    setSearchedItem(found);
    if (found.status === 'given') {
      setSearchStatus('already_given');
      soundFx?.playDeduct();
    } else {
      setSearchStatus('found');
      soundFx?.playCorrect();
    }
  };

  // Xác nhận trao quà
  const handleConfirm = () => {
    if (!searchedItem) return;

    soundFx?.playWinner();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onConfirmGive?.(searchedItem.id);
    setSearchedItem(prev => ({
      ...prev,
      status: 'given',
      givenAt: new Date().toISOString()
    }));
    setSearchStatus('already_given');
  };

  // Danh sách các voucher đang chờ trao (chưa nhận quà)
  const pendingVouchers = useMemo(() => {
    return redemptions.filter(r => r.status !== 'given').slice(0, 5);
  }, [redemptions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              📷
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center space-x-1.5">
                <span>Quét & Xác Thực Voucher Quà</span>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                Kiểm tra tính hợp lệ, đánh dấu trao quà và chống tái sử dụng lần 2
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
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Ô nhập mã Voucher hoặc quét */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Nhập mã Voucher hoặc quét mã QR từ camera:
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="VD: VC-RED12345 hoặc red-..."
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    if (!e.target.value.trim()) setSearchStatus('idle');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCode()}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all uppercase"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearchCode()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
              >
                Kiểm tra
              </button>
            </div>
          </div>

          {/* KẾT QUẢ KIỂM TRA MÃ */}
          {searchStatus === 'found' && searchedItem && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-3xl space-y-3 animate-in zoom-in-95">
              <div className="flex items-center space-x-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    VOUCHER HỢP LỆ & ĐỦ ĐIỀU KIỆN TRAO QUÀ!
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Mã: <strong>{getVoucherCode(searchedItem)}</strong>
                  </span>
                </div>
              </div>

              {/* Chi tiết người nhận & phần quà */}
              <div className="p-3 bg-white rounded-2xl border border-emerald-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Học sinh thụ hưởng:</span>
                  <span className="font-black text-slate-800 text-sm">{searchedItem.studentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Phần quà quy đổi:</span>
                  <span className="font-black text-indigo-700">{searchedItem.giftName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Thời gian đổi:</span>
                  <span className="font-medium text-slate-600">
                    {new Date(searchedItem.timestamp).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Nút bấm xác nhận trao quà */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                <Gift className="w-4 h-4" />
                <span>XÁC NHẬN ĐÃ TRAO QUÀ CHO HỌC SINH</span>
              </button>
            </div>
          )}

          {searchStatus === 'already_given' && searchedItem && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-3xl space-y-2 animate-in zoom-in-95 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
                ⚠️
              </div>
              <h4 className="font-black text-sm text-rose-900">
                VOUCHER ĐÃ ĐƯỢC TRAO QUÀ TRƯỚC ĐÓ!
              </h4>
              <p className="text-xs text-rose-700 font-medium leading-relaxed">
                Món quà <strong>"{searchedItem.giftName}"</strong> đã được trao cho em <strong>{searchedItem.studentName}</strong>
                {searchedItem.givenAt ? ` vào lúc ${new Date(searchedItem.givenAt).toLocaleString('vi-VN')}` : ''}.
              </p>
              <div className="inline-block px-3 py-1 bg-white border border-rose-200 rounded-xl text-[11px] font-black text-rose-600">
                🚫 Phiếu này đã bị vô hiệu hóa để chống tái sử dụng!
              </div>
            </div>
          )}

          {searchStatus === 'not_found' && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-3xl text-center space-y-1 animate-in zoom-in-95">
              <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
              <h4 className="font-black text-xs text-amber-900">
                Không Tìm Thấy Mã Voucher Này!
              </h4>
              <p className="text-[11px] text-amber-700 font-medium">
                Vui lòng kiểm tra lại mã in trên phiếu A6 hoặc tra cứu trong bảng lịch sử.
              </p>
            </div>
          )}

          {/* Danh sách các voucher đang chờ trao quà gần đây */}
          {pendingVouchers.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Voucher Chờ Trao Quà Gần Đây ({pendingVouchers.length}):
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Bấm để kiểm tra nhanh</span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {pendingVouchers.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInputCode(getVoucherCode(item));
                      handleSearchCode(getVoucherCode(item));
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                      <div className="truncate">
                        <span className="font-black text-slate-800 block truncate">
                          {item.studentName}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          {item.giftName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[11px] font-black text-indigo-600 block">
                        {getVoucherCode(item)}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-md">
                        Chờ nhận
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Printer, X, Sparkles, Gift, QrCode, CheckCircle2, FileText, Layers } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const BatchVoucherModal = ({
  isOpen,
  onClose,
  selectedRedemptions = [],
  className = 'Chủ Nhiệm',
  teacherName = 'Nguyễn Văn Hải',
  schoolName = 'TRƯỜNG THCS CÁT MINH'
}) => {
  if (!isOpen || selectedRedemptions.length === 0) return null;

  // Chunk items into pages of 4 (4 A6 vouchers per A4 sheet)
  const pageSize = 4;
  const pages = [];
  for (let i = 0; i < selectedRedemptions.length; i += pageSize) {
    pages.push(selectedRedemptions.slice(i, i + pageSize));
  }

  const handlePrint = () => {
    soundFx?.playPrintVoucher();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto select-none">
      
      {/* CSS In ấn chuẩn A4 - 4 thẻ A6 trên 1 trang */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #batch-print-area, #batch-print-area * {
            visibility: visible;
          }
          #batch-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .a4-sheet {
            width: 198mm;
            min-height: 280mm;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 4mm;
            page-break-after: always;
            break-after: page;
            padding: 2mm;
            box-sizing: border-box;
          }
          .a6-voucher-card {
            box-sizing: border-box;
            border: 2px dashed #9333ea !important;
            page-break-inside: avoid;
            break-inside: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto relative flex flex-col max-h-[96vh] overflow-y-auto custom-scrollbar">
        
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center space-x-2">
                <span>In Hàng Loạt Phiếu Đổi Quà (Voucher A6)</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {selectedRedemptions.length} phiếu
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tự động dàn trang <strong>4 thẻ A6 trên mỗi tờ A4</strong> (Tổng cộng: {pages.length} trang giấy A4)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay ({pages.length} Trang A4)</span>
            </button>

            <button
              onClick={() => {
                soundFx?.playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Container / Print Area */}
        <div id="batch-print-area" className="py-4 space-y-6">
          {pages.map((pageItems, pageIdx) => (
            <div key={pageIdx} className="a4-sheet bg-white p-3 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pageItems.map((item, itemIdx) => {
                const dateObj = item.timestamp ? new Date(item.timestamp) : new Date();
                const dateStr = `Ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`;
                const voucherCode = item.id
                  ? `VC-${item.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`
                  : `VC-${String(pageIdx * 4 + itemIdx + 1).padStart(4, '0')}`;

                return (
                  <div
                    key={item.id || itemIdx}
                    className="a6-voucher-card bg-gradient-to-br from-white via-purple-50/20 to-amber-50/30 p-4 rounded-2xl border-2 border-dashed border-purple-400 flex flex-col justify-between text-slate-800 relative overflow-hidden"
                  >
                    {/* Header School & Title */}
                    <div>
                      <div className="text-center border-b border-purple-200 pb-2 mb-2">
                        <div className="text-[9px] font-black tracking-widest text-purple-900 uppercase">
                          {schoolName}
                        </div>
                        <div className="text-[8px] font-bold text-slate-500">
                          LỚP {className} • NIÊN KHÓA 2026 - 2027
                        </div>
                        <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 uppercase mt-0.5 tracking-wide">
                          ✦ PHIẾU ĐỔI QUÀ THI ĐUA ✦
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">Học sinh nhận:</span>
                          <span className="font-black text-slate-900 text-xs">{item.studentName}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">Phần quà:</span>
                          <span className="font-black text-purple-900 flex items-center space-x-1">
                            <span>🎁</span>
                            <span>{item.giftName}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">Số xu chi tiêu:</span>
                          <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                            -{item.coinsSpent} xu ⭐
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">Mã phiếu:</span>
                          <span className="font-mono font-black text-[10px] text-indigo-700">{voucherCode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Signature & Date */}
                    <div className="mt-3 pt-2 border-t border-purple-100 flex items-end justify-between">
                      <div className="flex items-center space-x-1.5 opacity-80">
                        <QrCode className="w-7 h-7 text-purple-800" />
                        <span className="text-[7px] text-slate-400 font-bold uppercase leading-tight">
                          QUÉT MÃ<br />XÁC THỰC
                        </span>
                      </div>

                      <div className="text-center">
                        <div className="text-[8px] italic text-slate-500">{dateStr}</div>
                        <div className="text-[9px] font-black text-purple-950 uppercase mt-0.5">
                          GV CHỦ NHIỆM
                        </div>
                        <div className="font-black text-[10px] text-slate-900 mt-4">
                          {teacherName}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Print Button Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 no-print">
          <span className="font-medium">
            💡 Mẹo: Khi hộp thoại in hiện ra, hãy chọn <strong>Khổ giấy: A4</strong>, <strong>Lề: Mặc định (hoặc Tối thiểu)</strong> và tích chọn <strong>Đồ họa nền (Background graphics)</strong> để in chuẩn đẹp nhất.
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 shrink-0 ml-3"
          >
            <Printer className="w-4 h-4" />
            <span>In {selectedRedemptions.length} Phiếu</span>
          </button>
        </div>

      </div>
    </div>
  );
};

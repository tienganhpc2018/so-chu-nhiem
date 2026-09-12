import React from 'react';
import { Printer, X, Sparkles, Gift, QrCode, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const GiftVoucherModal = ({
  isOpen,
  onClose,
  voucherData, // { student, gift, redemption, className, teacherName, schoolName }
}) => {
  if (!isOpen || !voucherData) return null;

  const {
    student = {},
    gift = {},
    redemption = {},
    className = 'Chủ Nhiệm',
    teacherName = 'Giáo viên Chủ Nhiệm',
    schoolName = 'TRƯỜNG THCS CÁT MINH'
  } = voucherData;

  const voucherCode = redemption.id
    ? `VC-${redemption.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`
    : `VC-${Date.now().toString().slice(-8)}`;

  const redemptionDate = redemption.timestamp ? new Date(redemption.timestamp) : new Date();
  const formattedDate = `Ngày ${redemptionDate.getDate()} tháng ${redemptionDate.getMonth() + 1} năm ${redemptionDate.getFullYear()}`;

  const handlePrint = () => {
    soundFx?.playCorrect();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto select-none">
      
      {/* CSS In ấn chuẩn khổ A6 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #voucher-print-area, #voucher-print-area * {
            visibility: visible;
          }
          #voucher-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            max-width: 105mm;
            margin: 0 auto;
            padding: 12mm 10mm;
            border: 2px dashed #6366f1 !important;
            box-shadow: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto relative flex flex-col max-h-[95vh] overflow-y-auto custom-scrollbar">
        
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Thẻ Voucher Đổi Quà (A6)</h3>
              <p className="text-[11px] text-slate-500 font-medium">Phiếu trao tay hoặc lưu kỷ niệm thi đua</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu A6</span>
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

        {/* Voucher A6 Printable Card */}
        <div
          id="voucher-print-area"
          className="mt-4 p-5 bg-gradient-to-br from-amber-50/50 via-white to-purple-50/50 text-slate-900 border-2 border-dashed border-indigo-400 rounded-3xl text-center space-y-3.5 relative shadow-inner"
        >
          {/* Top Decorative Header */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {schoolName} • LỚP {className}
            </div>
            <h2 className="text-lg font-black text-indigo-900 uppercase tracking-tight flex items-center justify-center space-x-1.5 pt-1">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>PHIẾU VOUCHER ĐỔI QUÀ</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h2>
            <div className="text-[10px] font-extrabold text-amber-700 bg-amber-100/70 inline-block px-3 py-0.5 rounded-full">
              ĐẶC QUYỀN KHEN THƯỞNG THI ĐUA NỀ NẾP
            </div>
          </div>

          {/* Student Info Box */}
          <div className="p-3 bg-white/90 rounded-2xl border border-indigo-100 text-left space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Học sinh thụ hưởng</span>
              <span className="text-indigo-600 font-extrabold">Tổ {student.team_group || 1}</span>
            </div>
            <div className="flex items-center space-x-2.5 pt-0.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                {student.full_name ? student.full_name.charAt(0) : '🎓'}
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800 leading-tight">
                  {student.full_name || 'Học sinh'}
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Mã số HS: {student.code || student.id?.slice(0, 6) || 'HS-001'}
                </p>
              </div>
            </div>
          </div>

          {/* Gift Info Box */}
          <div className="p-3.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl text-left space-y-1 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-wide block">
                🎁 Phần quà / Đặc quyền đã đổi:
              </span>
              <h3 className="text-sm sm:text-base font-black text-purple-950">
                {gift.name || redemption.giftName || 'Phần quà bí mật'}
              </h3>
              <div className="inline-flex items-center space-x-1 text-[11px] font-extrabold text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-md">
                <span>Trị giá:</span>
                <span>{redemption.coinsSpent ?? gift.requiredCoins ?? 0} Xu Thi Đua</span>
              </div>
            </div>

            {/* Gift Icon / Image */}
            <div className="w-12 h-12 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-2xl shrink-0 shadow-inner overflow-hidden">
              {gift.image && (gift.image.startsWith('http') || gift.image.startsWith('data:image')) ? (
                <img src={gift.image} alt="gift" className="w-full h-full object-cover" />
              ) : (
                <span>{gift.image || '🎁'}</span>
              )}
            </div>
          </div>

          {/* Real QR Code & Barcode */}
          <div className="p-2.5 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(voucherCode)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                  }}
                />
                <QrCode className="w-9 h-9 text-slate-800 hidden" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Mã xác thực</span>
                <span className="font-mono text-xs font-black text-indigo-700 tracking-wider">
                  {voucherCode}
                </span>
                <span className="text-[9px] text-emerald-600 font-bold block flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 inline" /> Chỉ có giá trị 1 lần
                </span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="flex flex-col items-end space-y-0.5">
              <div className="flex space-x-0.5 h-6 items-end">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3].map((w, i) => (
                  <span
                    key={i}
                    style={{ width: `${w}px` }}
                    className="h-full bg-slate-800 rounded-xs inline-block"
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono text-slate-400">VOUCHER-SINGLE-USE</span>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-2 border-t border-slate-200 flex items-end justify-between text-left">
            <div className="text-[9px] text-slate-400 leading-tight space-y-0.5">
              <div>* Xuất trình phiếu cho GVCN khi nhận quà.</div>
              <div>* Phiếu chỉ có giá trị cho 1 lần đổi quà.</div>
            </div>

            <div className="text-center space-y-0.5 shrink-0 pl-2">
              <div className="italic text-slate-500 text-[10px]">
                {formattedDate}
              </div>
              <div className="font-black text-slate-800 text-[10px] uppercase">
                GVCN XÁC NHẬN
              </div>
              <div className="h-5"></div>
              <div className="font-black text-indigo-900 text-xs">
                {teacherName}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 no-print">
          <span className="text-[11px]">Khuyên dùng: Chọn khổ giấy <strong>A6</strong> khi in</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

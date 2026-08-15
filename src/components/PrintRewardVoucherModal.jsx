import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, Gift, Sparkles } from 'lucide-react';

export const PrintRewardVoucherModal = ({ isOpen, onClose, student, reward, currentClass, teacherProfile }) => {
  if (!isOpen || !student || !reward) return null;

  const handlePrint = () => {
    soundFx.playCorrect();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto select-none">
      
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-200 my-auto relative flex flex-col">
        
        {/* Sticky Action Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-black text-slate-800">In Thẻ Voucher Đổi Quà (A6)</h3>
              <p className="text-xs text-slate-400 font-semibold">Bản in A6 trao tay cho học sinh khi đổi xu thành công.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-purple-glow flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Voucher (A6/PDF)</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-3 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page A6 */}
        <div className="p-6 print-area bg-gradient-to-br from-purple-50 via-white to-amber-50 text-slate-900 border-4 border-dashed border-purple-500 rounded-3xl text-center space-y-4 relative my-2 shadow-inner">
          
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            TRƯỜNG THCS CÁT MINH • LỚP {currentClass?.name || '8A5'}
          </div>

          <div className="py-1">
            <h2 className="text-xl font-black text-purple-900 uppercase tracking-tight flex items-center justify-center space-x-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>THẺ VOUCHER ĐỔI QUÀ</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <div className="text-[11px] font-bold text-amber-700 mt-0.5">
              ĐẶC QUYỀN KHEN THƯỞNG HỌC SINH THI ĐUA
            </div>
          </div>

          {/* Student Info */}
          <div className="p-3 bg-white/90 rounded-2xl border border-purple-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block">Học sinh thụ hưởng:</span>
            <h3 className="text-lg font-black text-purple-950">{student.full_name}</h3>
            <span className="text-xs font-bold text-purple-700 block">Tổ {student.team_group || 1}</span>
          </div>

          {/* Gift Details */}
          <div className="p-3 bg-amber-100/80 border border-amber-300 rounded-2xl space-y-1 text-xs">
            <span className="font-bold text-amber-900 block">🎁 PHẦN QUÀ / ĐẶC QUYỀN ĐÃ ĐỔI:</span>
            <h4 className="text-base font-black text-amber-950">{reward.title}</h4>
            <span className="text-[10px] font-bold text-amber-800 block">Giá trị: {reward.cost} Xu Thi Đua Nề Nếp</span>
          </div>

          {/* Footer Date & Sign */}
          <div className="pt-3 border-t border-slate-300 flex justify-between items-end text-xs text-left">
            <div className="text-[9px] text-slate-400">
              * Mã phiếu: VOUCHER-{Date.now().toString().slice(-6)}
            </div>

            <div className="text-center space-y-0.5">
              <div className="italic text-slate-500 text-[10px]">
                Ngày {new Date().getDate()}/{new Date().getMonth() + 1}/{new Date().getFullYear()}
              </div>
              <div className="font-extrabold text-slate-900 text-[11px] uppercase">GVCN XÁC NHẬN</div>
              <div className="h-6"></div>
              <div className="font-black text-purple-950 text-xs">
                {teacherProfile?.full_name || 'Nguyễn Văn Hải'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

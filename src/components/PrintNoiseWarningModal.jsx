import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, AlertTriangle, ShieldAlert } from 'lucide-react';

export const PrintNoiseWarningModal = ({ isOpen, onClose, currentClass, teacherProfile }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playDeduct();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 my-auto relative flex flex-col">
        
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 border-b border-slate-200 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-coral-600" />
            <div>
              <h3 className="text-base font-black text-slate-800">In Phiếu Nhắc Nhở Trật Tự</h3>
              <p className="text-xs text-slate-400 font-semibold">In khổ A6 dán góc bàn học sinh làm ồn.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Thẻ (A6/PDF)</span>
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

        {/* Printable Card Area */}
        <div className="p-6 print-area bg-red-50/50 border-4 border-dashed border-coral-400 rounded-3xl text-center space-y-4 my-2">
          
          <div className="text-[10px] font-black uppercase text-coral-800">
            TRƯỜNG THCS CÁT MINH • LỚP {currentClass?.name || '8A5'}
          </div>

          <div>
            <h2 className="text-xl font-black text-coral-700 uppercase">PHIẾU NHẮC NHỞ GIỮ TRẬT TỰ</h2>
            <p className="text-xs font-bold text-slate-600">Yêu cầu học sinh chấp hành nghiêm túc nội quy nề nếp</p>
          </div>

          <div className="p-3 bg-white border border-coral-200 rounded-2xl text-xs font-bold text-slate-800 space-y-2 text-left">
            <div>• Họ và tên học sinh: ................................................................</div>
            <div>• Tổ thi đua: ............................................................................</div>
            <div>• Hành vi: Làm mất trật tự quá 3 lần trong tiết học</div>
            <div>• Biện pháp: Nhắc nhở dán góc bàn & trừ 1 xu thi đua</div>
          </div>

          <div className="pt-2 text-xs flex justify-between items-end">
            <span className="text-[10px] text-slate-400">Ngày: {new Date().toLocaleDateString('vi-VN')}</span>
            <div className="text-center font-bold">
              <span className="block text-[10px] text-slate-500">GVCN XÁC NHẬN</span>
              <span className="font-black text-purple-950 text-xs mt-4 block">{teacherProfile?.full_name || 'Nguyễn Văn Hải'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, Award, Sparkles, Star } from 'lucide-react';

export const PrintWinnerCardModal = ({ isOpen, onClose, winnerStudent, rewardTitle, currentClass, teacherProfile }) => {
  if (!isOpen || !winnerStudent) return null;

  const handlePrint = () => {
    soundFx.playCorrect();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 my-auto relative flex flex-col max-h-[92vh]">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 border-b border-slate-200 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-black text-slate-800">In Thẻ Tuyên Dương Học Sinh</h3>
              <p className="text-xs text-slate-400 font-semibold">Xuất file in PDF mang về khoe Phụ huynh.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transform hover:scale-105 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Thẻ (A5/PDF)</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-3 py-2 bg-slate-100 text-slate-700 hover:text-red-600 font-extrabold text-xs rounded-xl flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Đóng</span>
            </button>
          </div>
        </div>

        {/* Printable Certificate Card */}
        <div className="overflow-y-auto flex-1 p-6 print-area bg-gradient-to-b from-amber-50/50 via-white to-purple-50/50 font-sans text-slate-900 border-4 border-double border-amber-500 rounded-3xl relative my-2 text-center space-y-4 shadow-inner">
          
          <div className="absolute top-2 left-2 text-amber-600 text-xs">❖</div>
          <div className="absolute top-2 right-2 text-amber-600 text-xs">❖</div>
          <div className="absolute bottom-2 left-2 text-amber-600 text-xs">❖</div>
          <div className="absolute bottom-2 right-2 text-amber-600 text-xs">❖</div>

          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            TRƯỜNG THCS CÁT MINH • LỚP {currentClass?.name || '8A5'}
          </div>

          <div className="py-2">
            <h2 className="text-2xl font-black text-amber-700 uppercase tracking-tight">
              GIẤY CÔNG NHẬN THI ĐUA
            </h2>
            <div className="text-xs font-bold text-slate-600 tracking-wide mt-0.5">
              HỌC SINH MAY MẮN TRÚNG THƯỞNG VÒNG QUAY
            </div>
          </div>

          {/* Winner Avatar Showcase */}
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={winnerStudent.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerStudent.id}`}
              alt={winnerStudent.full_name}
              className="w-full h-full object-cover rounded-2xl border-4 border-amber-400 shadow-md bg-white"
            />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">{winnerStudent.full_name}</h3>
            <p className="text-xs font-bold text-purple-700">Tổ {winnerStudent.team_group || 1}</p>
          </div>

          <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-2xl text-xs font-black text-amber-950">
            🎁 Phần thưởng đính kèm: {rewardTitle || '+5 Xu Sao Thi Đua Nề Nếp'}
          </div>

          {/* Footer Date & Sign */}
          <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-xs text-left">
            <div className="text-[10px] text-slate-400">
              * Tuyên dương ngày: {new Date().toLocaleDateString('vi-VN')}
            </div>

            <div className="text-center space-y-1">
              <div className="italic text-slate-500 text-[11px]">
                Cát Minh, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
              <div className="font-extrabold text-slate-900 uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
              <div className="h-10"></div>
              <div className="font-black text-purple-950 text-sm">
                {teacherProfile?.full_name || 'Nguyễn Văn Hải'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

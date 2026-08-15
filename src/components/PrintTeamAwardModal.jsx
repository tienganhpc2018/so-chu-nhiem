import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, Award } from 'lucide-react';

export const PrintTeamAwardModal = ({ isOpen, onClose, currentClass, winningTeam = 1, totalCoins = 0, teacherProfile }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playCorrect();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto select-none">
      
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-amber-200 my-auto relative flex flex-col">
        
        {/* Sticky Action Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-black text-slate-800">In Giấy Khen Tổ Xuất Sắc (A5)</h3>
              <p className="text-xs text-slate-400 font-semibold">Bản in A5 viền hoa văn vàng khen thưởng Tổ dẫn đầu.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Giấy Khen (A5/PDF)</span>
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

        {/* Printable Certificate Page A5 */}
        <div className="p-8 print-area bg-gradient-to-b from-amber-50 via-white to-purple-50 text-slate-900 border-8 border-double border-amber-500 rounded-3xl text-center space-y-5 relative my-2 shadow-inner">
          
          <div className="absolute top-3 left-3 text-amber-600 text-sm">❖</div>
          <div className="absolute top-3 right-3 text-amber-600 text-sm">❖</div>
          <div className="absolute bottom-3 left-3 text-amber-600 text-sm">❖</div>
          <div className="absolute bottom-3 right-3 text-amber-600 text-sm">❖</div>

          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            TRƯỜNG THCS CÁT MINH • LỚP {currentClass?.name || '8A5'}
          </div>

          <div className="py-2">
            <h2 className="text-2xl font-black text-amber-700 uppercase tracking-tight">
              GIẤY CÔNG NHẬN THI ĐUA
            </h2>
            <div className="text-xs font-bold text-slate-600 tracking-wide mt-1">
              TUYÊN DƯƠNG TẬP THỂ TỔ XUẤT SẮC DẪN ĐẦU
            </div>
          </div>

          {/* Trophy Emblem */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center border-4 border-amber-300 shadow-md">
            <Award className="w-12 h-12" />
          </div>

          <div>
            <h3 className="text-3xl font-black text-purple-950 uppercase tracking-tight">
              TẬP THỂ TỔ {winningTeam}
            </h3>
            <p className="text-xs font-black text-amber-700 mt-1">
              ★ TỔ DẪN ĐẦU PHONG TRÀO THI ĐƯA TÍCH XU TỔ LỚP HỌC ★
            </p>
          </div>

          <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-2xl text-xs font-black text-amber-950 max-w-sm mx-auto">
            🏆 Thành tích tích lũy: {totalCoins} Xu Sao Nề Nếp Tiếng Anh
          </div>

          {/* Footer Date & Sign */}
          <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-xs text-left">
            <div className="text-[10px] text-slate-400">
              * Tuyên dương tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
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

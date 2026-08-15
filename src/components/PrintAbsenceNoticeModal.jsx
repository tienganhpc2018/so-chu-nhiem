import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, BookOpen, UserX } from 'lucide-react';

export const PrintAbsenceNoticeModal = ({ isOpen, onClose, student, currentClass, teacherProfile }) => {
  if (!isOpen || !student) return null;

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
            <UserX className="w-5 h-5 text-coral-600" />
            <div>
              <h3 className="text-base font-black text-slate-800">In Phiếu Báo Bài HS Vắng Mặt (A6)</h3>
              <p className="text-xs text-slate-400 font-semibold">Bản in A6 dặn dò bài tập Tiếng Anh cho học sinh nghỉ học.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu (A6/PDF)</span>
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
        <div className="p-6 print-area bg-gradient-to-br from-purple-50 via-white to-amber-50 text-slate-900 border-4 border-dashed border-purple-600 rounded-3xl text-center space-y-4 relative my-2 shadow-inner">
          
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            TRƯỜNG THCS CÁT MINH • LỚP {currentClass?.name || '8A5'}
          </div>

          <div className="py-1">
            <h2 className="text-xl font-black text-purple-900 uppercase tracking-tight flex items-center justify-center space-x-1">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>PHIẾU BÁO BÀI HỌC VẮNG MẶT</span>
            </h2>
            <div className="text-[11px] font-bold text-slate-600 mt-0.5">
              NỘI DUNG NGHỈ HỌC & BÀI TẬP VỀ NHÀ TIẾNG ANH
            </div>
          </div>

          {/* Student Info */}
          <div className="p-3 bg-white/90 rounded-2xl border border-purple-100 text-left space-y-1 text-xs">
            <div className="flex justify-between font-black">
              <span className="text-slate-800">Học sinh vắng: {student.full_name}</span>
              <span className="text-purple-700">Tổ {student.team_group || 1}</span>
            </div>
            <div className="text-[11px] font-bold text-slate-500">
              Ngày nghỉ: {new Date().toLocaleDateString('vi-VN')} • Tiết: Tiếng Anh 8
            </div>
          </div>

          {/* Assignment Note */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-left space-y-1.5 text-xs font-bold text-amber-950">
            <span className="font-black block uppercase text-amber-900">📝 Nội dung dặn dò bài tập:</span>
            <p>1. Xem lại bài học Unit 8: Our Customs and Traditions trong SGK.</p>
            <p>2. Hoàn thiện bài tập phần A & B trong Sách bài tập Tiếng Anh 8.</p>
            <p>3. Học thuộc 10 từ vựng chủ đề lễ hội chuẩn bị cho tiết sau.</p>
          </div>

          {/* Footer Date & Sign */}
          <div className="pt-3 border-t border-slate-300 flex justify-between items-end text-xs text-left">
            <div className="text-[9px] text-slate-400">
              * Yêu cầu xem lại bài và nộp lại bài tập
            </div>

            <div className="text-center space-y-0.5">
              <div className="italic text-slate-500 text-[10px]">
                Ngày {new Date().getDate()}/{new Date().getMonth() + 1}/{new Date().getFullYear()}
              </div>
              <div className="font-extrabold text-slate-900 text-[11px] uppercase">GVCN TIẾNG ANH</div>
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

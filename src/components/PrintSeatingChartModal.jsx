import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { getSmartDisplayName } from '../utils/nameFormatter';
import { Printer, X } from 'lucide-react';

export const PrintSeatingChartModal = ({ isOpen, onClose, currentClass, students = [], teacherProfile }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playCorrect();
    window.print();
  };

  const dayCount = 4; // 4 Dãy Bàn
  const rows = [1, 2, 3, 4];
  const cols = [1, 2, 3, 4];

  // Get student at Double Desk (row r, col c, seatPos 1=Left, 2=Right)
  const getStudentAtSeatPos = (r, c, seatPos) => {
    return students.find(s => Number(s.seat_row) === r && Number(s.seat_col) === (c - 1) * 2 + seatPos);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      
      {/* Modal Card Container */}
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-purple-100 my-auto relative flex flex-col max-h-[92vh]">
        
        {/* SINGLE STICKY HEADER - Only 1 Close button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 border-b border-slate-200 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">In Sơ Đồ Chỗ Ngồi Khổ Giấy A4</h3>
              <p className="text-xs text-slate-400 font-semibold">Bấm "In Ngay" để xuất PDF/Máy in hoặc bấm "Đóng" để trở lại.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-purple-glow flex items-center space-x-1.5 transform hover:scale-105 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay (Khổ A4)</span>
            </button>

            {/* ONE Clean Close Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-300 font-extrabold text-xs rounded-xl flex items-center space-x-1 transition-all"
              title="Đóng trang"
            >
              <X className="w-4 h-4" />
              <span>Đóng trang (X)</span>
            </button>
          </div>
        </div>

        {/* Printable A4 Document Content - Clean Sans-Serif Font with Proper Accents */}
        <div className="overflow-y-auto flex-1 p-6 print-area bg-white font-sans text-slate-900 border-4 border-double border-purple-900 rounded-2xl relative my-2">
          
          {/* Decorative Ornaments */}
          <div className="absolute top-2 left-2 text-purple-800 text-xs">❖</div>
          <div className="absolute top-2 right-2 text-purple-800 text-xs">❖</div>
          <div className="absolute bottom-2 left-2 text-purple-800 text-xs">❖</div>
          <div className="absolute bottom-2 right-2 text-purple-800 text-xs">❖</div>

          {/* Header Info - Clean Unicode Vietnamese Accents */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-purple-900 mb-6">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
              TRƯỜNG THCS CÁT MINH • KHỐI {currentClass?.grade_level || 8}
            </div>
            <h1 className="text-2xl font-black text-purple-950 uppercase tracking-tight">
              SƠ ĐỒ CHỖ NGỒI HỌC SINH LỚP {currentClass?.name || '8A5'}
            </h1>
            <div className="text-xs font-semibold text-slate-700 flex justify-center space-x-4 pt-1">
              <span>Niên khóa: {currentClass?.academic_year || '2025 - 2026'}</span>
              <span>•</span>
              <span>GVCN: {teacherProfile?.full_name || 'Nguyễn Văn Hải'} (GV Tiếng Anh)</span>
              <span>•</span>
              <span>Sĩ số: {students.length} học sinh</span>
            </div>
          </div>

          {/* Blackboard Banner */}
          <div className="w-full bg-slate-900 text-white rounded-xl p-3 text-center mb-4 shadow-md border-2 border-amber-400">
            <span className="text-sm font-black tracking-widest text-amber-300">
              ✦ BẢNG ĐEN / BÀN GIÁO VIÊN CHỦ NHIỆM ✦
            </span>
          </div>

          {/* 4 DÃY BÀN ĐÔI (2 HỌC SINH / 1 BÀN) */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {cols.map(c => (
              <div key={`p-col-${c}`} className="space-y-3">
                <div className="bg-purple-800 text-white font-black text-xs py-1 text-center rounded-lg uppercase tracking-wider">
                  DÃY {c}
                </div>

                {rows.map(r => {
                  const studentLeft = getStudentAtSeatPos(r, c, 1);
                  const studentRight = getStudentAtSeatPos(r, c, 2);
                  const deskNum = (r - 1) * 4 + c;

                  return (
                    <div
                      key={`p-desk-${r}-${c}`}
                      className="border-2 border-purple-200 rounded-xl p-2 bg-slate-50/50 space-y-1"
                    >
                      <div className="text-[9px] font-extrabold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded flex justify-between">
                        <span>Bàn Đôi {deskNum}</span>
                        <span>Hàng {r}</span>
                      </div>

                      {/* 2 Seats per Desk */}
                      <div className="grid grid-cols-2 gap-1 text-center min-h-[50px]">
                        
                        {/* Seat Left */}
                        <div className="p-1 bg-white rounded border border-purple-100 flex flex-col justify-center">
                          {studentLeft ? (
                            <div>
                              <span className="text-xs font-black text-slate-900 block truncate">
                                {getSmartDisplayName(studentLeft.full_name, students)}
                              </span>
                              <span className="text-[8px] text-purple-700 font-bold block">
                                Tổ {studentLeft.team_group || 1} {studentLeft.has_glasses ? '👓' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] italic text-slate-300">Trống</span>
                          )}
                        </div>

                        {/* Seat Right */}
                        <div className="p-1 bg-white rounded border border-purple-100 flex flex-col justify-center">
                          {studentRight ? (
                            <div>
                              <span className="text-xs font-black text-slate-900 block truncate">
                                {getSmartDisplayName(studentRight.full_name, students)}
                              </span>
                              <span className="text-[8px] text-purple-700 font-bold block">
                                Tổ {studentRight.team_group || 1} {studentRight.has_glasses ? '👓' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] italic text-slate-300">Trống</span>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Signature Area */}
          <div className="flex justify-between items-end pt-6 border-t border-slate-300 text-xs">
            <div className="text-slate-500 space-y-1">
              <div>* Quy tắc: Bàn đôi 2 em/bàn. Cận thị xếp Hàng 1-2.</div>
              <div>* Sơ đồ áp dụng từ ngày: {new Date().toLocaleDateString('vi-VN')}</div>
            </div>

            <div className="text-center space-y-1 pr-6">
              <div className="italic text-slate-600">
                Cát Minh, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
              <div className="font-extrabold text-slate-900 uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
              <div className="h-16"></div>
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

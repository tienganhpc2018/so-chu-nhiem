import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, ShieldCheck } from 'lucide-react';

export const PrintSeatingChartModal = ({ isOpen, onClose, currentClass, students = [], teacherProfile }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playCorrect();
    window.print();
  };

  const dayCount = 4;
  const rows = [1, 2, 3, 4];
  const cols = [1, 2, 3, 4];

  const getStudentAtSeat = (r, c) => {
    return students.find(s => Number(s.seat_row) === r && Number(s.seat_col) === c);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-purple-100 my-8">
        
        {/* Modal Controls Header (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-black text-slate-800">Xem Trước & In Sơ Đồ Khổ Giấy A4</h3>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-purple-glow flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay (Khổ A4)</span>
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Container Area */}
        <div className="print-area bg-white p-8 border-4 border-double border-purple-900 rounded-2xl text-slate-900 font-serif relative">
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-purple-800 text-xs">❖</div>
          <div className="absolute top-2 right-2 text-purple-800 text-xs">❖</div>
          <div className="absolute bottom-2 left-2 text-purple-800 text-xs">❖</div>
          <div className="absolute bottom-2 right-2 text-purple-800 text-xs">❖</div>

          {/* School & Header Info */}
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
          <div className="w-full bg-slate-900 text-white rounded-xl p-3 text-center mb-4 font-sans shadow-md border-2 border-amber-400">
            <span className="text-sm font-black tracking-widest text-amber-300">
              ✦ BẢNG ĐEN / BÀN GIÁO VIÊN CHỦ NHIỆM ✦
            </span>
          </div>

          {/* 4 Rows Seating Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8 font-sans">
            {cols.map(c => (
              <div key={`p-col-${c}`} className="space-y-3">
                <div className="bg-purple-800 text-white font-extrabold text-xs py-1 text-center rounded-lg uppercase tracking-wider">
                  DÃY {c}
                </div>

                {rows.map(r => {
                  const student = getStudentAtSeat(r, c);
                  const deskNum = (r - 1) * 4 + c;
                  return (
                    <div
                      key={`p-cell-${r}-${c}`}
                      className="border-2 border-purple-200 rounded-xl p-2 text-center min-h-[70px] flex flex-col justify-between bg-slate-50/50"
                    >
                      <div className="text-[9px] font-bold text-slate-400 flex justify-between">
                        <span>Bàn {deskNum}</span>
                        <span>Hàng {r}</span>
                      </div>

                      {student ? (
                        <div className="my-1">
                          <span className="text-xs font-black text-slate-900 block line-clamp-1">
                            {student.full_name}
                          </span>
                          <span className="text-[9px] text-purple-700 font-bold block">
                            Tổ {student.team_group || 1} {student.has_glasses ? '👓 (Cận)' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] italic text-slate-300 my-auto">Bàn Trống</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Signature Area */}
          <div className="flex justify-between items-end pt-6 border-t border-slate-300 font-sans text-xs">
            <div className="text-slate-500 space-y-1">
              <div>* Ghi chú: Cận thị xếp bàn đầu (Hàng 1-2).</div>
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

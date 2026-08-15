import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, Award, BarChart3 } from 'lucide-react';

export const PrintMonthlyAnalyticsModal = ({ isOpen, onClose, currentClass, students = [], teacherProfile }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playCorrect();
    window.print();
  };

  const sortedStudents = [...students].sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0));

  // Compute 4 Team total stars
  const teamTotals = [1, 2, 3, 4].map(tNum => {
    const teamSt = students.filter(s => Number(s.team_group) === tNum);
    const sum = teamSt.reduce((acc, curr) => acc + (curr.total_stars || 0), 0);
    return { team: tNum, total: sum, count: teamSt.length };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-purple-100 my-auto relative flex flex-col max-h-[92vh]">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 border-b border-slate-200 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-black text-slate-800">In Báo Cáo Thống Kê Thi Đua A4</h3>
              <p className="text-xs text-slate-400 font-semibold">Xuất file PDF viền hoa văn dán bảng tin lớp.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-purple-glow flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Báo Cáo (A4/PDF)</span>
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

        {/* Printable Certificate Page */}
        <div className="overflow-y-auto flex-1 p-8 print-area bg-gradient-to-b from-purple-50/40 via-white to-amber-50/40 font-sans text-slate-900 border-4 border-double border-purple-600 rounded-3xl relative my-2 space-y-6">
          
          {/* Top Header */}
          <div className="flex justify-between items-start border-b pb-4 border-slate-200 text-xs">
            <div>
              <div className="font-extrabold text-purple-900 uppercase">TRƯỜNG THCS CÁT MINH</div>
              <div className="font-black text-slate-800">TẬP THỂ LỚP: {currentClass?.name || '8A5'}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-500">BÁO CÁO THI ĐƯA HỌC KỲ I</div>
              <div className="font-mono text-slate-400">Năm học: 2025 - 2026</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h2 className="text-2xl font-black text-purple-900 uppercase tracking-tight">
              BẢNG TỔNG KẾT XU THI ĐƯA & THỨ HẠNG THÁNG
            </h2>
            <p className="text-xs font-bold text-slate-500">Khen thưởng các cá nhân và Tổ xuất sắc dẫn đầu nề nếp lớp học</p>
          </div>

          {/* Top 4 Teams Summary */}
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            {teamTotals.map(t => (
              <div key={t.team} className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="font-black text-purple-900 block">TỔ {t.team}</span>
                <span className="text-lg font-black text-amber-600 block">{t.total} xu</span>
                <span className="text-[10px] text-slate-500 font-bold">{t.count} thành viên</span>
              </div>
            ))}
          </div>

          {/* Student Ranks Table */}
          <div className="space-y-2">
            <div className="text-xs font-black text-slate-800 uppercase">DANH SÁCH THỨ HẠNG HỌC SINH:</div>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-purple-100 text-purple-950 font-black">
                  <th className="p-2 border border-slate-200 text-center">Hạng</th>
                  <th className="p-2 border border-slate-200">Họ và tên học sinh</th>
                  <th className="p-2 border border-slate-200 text-center">Tổ</th>
                  <th className="p-2 border border-slate-200 text-center">Giới tính</th>
                  <th className="p-2 border border-slate-200 text-center">Tổng Xu</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((st, idx) => (
                  <tr key={st.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}>
                    <td className="p-2 border border-slate-200 text-center font-black">{idx + 1}</td>
                    <td className="p-2 border border-slate-200 font-bold text-slate-800">{st.full_name}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">Tổ {st.team_group || 1}</td>
                    <td className="p-2 border border-slate-200 text-center font-semibold">
                      {st.gender === 'male' || st.gender === 'Nam' ? 'Nam' : 'Nữ'}
                    </td>
                    <td className="p-2 border border-slate-200 text-center font-black text-amber-700">{st.total_stars || 0} xu</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Date & Sign */}
          <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-xs">
            <div className="italic text-slate-500">
              * Báo cáo lập ngày: {new Date().toLocaleDateString('vi-VN')}
            </div>

            <div className="text-center space-y-1">
              <div className="italic text-slate-500">
                Cát Minh, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
              <div className="font-extrabold text-slate-900 uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
              <div className="h-12"></div>
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

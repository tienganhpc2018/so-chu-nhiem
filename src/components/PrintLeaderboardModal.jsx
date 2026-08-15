import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, Trophy, Star, Crown } from 'lucide-react';

export const PrintLeaderboardModal = ({ isOpen, onClose, currentClass, students = [], teacherProfile }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playCorrect();
    window.print();
  };

  // Sort students by stars
  const sortedStudents = [...students].sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-purple-100 my-auto relative flex flex-col max-h-[92vh]">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 border-b border-slate-200 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-black text-slate-800">In Bảng Tuyên Dương Thi Đua Khổ A4</h3>
              <p className="text-xs text-slate-400 font-semibold">Bấm "In Ngay" để xuất PDF/Máy in dán bảng tin lớp học.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transform hover:scale-105 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay (Khổ A4)</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-300 font-extrabold text-xs rounded-xl flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Đóng trang (X)</span>
            </button>
          </div>
        </div>

        {/* Printable A4 Content */}
        <div className="overflow-y-auto flex-1 p-6 print-area bg-white font-sans text-slate-900 border-4 border-double border-purple-900 rounded-2xl relative my-2">
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-purple-800 text-xs">❖</div>
          <div className="absolute top-2 right-2 text-purple-800 text-xs">❖</div>
          <div className="absolute bottom-2 left-2 text-purple-800 text-xs">❖</div>
          <div className="absolute bottom-2 right-2 text-purple-800 text-xs">❖</div>

          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-purple-900 mb-6">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
              TRƯỜNG THCS CÁT MINH • HỘI ĐỒNG THI ĐƯA LỚP {currentClass?.name || '8A5'}
            </div>
            <h1 className="text-2xl font-black text-purple-950 uppercase tracking-tight">
              BẢNG TUYÊN DƯƠNG THI ĐƯA HỌC SINH XUẤT SẮC
            </h1>
            <div className="text-xs font-semibold text-slate-700 flex justify-center space-x-4 pt-1">
              <span>Niên khóa: {currentClass?.academic_year || '2025 - 2026'}</span>
              <span>•</span>
              <span>GVCN: {teacherProfile?.full_name || 'Nguyễn Văn Hải'} (GV Tiếng Anh)</span>
            </div>
          </div>

          {/* Top 3 Podium Stars */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            {sortedStudents[1] && (
              <div className="p-3 bg-slate-100 rounded-2xl border border-slate-300">
                <span className="text-xs font-black text-slate-600 block">🥈 HẠNG NHÌ</span>
                <span className="text-sm font-black text-slate-900 block mt-1">{sortedStudents[1].full_name}</span>
                <span className="text-xs font-extrabold text-amber-600 block mt-0.5">{sortedStudents[1].total_stars || 0} ⭐</span>
              </div>
            )}

            {sortedStudents[0] && (
              <div className="p-4 bg-amber-100 rounded-2xl border-2 border-amber-400 shadow-sm transform -translate-y-2">
                <span className="text-xs font-black text-amber-800 flex items-center justify-center space-x-1">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>🥇 QUÁN QUÂN THI ĐƯA</span>
                </span>
                <span className="text-base font-black text-amber-950 block mt-1">{sortedStudents[0].full_name}</span>
                <span className="text-sm font-black text-amber-700 block mt-0.5">{sortedStudents[0].total_stars || 0} ⭐</span>
              </div>
            )}

            {sortedStudents[2] && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300">
                <span className="text-xs font-black text-amber-700 block">🥉 HẠNG BA</span>
                <span className="text-sm font-black text-slate-900 block mt-1">{sortedStudents[2].full_name}</span>
                <span className="text-xs font-extrabold text-amber-600 block mt-0.5">{sortedStudents[2].total_stars || 0} ⭐</span>
              </div>
            )}
          </div>

          {/* Leaderboard Table */}
          <table className="w-full text-left text-xs mb-6 border-collapse">
            <thead className="bg-purple-900 text-white uppercase font-black">
              <tr>
                <th className="p-2.5 border">Hạng</th>
                <th className="p-2.5 border">Họ và Tên Học Sinh</th>
                <th className="p-2.5 border">Tổ</th>
                <th className="p-2.5 border text-center">Tổng Sao Thi Đưa</th>
                <th className="p-2.5 border text-center">Danh Hiệu Tuyên Dương</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
              {sortedStudents.map((st, idx) => (
                <tr key={st.id} className={idx < 3 ? 'bg-amber-50/50 font-bold' : ''}>
                  <td className="p-2.5 border font-black text-center">{idx + 1}</td>
                  <td className="p-2.5 border font-black">{st.full_name}</td>
                  <td className="p-2.5 border">Tổ {st.team_group || 1}</td>
                  <td className="p-2.5 border text-center font-black text-amber-700">{st.total_stars || 0} ⭐</td>
                  <td className="p-2.5 border text-center">
                    {idx === 0 ? '🏆 Ngôi Sao Ngôi Đền Huyền Thoại' : idx < 5 ? '🌟 Tuyên Dương Xuất Sắc' : '⚡ Tuyên Dương Tích Cực'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Signature Area */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-300 text-xs">
            <div className="text-slate-500">
              * Áp dụng bảng tin thi đua tuần: {new Date().toLocaleDateString('vi-VN')}
            </div>

            <div className="text-center space-y-1 pr-6">
              <div className="italic text-slate-600">
                Cát Minh, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
              <div className="font-extrabold text-slate-900 uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
              <div className="h-14"></div>
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

import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { Printer, X, Calendar, Sun, Moon } from 'lucide-react';

export const PrintTimetableModal = ({ isOpen, onClose, currentClass, teacherProfile }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playCorrect();
    window.print();
  };

  const schedule = (() => {
    try {
      const stored = localStorage.getItem(`timetable_${currentClass?.id || 'demo'}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  })();

  const days = [
    { id: 2, name: 'THỨ HAI' },
    { id: 3, name: 'THỨ BA' },
    { id: 4, name: 'THỨ TƯ' },
    { id: 5, name: 'THỨ NĂM' },
    { id: 6, name: 'THỨ SÁU' },
    { id: 7, name: 'THỨ BẢY' }
  ];

  const morningTimes = ['07:00 - 07:45', '07:50 - 08:35', '08:40 - 09:25', '09:30 - 10:15', '10:20 - 11:05'];
  const afternoonTimes = ['13:00 - 13:45', '13:50 - 14:35', '14:40 - 15:25', '15:30 - 16:15'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-purple-100 my-auto relative flex flex-col max-h-[92vh]">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 border-b border-slate-200 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-black text-slate-800">In Thời Khóa Biểu Khổ Giấy A4</h3>
              <p className="text-xs text-slate-400 font-semibold">Bấm "In Ngay" để xuất PDF/Máy in dán góc học tập và bảng tin lớp.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-purple-glow flex items-center space-x-1.5 transform hover:scale-105 transition-all"
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
          
          <div className="absolute top-2 left-2 text-purple-800 text-xs">❖</div>
          <div className="absolute top-2 right-2 text-purple-800 text-xs">❖</div>
          <div className="absolute bottom-2 left-2 text-purple-800 text-xs">❖</div>
          <div className="absolute bottom-2 right-2 text-purple-800 text-xs">❖</div>

          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-purple-900 mb-6">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
              TRƯỜNG THCS CÁT MINH • LỚP {currentClass?.name || '8A5'}
            </div>
            <h1 className="text-2xl font-black text-purple-950 uppercase tracking-tight">
              THỜI KHÓA BIỂU HỌC TẬP HỌC KỲ I
            </h1>
            <div className="text-xs font-semibold text-slate-700 flex justify-center space-x-4 pt-1">
              <span>Niên khóa: {currentClass?.academic_year || '2025 - 2026'}</span>
              <span>•</span>
              <span>GVCN: {teacherProfile?.full_name || 'Nguyễn Văn Hải'} (GV Tiếng Anh)</span>
            </div>
          </div>

          {/* Morning Table */}
          <div className="mb-6">
            <div className="bg-amber-100 text-amber-900 font-black text-xs p-2 rounded-t-xl border border-amber-300 flex items-center space-x-1">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>BUỔI SÁNG (5 TIẾT)</span>
            </div>
            <table className="w-full text-center text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black">
                  <th className="p-2 border border-slate-300 w-28">TIẾT / GIỜ</th>
                  {days.map(d => <th key={d.id} className="p-2 border border-slate-300">{d.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(p => (
                  <tr key={`m-pr-${p}`}>
                    <td className="p-2 border border-slate-300 font-bold bg-slate-50">
                      <div>Tiết {p}</div>
                      <div className="text-[9px] text-slate-500">{morningTimes[p - 1]}</div>
                    </td>
                    {days.map(d => {
                      const item = schedule[`morning_${p}_${d.id}`];
                      return (
                        <td key={`m-${p}-${d.id}`} className="p-2 border border-slate-300 font-bold">
                          {item ? (
                            <div>
                              <span className="block text-purple-900 font-black">{item.icon || '📚'} {item.subject}</span>
                              <span className="block text-[9px] text-slate-500 font-semibold">{item.teacher}</span>
                            </div>
                          ) : <span className="text-slate-300 italic">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Afternoon Table */}
          <div className="mb-8">
            <div className="bg-purple-100 text-purple-900 font-black text-xs p-2 rounded-t-xl border border-purple-300 flex items-center space-x-1">
              <Moon className="w-4 h-4 text-purple-600" />
              <span>BUỔI CHIỀU (4 TIẾT)</span>
            </div>
            <table className="w-full text-center text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black">
                  <th className="p-2 border border-slate-300 w-28">TIẾT / GIỜ</th>
                  {days.map(d => <th key={d.id} className="p-2 border border-slate-300">{d.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(p => (
                  <tr key={`a-pr-${p}`}>
                    <td className="p-2 border border-slate-300 font-bold bg-slate-50">
                      <div>Tiết {p}</div>
                      <div className="text-[9px] text-slate-500">{afternoonTimes[p - 1]}</div>
                    </td>
                    {days.map(d => {
                      const item = schedule[`afternoon_${p}_${d.id}`];
                      return (
                        <td key={`a-${p}-${d.id}`} className="p-2 border border-slate-300 font-bold">
                          {item ? (
                            <div>
                              <span className="block text-indigo-900 font-black">{item.icon || '📚'} {item.subject}</span>
                              <span className="block text-[9px] text-slate-500 font-semibold">{item.teacher}</span>
                            </div>
                          ) : <span className="text-slate-300 italic">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Signature */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-300 text-xs">
            <div className="text-slate-500 space-y-1">
              <div>* Lịch học áp dụng cho Học kỳ I năm học 2025 - 2026.</div>
              <div>* Học sinh có mặt trước giờ vào lớp 15 phút.</div>
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

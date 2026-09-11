import React, { useState } from 'react';
import { X, Check, AlertCircle, Clock, Copy, CheckCheck, Sparkles } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const AttendanceModal4 = ({
  isOpen,
  onClose,
  students = [],
  currentClass,
  onUpdateAttendance
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = (studentId, status) => {
    soundFx.playClick();
    onUpdateAttendance?.(studentId, { status });
  };

  const handleNotesChange = (studentId, notes) => {
    onUpdateAttendance?.(studentId, { notes });
  };

  const presentCount = students.filter(s => s.status === 'Present' || !s.status).length;
  const absentPermCount = students.filter(s => s.status === 'Absent_Perm').length;
  const absentNoPermCount = students.filter(s => s.status === 'Absent_NoPerm').length;
  const lateCount = students.filter(s => s.status === 'Late').length;

  const handleCopyReport = () => {
    soundFx.playCorrect();
    const dateStr = new Date().toLocaleDateString('vi-VN');
    let report = `📋 BÁO CÁO ĐIỂM DANH LỚP ${currentClass?.name || '7A6'} (${dateStr})\n`;
    report += `• Sĩ số: ${students.length} HS\n`;
    report += `• Có mặt: ${presentCount} em\n`;
    report += `• Vắng có phép: ${absentPermCount} em\n`;
    report += `• Vắng không phép: ${absentNoPermCount} em\n`;
    report += `• Đi trễ: ${lateCount} em\n\n`;

    const absentList = students.filter(s => s.status === 'Absent_Perm' || s.status === 'Absent_NoPerm' || s.status === 'Late');
    if (absentList.length > 0) {
      report += `Chi tiết học sinh vắng / trễ:\n`;
      absentList.forEach((st, idx) => {
        const typeStr = st.status === 'Absent_Perm' ? 'Vắng có phép' : st.status === 'Absent_NoPerm' ? 'Vắng không phép' : 'Đi trễ';
        report += `${idx + 1}. ${st.full_name} (${typeStr}) ${st.notes ? `- Ghi chú: ${st.notes}` : ''}\n`;
      });
    } else {
      report += `Tất cả học sinh hiện diện đầy đủ, nề nếp tốt! ⭐\n`;
    }

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl p-5 sm:p-7 border border-emerald-100 flex flex-col justify-between max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Điểm Danh & Báo Cáo Chuyên Cần Lớp {currentClass?.name || '7A6'}
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Cập nhật chuyên cần thời gian thực & sao chép nội dung báo cáo gửi BGH/Phụ huynh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-2xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Summary Bar */}
        <div className="my-3 grid grid-cols-4 gap-2.5">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <span className="text-[10px] font-black text-emerald-600 block uppercase">CÓ MẶT</span>
            <span className="text-base font-black text-emerald-800">{presentCount} HS</span>
          </div>

          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <span className="text-[10px] font-black text-rose-600 block uppercase">VẮNG CÓ PHÉP</span>
            <span className="text-base font-black text-rose-800">{absentPermCount} HS</span>
          </div>

          <div className="p-2.5 bg-red-100 border border-red-300 rounded-2xl text-center">
            <span className="text-[10px] font-black text-red-700 block uppercase">VẮNG K.PHÉP</span>
            <span className="text-base font-black text-red-900">{absentNoPermCount} HS</span>
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <span className="text-[10px] font-black text-amber-600 block uppercase">ĐI TRỄ</span>
            <span className="text-base font-black text-amber-800">{lateCount} HS</span>
          </div>
        </div>

        {/* Students Attendance Table */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl my-2 custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-md text-slate-700 font-extrabold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3 text-center w-12">STT</th>
                <th className="p-3">Họ và Tên</th>
                <th className="p-3 text-center">Trạng Thái Điểm Danh</th>
                <th className="p-3">Nhận Xét / Lý Do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {students.map((st, idx) => {
                const status = st.status || 'Present';
                const isAbsent = status === 'Absent_Perm' || status === 'Absent_NoPerm';

                return (
                  <tr
                    key={st.id || idx}
                    className={`transition-colors ${
                      status === 'Absent_NoPerm'
                        ? 'bg-red-100/80 text-red-900'
                        : status === 'Absent_Perm'
                        ? 'bg-rose-50 text-rose-900'
                        : status === 'Late'
                        ? 'bg-amber-50/70 text-amber-900'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <img
                          src={
                            st.avatar ||
                            st.avatar_url ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(st.full_name)}`
                          }
                          alt={st.full_name}
                          className="w-7 h-7 rounded-full border object-cover"
                        />
                        <span className="font-bold">{st.full_name}</span>
                      </div>
                    </td>

                    {/* Status Options */}
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleStatusChange(st.id, 'Present')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                            status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Có mặt
                        </button>

                        <button
                          onClick={() => handleStatusChange(st.id, 'Absent_Perm')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                            status === 'Absent_Perm'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          Vắng CP
                        </button>

                        <button
                          onClick={() => handleStatusChange(st.id, 'Absent_NoPerm')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                            status === 'Absent_NoPerm'
                              ? 'bg-red-700 text-white shadow-xs'
                              : 'bg-red-200 text-red-900 hover:bg-red-300'
                          }`}
                        >
                          Vắng KP
                        </button>

                        <button
                          onClick={() => handleStatusChange(st.id, 'Late')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                            status === 'Late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          Đi trễ
                        </button>
                      </div>
                    </td>

                    {/* Notes input */}
                    <td className="p-3">
                      <input
                        type="text"
                        defaultValue={st.notes || ''}
                        onBlur={(e) => handleNotesChange(st.id, e.target.value)}
                        placeholder="Nhập ghi chú / lý do vắng..."
                        className="w-full bg-white/80 border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer with Copy Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleCopyReport}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
          >
            {copied ? <CheckCheck className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã Sao Chép Vào Clipboard!' : '📋 Sao Chép Báo Cáo Điểm Danh'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all"
          >
            Xong
          </button>
        </div>

      </div>
    </div>
  );
};

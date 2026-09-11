import React, { useState } from 'react';
import { X, UserPlus, Check, ArrowRight, School } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const QuickAddStudentsModal = ({
  isOpen,
  onClose,
  currentClass,
  onAddStudents
}) => {
  const [pastedNames, setPastedNames] = useState('');
  const [parsedStudents, setParsedStudents] = useState([]);

  if (!isOpen) return null;

  const handleParseNames = (text) => {
    setPastedNames(text);
    const lines = text
      .split('\n')
      .map(l => l.replace(/^\d+[\.\,-]\s*/, '').trim())
      .filter(l => l.length > 0);

    const generated = lines.map((name, idx) => ({
      id: `st-${Date.now()}-${idx + 1}`,
      class_id: currentClass?.id,
      code: `HS${String(idx + 1).padStart(2, '0')}`,
      full_name: name,
      gender: idx % 2 === 0 ? 'Nữ' : 'Nam',
      team_group: (idx % 4) + 1,
      seat_row: Math.floor(idx / 8) + 1,
      seat_col: (idx % 8) + 1,
      plus_points: 0,
      minus_points: 0,
      status: 'Present',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name + idx)}`
    }));

    setParsedStudents(generated);
  };

  const handleToggleGender = (idx) => {
    soundFx.playClick();
    setParsedStudents(prev =>
      prev.map((s, i) => (i === idx ? { ...s, gender: s.gender === 'Nam' ? 'Nữ' : 'Nam' } : s))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parsedStudents.length === 0) return;
    soundFx.playCorrect();
    onAddStudents?.(parsedStudents);
    setPastedNames('');
    setParsedStudents([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-5 sm:p-7 border border-purple-100 flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-100 rounded-2xl text-purple-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Thêm Học Sinh Vào Lớp {currentClass?.name || ''}
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Dán danh sách học sinh từ Excel hoặc Word, bấm nút để đổi giới tính Nam/Nữ
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-2xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Dán Danh Sách Họ Tên Học Sinh (Mỗi học sinh một dòng):
            </label>
            <textarea
              rows={5}
              value={pastedNames}
              onChange={(e) => handleParseNames(e.target.value)}
              placeholder="Nguyễn Hoài An&#10;Trần Bảo Anh&#10;Lê Hoàng Bách&#10;Phạm Minh Cường..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              required
            />
          </div>

          {/* Preview Table */}
          {parsedStudents.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
              <div className="p-2.5 bg-slate-100/90 text-slate-700 font-extrabold text-xs flex items-center justify-between">
                <span>Xem trước ({parsedStudents.length} Học sinh):</span>
                <span className="text-[10px] text-purple-600 font-bold">Bấm nút để đổi Nam ⇄ Nữ</span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <tbody className="divide-y divide-slate-100">
                  {parsedStudents.map((st, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/50">
                      <td className="p-2 text-center text-slate-400 font-bold w-10">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-800">{st.full_name}</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleGender(idx)}
                          className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                            st.gender === 'Nữ'
                              ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {st.gender === 'Nữ' ? '👧 Nữ' : '👦 Nam'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={parsedStudents.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-purple-200 flex items-center space-x-1.5"
            >
              <span>LƯU {parsedStudents.length > 0 ? `(${parsedStudents.length} HS)` : ''} VÀO LỚP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

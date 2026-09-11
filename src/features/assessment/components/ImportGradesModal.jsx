import React, { useState } from 'react';
import { X, Upload, Check, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const ImportGradesModal = ({
  isOpen,
  onClose,
  students = [],
  numTxCols = 4,
  onImportGrades
}) => {
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);

  if (!isOpen) return null;

  const handleParseText = (text) => {
    setPastedText(text);
    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);

    const parsed = lines.map((line, idx) => {
      // Split by tab (Excel copy) or comma or space
      const parts = line.split(/\t|,/).map(p => p.trim());
      
      // Try to determine if first item is number/name
      let studentName = '';
      let scoreValues = [];

      if (parts.length > 0 && isNaN(Number(parts[0])) && parts[0].length > 2) {
        studentName = parts[0];
        scoreValues = parts.slice(1).map(s => (s !== '' && !isNaN(Number(s))) ? Number(s) : null);
      } else if (parts.length > 1 && !isNaN(Number(parts[0])) && isNaN(Number(parts[1]))) {
        studentName = parts[1];
        scoreValues = parts.slice(2).map(s => (s !== '' && !isNaN(Number(s))) ? Number(s) : null);
      } else {
        scoreValues = parts.map(s => (s !== '' && !isNaN(Number(s))) ? Number(s) : null);
      }

      return {
        lineIdx: idx,
        studentName: studentName || (students[idx]?.full_name || `Học sinh ${idx + 1}`),
        tx1: scoreValues[0] ?? null,
        tx2: scoreValues[1] ?? null,
        tx3: scoreValues[2] ?? null,
        tx4: scoreValues[3] ?? null,
        gk: scoreValues[4] ?? null,
        ck: scoreValues[5] ?? null
      };
    });

    setParsedRows(parsed);
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;
    soundFx.playCorrect();

    const importedMap = {};
    parsedRows.forEach((row, i) => {
      const student = students[i];
      if (student) {
        importedMap[student.id] = {
          tx1: row.tx1,
          tx2: row.tx2,
          tx3: row.tx3,
          tx4: row.tx4,
          gk: row.gk,
          ck: row.ck
        };
      }
    });

    onImportGrades?.(importedMap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-7 border border-teal-100 flex flex-col justify-between max-h-[90vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-100 rounded-2xl text-teal-700">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                Nhập Dữ Liệu Bảng Điểm Từ Excel
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Sao chép các cột điểm từ Excel rồi dán trực tiếp vào ô bên dưới
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-2xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-700 block">
            Dán dữ liệu điểm (Các cột: TX1, TX2, TX3, TX4, GK, CK):
          </label>
          <textarea
            rows={5}
            value={pastedText}
            onChange={(e) => handleParseText(e.target.value)}
            placeholder="Ví dụ dán từ Excel:&#10;8	9	7.5	8	8.5	9&#10;7	8	8	7.5	7	8"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Preview Table */}
        {parsedRows.length > 0 && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
            <div className="p-2 bg-slate-100 text-slate-700 font-black text-[11px]">
              Xem trước dữ liệu nhận diện ({parsedRows.length} học sinh):
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold">
                <tr>
                  <th className="p-1.5 text-center">STT</th>
                  <th className="p-1.5">Học sinh gán vào</th>
                  <th className="p-1.5 text-center">TX1</th>
                  <th className="p-1.5 text-center">TX2</th>
                  <th className="p-1.5 text-center">TX3</th>
                  <th className="p-1.5 text-center">TX4</th>
                  <th className="p-1.5 text-center font-black text-teal-800">GK</th>
                  <th className="p-1.5 text-center font-black text-teal-800">CK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-teal-50/50">
                    <td className="p-1.5 text-center text-slate-400 font-bold">{i + 1}</td>
                    <td className="p-1.5 font-bold text-slate-700">{students[i]?.full_name || r.studentName}</td>
                    <td className="p-1.5 text-center">{r.tx1 ?? '-'}</td>
                    <td className="p-1.5 text-center">{r.tx2 ?? '-'}</td>
                    <td className="p-1.5 text-center">{r.tx3 ?? '-'}</td>
                    <td className="p-1.5 text-center">{r.tx4 ?? '-'}</td>
                    <td className="p-1.5 text-center font-bold text-teal-800">{r.gk ?? '-'}</td>
                    <td className="p-1.5 text-center font-bold text-teal-800">{r.ck ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={parsedRows.length === 0}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-teal-200 flex items-center space-x-1.5"
          >
            <span>ÁP DỤNG ĐIỂM VÀO BẢNG</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

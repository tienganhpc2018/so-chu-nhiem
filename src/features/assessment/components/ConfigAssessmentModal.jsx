import React, { useState } from 'react';
import { X, Settings, Check, School } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const ConfigAssessmentModal = ({
  isOpen,
  onClose,
  schoolName = 'TRƯỜNG THCS ĐỀ GI',
  numTxCols = 4,
  academicYear = '2026-2027',
  onSaveConfig
}) => {
  const [name, setName] = useState(schoolName);
  const [cols, setCols] = useState(numTxCols);
  const [year, setYear] = useState(academicYear);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    soundFx.playCorrect();
    onSaveConfig?.({
      schoolName: name.trim() || 'TRƯỜNG THCS ĐỀ GI',
      numTxCols: Number(cols),
      academicYear: year.trim() || '2026-2027'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-7 border border-teal-100 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-100 rounded-2xl text-teal-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                Cấu Hình Sổ Đánh Giá Môn Học
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Tùy chỉnh biểu mẫu theo quy định nhà trường
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-2xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              Tên Trường Học:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: TRƯỜNG THCS ĐỀ GI"
              className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 uppercase"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              Số Cột Đánh Giá Thường Xuyên (ĐĐG TX):
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCols(num)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    cols === num
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-black'
                      : 'border-slate-200 text-slate-600 font-bold hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm">{num} Cột</span>
                  <span className="text-[10px] block text-slate-400 font-normal">TX 1, ..., TX {num}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              Năm Học:
            </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Ví dụ: 2026-2027"
              className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-[11px] text-teal-900 space-y-1">
            <span className="font-bold block text-teal-950">📋 Quy tắc tính điểm Thông tư 22/BGDĐT:</span>
            <span className="block text-slate-600">• ĐĐG TX: Hệ số 1</span>
            <span className="block text-slate-600">• ĐĐG Giữa kỳ: Hệ số 2</span>
            <span className="block text-slate-600">• ĐĐG Cuối kỳ: Hệ số 3</span>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-md shadow-teal-200 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>LƯU CẤU HÌNH</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

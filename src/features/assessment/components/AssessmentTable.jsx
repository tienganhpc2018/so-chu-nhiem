import React from 'react';
import { Sparkles, ChevronDown, User, UserPlus } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';
import { calculateTBM, classifyPerformance } from '../utils/gradeCalculations';

export const AssessmentTable = ({
  students = [],
  gradesData = {},
  numTxCols = 4,
  onUpdateGrade,
  onQuickAiCommentStudent,
  onOpenQuickAddStudents,
  semester = 'HKI'
}) => {
  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-teal-200 space-y-4 shadow-soft">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-inner">
          👨‍🎓
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800">Lớp hiện tại chưa có danh sách học sinh</h3>
          <p className="text-xs text-slate-500 mt-1">
            Thầy/Cô hãy dán hoặc nhập danh sách học sinh vào lớp để bắt đầu chấm điểm và nhận xét nhé!
          </p>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenQuickAddStudents?.();
          }}
          className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-2xl shadow-md shadow-teal-200 inline-flex items-center space-x-2 transition-all transform hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Dán Danh Sách Học Sinh Vào Lớp</span>
        </button>
      </div>
    );
  }

  const txColIndices = Array.from({ length: numTxCols }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse min-w-[950px]">
          
          {/* Table Header (Matching User Image Color & Structure) */}
          <thead>
            <tr className="bg-[#0f766e] text-white font-black tracking-wider text-center select-none">
              <th rowSpan={2} className="p-2.5 border-r border-teal-600/60 w-12">
                STT
              </th>
              
              <th rowSpan={2} className="p-2.5 border-r border-teal-600/60 text-left min-w-[200px] w-64">
                Họ và tên
              </th>

              <th colSpan={numTxCols} className="p-2 border-b border-r border-teal-600/60">
                <div className="inline-flex items-center space-x-1">
                  <span>ĐĐG TX</span>
                </div>
              </th>

              <th rowSpan={2} className="p-2.5 border-r border-teal-600/60 w-20">
                <div className="inline-flex items-center space-x-1">
                  <span>ĐĐG GK</span>
                  <ChevronDown className="w-3 h-3 text-teal-300" />
                </div>
              </th>

              <th rowSpan={2} className="p-2.5 border-r border-teal-600/60 w-20">
                <div className="inline-flex items-center space-x-1">
                  <span>ĐĐG CK</span>
                  <ChevronDown className="w-3 h-3 text-teal-300" />
                </div>
              </th>

              <th rowSpan={2} className="p-2.5 border-r border-teal-600/60 w-24">
                <div className="inline-flex items-center space-x-1">
                  <span>TBM {semester}</span>
                  <ChevronDown className="w-3 h-3 text-teal-300" />
                </div>
              </th>

              <th rowSpan={2} className="p-2.5 min-w-[280px]">
                <div className="inline-flex items-center space-x-1">
                  <span>Nhận xét {semester}</span>
                  <ChevronDown className="w-3 h-3 text-teal-300" />
                </div>
              </th>
            </tr>

            {/* Sub-Header Row for TX 1, 2, 3, 4 */}
            <tr className="bg-[#115e59] text-teal-100 font-black text-center text-[11px] border-b border-teal-600/60">
              {txColIndices.map(col => (
                <th key={col} className="p-1.5 border-r border-teal-600/60 w-14">
                  <div className="inline-flex items-center justify-center space-x-0.5">
                    <span>{col}</span>
                    <ChevronDown className="w-2.5 h-2.5 text-teal-300" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200">
            {students.map((student, idx) => {
              const rowData = gradesData[student.id] || {};
              const txValues = txColIndices.map(c => rowData[`tx${c}`]);
              const tbm = calculateTBM(txValues, rowData.gk, rowData.ck);
              const performance = classifyPerformance(tbm);

              // Sub-info: birth date & student code
              const birthDate = student.birth_date || student.dob || '2014';
              const studentCode = student.code || `52548516-00-${String(idx + 1).padStart(2, '0')}`;

              return (
                <tr
                  key={student.id}
                  className={`hover:bg-teal-50/40 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                  }`}
                >
                  {/* STT */}
                  <td className="p-2 text-center font-bold text-slate-500 border-r border-slate-200">
                    {idx + 1}
                  </td>

                  {/* Họ và tên & Subtitle */}
                  <td className="p-2.5 border-r border-slate-200">
                    <div className="font-extrabold text-slate-800 text-xs leading-tight">
                      {student.full_name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {birthDate} - {studentCode}
                    </div>
                  </td>

                  {/* Cột TX 1, 2, 3, 4 */}
                  {txColIndices.map(col => {
                    const val = rowData[`tx${col}`] !== undefined ? rowData[`tx${col}`] : '';
                    return (
                      <td key={col} className="p-1 border-r border-slate-200 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={val}
                          onChange={(e) => onUpdateGrade(student.id, `tx${col}`, e.target.value)}
                          placeholder="-"
                          className="w-full text-center py-1.5 px-0.5 text-xs font-bold text-slate-800 bg-transparent rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 hover:bg-white"
                        />
                      </td>
                    );
                  })}

                  {/* ĐĐG GK */}
                  <td className="p-1 border-r border-slate-200 text-center bg-teal-50/20">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={rowData.gk !== undefined ? rowData.gk : ''}
                      onChange={(e) => onUpdateGrade(student.id, 'gk', e.target.value)}
                      placeholder="-"
                      className="w-full text-center py-1.5 px-0.5 text-xs font-black text-teal-900 bg-transparent rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 hover:bg-white"
                    />
                  </td>

                  {/* ĐĐG CK */}
                  <td className="p-1 border-r border-slate-200 text-center bg-teal-50/20">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={rowData.ck !== undefined ? rowData.ck : ''}
                      onChange={(e) => onUpdateGrade(student.id, 'ck', e.target.value)}
                      placeholder="-"
                      className="w-full text-center py-1.5 px-0.5 text-xs font-black text-teal-900 bg-transparent rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 hover:bg-white"
                    />
                  </td>

                  {/* TBM HKI (Auto-Calculated) */}
                  <td className="p-2 border-r border-slate-200 text-center">
                    {tbm !== null ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="font-black text-sm text-teal-950">
                          {tbm.toFixed(1)}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full mt-0.5 ${performance.color}`}>
                          {performance.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300 font-bold">-</span>
                    )}
                  </td>

                  {/* Nhận xét HKI kèm nút AI Sparkles */}
                  <td className="p-1.5">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={rowData.comment || ''}
                        onChange={(e) => onUpdateGrade(student.id, 'comment', e.target.value)}
                        placeholder="Nhập nhận xét hoặc bấm ✨ AI..."
                        className="w-full py-1.5 pl-2.5 pr-8 bg-transparent text-xs font-medium text-slate-800 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          onQuickAiCommentStudent?.(student, { ...rowData, tbm });
                        }}
                        className="absolute right-1.5 p-1 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded-lg transition-colors"
                        title="AI tự động nhận xét em này"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 fill-teal-100" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Check,
  ArrowLeftRight,
  Users,
  Sparkles,
  Printer,
  Shuffle,
  Search,
  RotateCcw,
  MousePointer,
  HelpCircle
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { PrintSeatingChartModal } from '../../../components/PrintSeatingChartModal';

export const SeatingChartModal = ({
  isOpen,
  onClose,
  students = [],
  currentClass,
  teacherProfile = null,
  onSwapSeats,
  onAutoAssignSeats,
  onShuffleSeats
}) => {
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [dragOverSeat, setDragOverSeat] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [rowCount, setRowCount] = useState(() => {
    const maxInClass = Math.max(5, ...students.map(s => Number(s.seat_row || 1)));
    return maxInClass > 6 ? maxInClass : 5;
  });

  if (!isOpen) return null;

  const teacherName = teacherProfile?.full_name || currentClass?.teacher_name || 'GV Chủ Nhiệm';

  // Group seats by 4 Aisles (Dãy 1: col 1-2, Dãy 2: col 3-4, Dãy 3: col 5-6, Dãy 4: col 7-8)
  const aisles = [
    { aisleNumber: 1, cols: [1, 2], label: 'DÃY 1' },
    { aisleNumber: 2, cols: [3, 4], label: 'DÃY 2' },
    { aisleNumber: 3, cols: [5, 6], label: 'DÃY 3' },
    { aisleNumber: 4, cols: [7, 8], label: 'DÃY 4' },
  ];

  // Unseated students (chưa xếp hàng hoặc cột)
  const unseatedStudents = students.filter(
    s => !s.seat_row || !s.seat_col || Number(s.seat_row) < 1 || Number(s.seat_col) < 1 || Number(s.seat_row) > rowCount || Number(s.seat_col) > 8
  );

  // Drag & Drop handlers
  const handleDragStart = (e, st) => {
    setDraggedStudent(st);
    e.dataTransfer.setData('text/plain', st.id);
  };

  const handleDragOver = (e, r, c) => {
    e.preventDefault();
    setDragOverSeat(`${r}-${c}`);
  };

  const handleDrop = (e, targetRow, targetCol, targetStudent) => {
    e.preventDefault();
    setDragOverSeat(null);
    if (!draggedStudent) return;

    soundFx.playCorrect();
    onSwapSeats?.(draggedStudent, targetRow, targetCol, targetStudent);
    setDraggedStudent(null);
    setSelectedStudent(null);
  };

  // Click-to-Swap / Click-to-Move handler (1 chạm thông minh)
  const handleSeatClick = (r, c, targetStudent) => {
    // Nếu chưa chọn bạn nào:
    if (!selectedStudent) {
      if (targetStudent) {
        soundFx.playClick();
        setSelectedStudent(targetStudent);
      }
      return;
    }

    // Nếu bấm lại chính bạn đang chọn -> bỏ chọn
    if (targetStudent && selectedStudent.id === targetStudent.id) {
      soundFx.playClick();
      setSelectedStudent(null);
      return;
    }

    // Thực hiện di chuyển hoặc hoán đổi chỗ ngồi
    soundFx.playCorrect();
    onSwapSeats?.(selectedStudent, r, c, targetStudent);
    setSelectedStudent(null);
  };

  // Xếp tự động vào ghế trống
  const handleAutoAssign = () => {
    soundFx.playCorrect();
    confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });
    onAutoAssignSeats?.(rowCount);
    setSelectedStudent(null);
  };

  // Xáo trộn ngẫu nhiên
  const handleShuffle = () => {
    if (window.confirm('Thầy/Cô có chắc muốn xáo trộn ngẫu nhiên toàn bộ chỗ ngồi của lớp không?')) {
      soundFx.playCorrect();
      confetti({ particleCount: 50, spread: 90, origin: { y: 0.5 } });
      onShuffleSeats?.(rowCount);
      setSelectedStudent(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl bg-slate-900 border-4 border-amber-400 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-white flex flex-col justify-between max-h-[96vh] overflow-y-auto custom-scrollbar">
        
        {/* Header Bar */}
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🏫</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center space-x-2">
                <span>SƠ ĐỒ CHỖ NGỒI LỚP {currentClass?.name || ''}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {students.length} Học Sinh
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-bold">
                Kéo thả hoặc bấm 1 bạn rồi bấm vào bàn muốn chuyển đến để hoán đổi chỗ ngồi nhanh chóng
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 self-end sm:self-auto">
            {/* Hàng Ghế Selector */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-bold">
              <span className="px-2 text-slate-400 text-[10px]">Số Bàn:</span>
              {[5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setRowCount(num)}
                  className={`px-2 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    rowCount === num ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {num} Hàng
                </button>
              ))}
            </div>

            {/* In Sơ Đồ */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
              title="Xem bản in sơ đồ lớp A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Sơ Đồ</span>
            </button>

            {/* Tự động xếp chỗ trống */}
            {unseatedStudents.length > 0 && (
              <button
                onClick={handleAutoAssign}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
                title="Tự động xếp các học sinh chưa có chỗ vào các bàn còn trống"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>Xếp Chỗ ({unseatedStudents.length})</span>
              </button>
            )}

            {/* Xáo trộn ngẫu nhiên */}
            <button
              onClick={handleShuffle}
              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
              title="Xáo trộn ngẫu nhiên chỗ ngồi cả lớp"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Xáo Trộn</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected Student Banner Hint (Chế độ 1 Chạm) */}
        {selectedStudent && (
          <div className="my-2 bg-gradient-to-r from-amber-500/30 via-purple-600/30 to-amber-500/30 border-2 border-amber-400 p-2.5 rounded-2xl flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center space-x-2">
              <MousePointer className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                👉 Đang chọn: <strong className="text-amber-300 font-black">{selectedStudent.full_name}</strong>. Hãy bấm vào ghế muốn chuyển đến (hoặc bấm vào bạn khác) để đổi chỗ!
              </span>
            </div>
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-extrabold text-white"
            >
              Hủy chọn
            </button>
          </div>
        )}

        {/* Unseated Students Drawer (nếu có học sinh chưa được xếp bàn) */}
        {unseatedStudents.length > 0 && (
          <div className="my-2 p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-rose-300 flex items-center space-x-1">
                <span>⚠️ Chưa xếp chỗ:</span>
                <span className="underline">{unseatedStudents.length} học sinh</span>
              </span>
              <span className="text-[10px] text-slate-400">Bấm hoặc kéo các em vào bàn trống bên dưới</span>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
              {unseatedStudents.map(st => {
                const isSelected = selectedStudent?.id === st.id;
                return (
                  <div
                    key={st.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, st)}
                    onClick={() => handleSeatClick(0, 0, st)}
                    className={`shrink-0 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black border-white ring-2 ring-amber-300 scale-105'
                        : 'bg-slate-800 border-rose-500/50 hover:border-amber-400 text-white'
                    }`}
                  >
                    <img
                      src={
                        st.avatar ||
                        st.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(st.full_name)}`
                      }
                      alt={st.full_name}
                      className="w-5 h-5 rounded-full border border-amber-400 object-cover"
                    />
                    <span className="text-[11px] font-extrabold">{st.full_name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4 Aisles Seating Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 my-2">
          {aisles.map(aisle => (
            <div key={aisle.aisleNumber} className="bg-slate-800/60 rounded-3xl p-3 border border-slate-700/80 flex flex-col space-y-2.5">
              
              {/* Aisle Title */}
              <div className="py-1.5 px-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-center flex items-center justify-between">
                <span className="text-xs font-black text-amber-300">{aisle.label}</span>
                <span className="text-[10px] text-slate-400 font-bold">Cột {aisle.cols[0]} & {aisle.cols[1]}</span>
              </div>

              {/* Rows: Hàng 1 ở dưới cùng gần Bảng (Ảnh 1 chuẩn quy ước lớp học) */}
              {Array.from({ length: rowCount }, (_, rIdx) => {
                const r = rowCount - rIdx;
                return (
                  <div key={r} className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-black text-slate-400 w-4 text-center">B{r}</span>

                    <div className="flex-1 grid grid-cols-2 gap-1.5 p-1 bg-slate-900/70 rounded-2xl border border-slate-700/50">
                      {aisle.cols.map(c => {
                        const studentAtSeat = students.find(s => Number(s.seat_row) === r && Number(s.seat_col) === c);
                        const isOver = dragOverSeat === `${r}-${c}`;
                        const isSelected = selectedStudent && studentAtSeat && selectedStudent.id === studentAtSeat.id;

                        return (
                          <div
                            key={c}
                            onDragOver={(e) => handleDragOver(e, r, c)}
                            onDrop={(e) => handleDrop(e, r, c, studentAtSeat)}
                            onClick={() => handleSeatClick(r, c, studentAtSeat)}
                            className={`min-h-[66px] rounded-xl p-1.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'bg-amber-400/40 border-2 border-amber-400 ring-2 ring-amber-300 scale-105 shadow-lg'
                                : isOver
                                ? 'bg-amber-400/30 border-2 border-amber-400 scale-105'
                                : studentAtSeat
                                ? 'bg-slate-800 border border-slate-600 hover:border-amber-400 active:scale-95'
                                : selectedStudent
                                ? 'bg-emerald-950/40 border-2 border-dashed border-emerald-500/70 text-emerald-400 hover:bg-emerald-900/50 animate-pulse'
                                : 'bg-slate-900/40 border border-dashed border-slate-700 text-slate-500 hover:border-slate-500'
                            }`}
                          >
                            {studentAtSeat ? (
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, studentAtSeat)}
                                className="w-full flex flex-col items-center"
                              >
                                <div className="relative">
                                  <img
                                    src={
                                      studentAtSeat.avatar ||
                                      studentAtSeat.avatar_url ||
                                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentAtSeat.full_name)}`
                                    }
                                    alt={studentAtSeat.full_name}
                                    className={`w-8 h-8 rounded-full border mb-0.5 object-cover ${
                                      isSelected ? 'border-amber-300 ring-2 ring-amber-300' : 'border-amber-400'
                                    }`}
                                  />
                                  {isSelected && (
                                    <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>
                                  )}
                                </div>
                                <span className="font-extrabold text-[10px] text-white truncate max-w-[65px]" title={studentAtSeat.full_name}>
                                  {studentAtSeat.full_name}
                                </span>
                                <span className="text-[8px] text-purple-300 font-bold">
                                  Tổ {studentAtSeat.team_group || 1}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className={`text-[9px] font-bold ${selectedStudent ? 'text-emerald-300 font-black' : 'text-slate-500'}`}>
                                  {selectedStudent ? '+ Đặt vào' : 'Trống'}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* BỤC GIẢNG & BẢNG LỚP HỌC (DƯỚI CÙNG - CHUẨN ẢNH 1) */}
        <div className="my-3 flex items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-700">
          {/* CỬA VÀO */}
          <div className="w-28 sm:w-32 bg-amber-500/20 border border-amber-500/40 rounded-xl p-2 text-center text-amber-300 font-black text-[11px] flex items-center justify-center space-x-1 shrink-0">
            <span>CỬA VÀO</span>
            <span>➔</span>
          </div>

          {/* BẢNG ĐEN */}
          <div className="flex-1 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-amber-500/50 rounded-xl p-2 text-center">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              ✦ BẢNG LỚP {currentClass?.name || '7A6'} ✦
            </span>
            <span className="text-[10px] text-slate-400 font-bold block">
              Niên khóa: {currentClass?.academic_year || '2025 - 2026'}
            </span>
          </div>

          {/* BÀN GIÁO VIÊN */}
          <div className="w-36 sm:w-44 bg-purple-900/40 border border-purple-500/40 rounded-xl p-2 text-center shrink-0">
            <span className="text-[10px] font-black text-purple-300 uppercase block">BÀN GIÁO VIÊN</span>
            <span className="text-[9px] text-slate-300 font-bold block truncate" title={teacherName}>
              {teacherName}
            </span>
          </div>
        </div>

        {/* Footer info & Buttons */}
        <div className="mt-2 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-bold">
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Kéo thả học sinh hoặc bấm vào học sinh rồi bấm vào bàn trống để đổi chỗ ngồi ngay lập tức.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition-all shadow-md active:scale-95 shrink-0"
          >
            Hoàn Tất Xếp Bàn
          </button>
        </div>

      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <PrintSeatingChartModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          currentClass={currentClass}
          students={students}
          teacherProfile={teacherProfile}
        />
      )}
    </div>
  );
};

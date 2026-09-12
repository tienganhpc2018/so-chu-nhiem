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
  HelpCircle,
  Sun,
  Moon,
  Box,
  Layers,
  Compass,
  ArrowUp,
  DoorOpen,
  Eye
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { PrintSeatingChartModal } from '../../../components/PrintSeatingChartModal';
import { getSmartDisplayName } from '../../../utils/nameFormatter';

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
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Display & Visual Modes: 3D Không Gian, 2D Phẳng, 3D VR 360°
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d' | 'vr'
  const [themeMode, setThemeMode] = useState('light'); // 'light' (mặc định sáng sang trọng) | 'dark'
  const [vrAngle, setVrAngle] = useState(0); // -25 to +25 deg

  const [rowCount, setRowCount] = useState(() => {
    const maxInClass = Math.max(5, ...students.map(s => Number(s.seat_row || 1)));
    return maxInClass > 6 ? maxInClass : 5;
  });

  if (!isOpen) return null;

  const teacherName = teacherProfile?.full_name || currentClass?.teacher_name || 'GV Chủ Nhiệm';
  const isLight = themeMode === 'light';

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
    confetti({ particleCount: 35, spread: 75, origin: { y: 0.6 } });
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

  // Helper render single Aisle
  const renderAisle = (aisle) => (
    <div
      key={aisle.aisleNumber}
      className={`rounded-3xl p-3 border transition-all ${
        isLight
          ? 'bg-white/90 border-amber-200/80 shadow-md'
          : 'bg-slate-800/80 border-slate-700/80 shadow-lg'
      }`}
    >
      {/* Aisle Title */}
      <div
        className={`py-1.5 px-3 rounded-xl text-center flex items-center justify-between mb-2.5 border ${
          isLight
            ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-amber-300 text-amber-900'
            : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
        }`}
      >
        <span className="text-xs font-black tracking-wide">{aisle.label}</span>
        <span className="text-[10px] font-bold opacity-80">
          Cột {aisle.cols[0]} & {aisle.cols[1]}
        </span>
      </div>

      {/* Rows: Hàng 1 ở dưới cùng gần Bảng (Chuẩn Ảnh 1) */}
      <div className="flex flex-col space-y-2.5">
        {Array.from({ length: rowCount }, (_, rIdx) => {
          const r = rowCount - rIdx;
          return (
            <div key={r} className="flex items-center space-x-1.5">
              <span
                className={`text-[10px] font-black w-5 text-center shrink-0 ${
                  isLight ? 'text-amber-800/70' : 'text-slate-400'
                }`}
              >
                B{r}
              </span>

              {/* Bàn đôi (2 chỗ ngồi) */}
              <div
                className={`flex-1 grid grid-cols-2 gap-1.5 p-1 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-amber-50/50 border-amber-200/70 shadow-inner'
                    : 'bg-slate-900/70 border-slate-700/50 shadow-inner'
                } ${viewMode === '3d' ? 'shadow-sm' : ''}`}
              >
                {aisle.cols.map(c => {
                  const studentAtSeat = students.find(s => Number(s.seat_row) === r && Number(s.seat_col) === c);
                  const isOver = dragOverSeat === `${r}-${c}`;
                  const isSelected = selectedStudent && studentAtSeat && selectedStudent.id === studentAtSeat.id;
                  const displayName = studentAtSeat ? getSmartDisplayName(studentAtSeat.full_name, students) : '';

                  return (
                    <div
                      key={c}
                      onDragOver={(e) => handleDragOver(e, r, c)}
                      onDrop={(e) => handleDrop(e, r, c, studentAtSeat)}
                      onClick={() => handleSeatClick(r, c, studentAtSeat)}
                      className={`min-h-[70px] rounded-xl p-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none relative ${
                        isSelected
                          ? 'bg-amber-400/40 border-2 border-amber-500 ring-2 ring-amber-400 scale-105 shadow-lg z-10'
                          : isOver
                          ? 'bg-amber-300/40 border-2 border-amber-500 scale-105 z-10'
                          : studentAtSeat
                          ? isLight
                            ? 'bg-white border-2 border-amber-200/80 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5'
                            : 'bg-slate-800 border border-slate-600 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5'
                          : selectedStudent
                          ? isLight
                            ? 'bg-emerald-50 border-2 border-dashed border-emerald-400 text-emerald-700 animate-pulse hover:bg-emerald-100'
                            : 'bg-emerald-950/40 border-2 border-dashed border-emerald-500/70 text-emerald-400 hover:bg-emerald-900/50 animate-pulse'
                          : isLight
                          ? 'bg-slate-100/60 border-2 border-dashed border-slate-200 text-slate-400 hover:border-amber-300'
                          : 'bg-slate-900/40 border border-dashed border-slate-700 text-slate-500 hover:border-slate-500'
                      } ${
                        viewMode === '3d' && studentAtSeat
                          ? 'shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
                          : ''
                      }`}
                    >
                      {studentAtSeat ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, studentAtSeat)}
                          className="w-full flex flex-col items-center"
                          title={`${studentAtSeat.full_name} • Tổ ${studentAtSeat.team_group || 1} • Bàn ${r}, Cột ${c}`}
                        >
                          <div className="relative">
                            <img
                              src={
                                studentAtSeat.avatar ||
                                studentAtSeat.avatar_url ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentAtSeat.full_name)}`
                              }
                              alt={studentAtSeat.full_name}
                              className={`w-7 h-7 rounded-full border mb-0.5 object-cover shadow-xs ${
                                isSelected
                                  ? 'border-amber-500 ring-2 ring-amber-400'
                                  : isLight
                                  ? 'border-amber-400 bg-amber-50'
                                  : 'border-amber-400 bg-slate-700'
                              }`}
                            />
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>
                            )}
                          </div>
                          
                          {/* Tên Đệm + Tên (Rút gọn thông minh - line-clamp-2 hiển thị trọn vẹn mọi tên) */}
                          <span
                            className={`font-black text-[10.5px] leading-[1.15] text-center px-0.5 line-clamp-2 max-w-full ${
                              isLight ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            {displayName}
                          </span>

                          <span
                            className={`text-[8px] font-extrabold mt-0.5 px-1.5 py-0.2 rounded-full ${
                              isLight
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                            }`}
                          >
                            Tổ {studentAtSeat.team_group || 1}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-[10px] font-bold ${
                              selectedStudent
                                ? 'text-emerald-600 dark:text-emerald-300 font-black'
                                : 'opacity-60'
                            }`}
                          >
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
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative w-full max-w-6xl rounded-[2.5rem] shadow-2xl p-4 sm:p-6 flex flex-col justify-between max-h-[96vh] overflow-y-auto custom-scrollbar border-4 transition-colors ${
          isLight
            ? 'bg-gradient-to-b from-[#FFFDF7] via-[#FFF9ED] to-[#FDF4DF] border-amber-400 text-slate-800'
            : 'bg-slate-900 border-amber-400 text-white'
        }`}
      >
        
        {/* Header Bar */}
        <div
          className={`w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b ${
            isLight ? 'border-amber-200' : 'border-slate-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-3xl p-2 rounded-2xl bg-amber-400/20 border border-amber-400/30">🏫</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black flex items-center space-x-2">
                <span className={isLight ? 'text-amber-900' : 'text-amber-300'}>
                  SƠ ĐỒ CHỖ NGỒI LỚP {currentClass?.name || ''}
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                  {students.length} Học Sinh
                </span>
              </h3>
              <p className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Hiển thị tên đệm + tên học sinh • Kéo thả hoặc bấm 1 bạn rồi bấm vào bàn trống để đổi chỗ
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2 self-end lg:self-auto">
            
            {/* 1. Theme Toggle (Sáng / Tối) */}
            <button
              onClick={() => {
                soundFx.playClick();
                setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
              }}
              className={`p-1.5 rounded-xl border font-bold text-xs flex items-center space-x-1 transition-all active:scale-95 ${
                isLight
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title={isLight ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng Studio'}
            >
              {isLight ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-amber-300" />}
              <span className="text-[11px] hidden sm:inline">{isLight ? 'Sáng' : 'Tối'}</span>
            </button>

            {/* 2. View Mode Toggle (3D Không Gian • 2D Phẳng • 3D VR 360°) */}
            <div
              className={`flex items-center rounded-xl p-0.5 border text-xs font-bold ${
                isLight ? 'bg-amber-100/70 border-amber-200' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <button
                onClick={() => {
                  soundFx.playClick();
                  setViewMode('3d');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  viewMode === '3d'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Góc nhìn 3D không gian có chiều sâu"
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D</span>
              </button>
              
              <button
                onClick={() => {
                  soundFx.playClick();
                  setViewMode('2d');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  viewMode === '2d'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Góc nhìn 2D phẳng truyền thống"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2D</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setViewMode('vr');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  viewMode === 'vr'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Góc nhìn VR 360 toàn cảnh từ bục giảng"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>VR 360°</span>
              </button>
            </div>

            {/* 3. Hàng Ghế Selector (5 Hàng / 6 Hàng) */}
            <div
              className={`flex items-center rounded-xl p-0.5 border text-xs font-bold ${
                isLight ? 'bg-amber-100/70 border-amber-200' : 'bg-slate-800 border-slate-700'
              }`}
            >
              {[5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setRowCount(num)}
                  className={`px-2 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    rowCount === num
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {num} Hàng
                </button>
              ))}
            </div>

            {/* 4. In Sơ Đồ A4 */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
              title="Xem bản in sơ đồ lớp A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Sơ Đồ</span>
            </button>

            {/* 5. Tự động xếp chỗ trống */}
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

            {/* 6. Xáo trộn ngẫu nhiên */}
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
              className={`p-2 rounded-xl transition-colors ml-1 ${
                isLight ? 'text-slate-500 hover:bg-slate-200 hover:text-slate-900' : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VR 360 Rotation Perspective Slider (Chỉ hiện khi bật VR 360) */}
        {viewMode === 'vr' && (
          <div
            className={`my-2 p-3 rounded-2xl border flex items-center justify-between gap-4 animate-in fade-in ${
              isLight ? 'bg-amber-100/60 border-amber-300 text-amber-950' : 'bg-slate-800/80 border-slate-700 text-white'
            }`}
          >
            <div className="flex items-center space-x-2 shrink-0">
              <Compass className="w-5 h-5 text-amber-500 animate-spin" />
              <span className="text-xs font-black">Góc nhìn VR từ Bục Giảng: {vrAngle}°</span>
            </div>
            <input
              type="range"
              min="-25"
              max="25"
              value={vrAngle}
              onChange={(e) => setVrAngle(Number(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <button
              onClick={() => setVrAngle(0)}
              className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 shrink-0"
            >
              Chính Diện (0°)
            </button>
          </div>
        )}

        {/* Selected Student Banner Hint (Chế độ 1 Chạm) */}
        {selectedStudent && (
          <div className="my-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-400 p-2.5 rounded-2xl flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center space-x-2">
              <MousePointer className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                👉 Đang chọn: <strong className="text-amber-700 dark:text-amber-300 font-black">{selectedStudent.full_name}</strong>. Hãy bấm vào ghế muốn chuyển đến (hoặc bấm vào bạn khác) để đổi chỗ!
              </span>
            </div>
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-2.5 py-1 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-[10px] font-extrabold"
            >
              Hủy chọn
            </button>
          </div>
        )}

        {/* Unseated Students Drawer (nếu có học sinh chưa được xếp bàn) */}
        {unseatedStudents.length > 0 && (
          <div
            className={`my-2 p-2.5 rounded-2xl border ${
              isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/40 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-rose-600 dark:text-rose-300 flex items-center space-x-1">
                <span>⚠️ Chưa xếp chỗ:</span>
                <span className="underline">{unseatedStudents.length} học sinh</span>
              </span>
              <span className="text-[10px] text-slate-500">Bấm hoặc kéo các em vào bàn trống bên dưới</span>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
              {unseatedStudents.map(st => {
                const isSelected = selectedStudent?.id === st.id;
                const displayName = getSmartDisplayName(st.full_name, students);
                return (
                  <div
                    key={st.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, st)}
                    onClick={() => handleSeatClick(0, 0, st)}
                    className={`shrink-0 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black border-white ring-2 ring-amber-300 scale-105'
                        : isLight
                        ? 'bg-white border-rose-300 hover:border-amber-400 text-slate-800 shadow-xs'
                        : 'bg-slate-800 border-rose-500/50 hover:border-amber-400 text-white'
                    }`}
                    title={st.full_name}
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
                    <span className="text-[11px] font-extrabold">{displayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTAINER CHỨA LƯỚI CHỖ NGỒI (HỖ TRỢ 3D & VR ROTATION) */}
        <div
          style={
            viewMode === 'vr'
              ? {
                  transform: `perspective(1200px) rotateY(${vrAngle}deg)`,
                  transition: 'transform 0.2s ease-out',
                  transformOrigin: 'bottom center'
                }
              : {}
          }
          className="my-2"
        >
          {/* CỤM BÀN LỚP HỌC (Dãy 1-2 • LỐI ĐI CHÍNH • Dãy 3-4) */}
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-3">
            
            {/* CỤM TRÁI: DÃY 1 & DÃY 2 */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {aisles.slice(0, 2).map(aisle => renderAisle(aisle))}
            </div>

            {/* LỐI ĐI CHÍNH GIỮA LỚP (CENTRAL WALKWAY - RỘNG RÃI, TRANG NHÃ) */}
            <div
              className={`hidden lg:flex flex-col items-center justify-between py-5 px-3 rounded-3xl border-2 border-dashed select-none transition-all ${
                isLight
                  ? 'border-amber-300 bg-amber-50/60 shadow-xs text-amber-900'
                  : 'border-slate-700 bg-slate-800/40 text-amber-400'
              }`}
            >
              {/* Mũi tên hướng lên Bục giảng */}
              <div className="flex flex-col items-center space-y-1">
                <span className="text-sm font-black text-amber-500 animate-bounce">▲</span>
                <span className="text-[10px] font-black uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 py-2">
                  LỐI ĐI CHÍNH GIỮA LỚP
                </span>
                <span className="text-sm font-black text-amber-500">▲</span>
              </div>

              {/* Vạch sơn hoa văn sàn lớp học */}
              <div className="my-auto flex flex-col items-center space-y-4 opacity-50">
                <div className="w-2 h-7 rounded-full bg-amber-400"></div>
                <div className="w-2 h-7 rounded-full bg-amber-400"></div>
                <div className="w-2 h-7 rounded-full bg-amber-400"></div>
                <div className="w-2 h-7 rounded-full bg-amber-400"></div>
                <div className="w-2 h-7 rounded-full bg-amber-400"></div>
              </div>

              {/* Nhãn thông số lối đi */}
              <div className="text-[9px] font-black uppercase tracking-wider text-center opacity-80">
                Rộng 1.2m
              </div>
            </div>

            {/* Vạch lối đi giữa lớp trên thiết bị di động / màn hình nhỏ */}
            <div
              className={`lg:hidden flex items-center justify-center space-x-2 py-2 px-3 rounded-2xl border-y-2 border-dashed font-black text-xs my-1 ${
                isLight ? 'bg-amber-100/60 border-amber-300 text-amber-900' : 'bg-slate-800 border-slate-700 text-amber-300'
              }`}
            >
              <span>◀ DÃY 1 & 2</span>
              <span>• LỐI ĐI TRUNG TÂM •</span>
              <span>DÃY 3 & 4 ▶</span>
            </div>

            {/* CỤM PHẢI: DÃY 3 & DÃY 4 */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {aisles.slice(2, 4).map(aisle => renderAisle(aisle))}
            </div>

          </div>
        </div>

        {/* BỤC GIẢNG, BẢNG LỚP & BÀN GIÁO VIÊN (DƯỚI CÙNG - CHUẨN ẢNH 1) */}
        <div
          className={`my-3 flex items-center justify-between gap-3 p-3.5 rounded-3xl border-2 transition-all ${
            isLight
              ? 'bg-gradient-to-r from-amber-100/90 via-orange-50/80 to-amber-100/90 border-amber-300 shadow-md'
              : 'bg-slate-900/90 border-slate-700 shadow-xl'
          }`}
        >
          {/* CỬA VÀO LỚP HỌC (GÓC DƯỚI BÊN TRÁI) */}
          <div
            className={`w-28 sm:w-36 rounded-2xl p-2.5 text-center font-black text-xs flex items-center justify-center space-x-1.5 shrink-0 border-2 shadow-xs ${
              isLight
                ? 'bg-amber-200/70 border-amber-400 text-amber-950'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
          >
            <DoorOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>CỬA VÀO</span>
            <span>➔</span>
          </div>

          {/* BẢNG ĐEN LỚP HỌC (CHÍNH GIỮA DƯỚI CÙNG) */}
          <div className="flex-1 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 border-4 border-amber-500/60 rounded-2xl p-2.5 text-center shadow-lg text-white">
            <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-widest block">
              ✦ BẢNG LỚP {currentClass?.name || '7A6'} ✦
            </span>
            <span className="text-[10px] text-emerald-200/80 font-bold block mt-0.5">
              Niên khóa: {currentClass?.academic_year || '2025 - 2026'} • Khẩu hiệu: Tiên Học Lễ — Hậu Học Văn
            </span>
          </div>

          {/* BÀN GIÁO VIÊN (GÓC DƯỚI BÊN PHẢI) */}
          <div
            className={`w-36 sm:w-48 rounded-2xl p-2 text-center shrink-0 border-2 shadow-xs ${
              isLight
                ? 'bg-purple-100/80 border-purple-300 text-purple-950'
                : 'bg-purple-900/40 border-purple-500/40 text-purple-300'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider block">BÀN GIÁO VIÊN</span>
            <span className="text-[11px] font-black block truncate mt-0.5" title={teacherName}>
              {teacherName}
            </span>
          </div>
        </div>

        {/* Footer info & Buttons */}
        <div
          className={`mt-2 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold ${
            isLight ? 'border-amber-200 text-slate-600' : 'border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Mẹo: Tên hiển thị dạng rút gọn (Tên đệm + Tên). Bấm vào bạn bất kỳ rồi bấm ghế đích để chuyển chỗ tức thì.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-md active:scale-95 shrink-0"
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

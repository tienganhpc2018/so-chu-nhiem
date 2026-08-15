import React, { useState, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Grid,
  Monitor,
  Box,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Shuffle,
  RotateCcw,
  Image as ImageIcon,
  Check,
  Plus,
  Star,
  User,
  Sparkles,
  Pin
} from 'lucide-react';

export const SeatingGrid = ({
  students = [],
  currentClass = null,
  teacherProfile = null,
  onMoveStudentSeat,
  onAddPoints,
  onDeductPoints,
  onOpenRewardShop,
  onSelectStudent,
  onOpenAvatarModal
}) => {
  // Toolbar States (Matching Screenshots 1, 2, 3)
  const [dayCount, setDayCount] = useState(4); // 2, 3, 4, 6 Dãy
  const [capacity, setCapacity] = useState('auto'); // 'auto', 20, 24, 30, 36
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const [zoomLevel, setZoomLevel] = useState(85); // 50% - 150%
  const [perspective, setPerspective] = useState('normal'); // 'near' | 'normal' | 'deep'
  const [selectedUnseatedId, setSelectedUnseatedId] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);

  const containerRef = useRef(null);

  // Unseated students filter
  const unseatedStudents = students.filter(
    s => !s.seat_row || !s.seat_col || s.seat_row > 6 || s.seat_col > dayCount
  );

  // Map student at seat (row r, col c)
  const getStudentAtSeat = (r, c) => {
    return students.find(s => Number(s.seat_row) === r && Number(s.seat_col) === c);
  };

  // Zoom handlers
  const handleZoom = (delta) => {
    soundFx.playClick();
    setZoomLevel(prev => Math.max(50, Math.min(150, prev + delta)));
  };

  // Shuffle & Auto Seat All
  const handleAutoSeatAll = () => {
    soundFx.playCorrect();
    confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });

    const totalDesks = dayCount * 6;
    let deskIndex = 0;

    // Fill empty desks sequentially with unseated students
    students.forEach((st, idx) => {
      const col = (idx % dayCount) + 1;
      const row = Math.floor(idx / dayCount) + 1;
      onMoveStudentSeat(st.id, row, col);
    });
  };

  // Clear all seats
  const handleClearAllSeats = () => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa vị trí tất cả bàn học để xếp lại từ đầu?')) return;
    soundFx.playClick();
    students.forEach(st => {
      onMoveStudentSeat(st.id, 0, 0);
    });
    setSelectedUnseatedId(null);
  };

  // Touch/Click to place unseated student into empty desk
  const handleCellClick = (r, c) => {
    const student = getStudentAtSeat(r, c);

    if (student) {
      onSelectStudent?.(student);
      return;
    }

    // If an unseated student is selected, place them here!
    if (selectedUnseatedId) {
      soundFx.playCorrect();
      onMoveStudentSeat(selectedUnseatedId, r, c);
      setSelectedUnseatedId(null);
    }
  };

  // Export to PNG Image
  const handleExportPNG = () => {
    soundFx.playCorrect();
    // Native canvas exporter
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    // Background fill
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 1200, 900);

    // Title
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SƠ ĐỒ PHÒNG HỌC LỚP ${currentClass?.name || '8A5'}`, 600, 50);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`GVCN: ${teacherProfile?.full_name || 'Nguyễn Văn Hải'} • Sĩ số: ${students.length} HS`, 600, 85);

    // Save image
    const link = document.createElement('a');
    link.download = `SoDoPhongHoc_Lop_${currentClass?.name || '8A5'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Rows and Cols arrays
  const rows = [1, 2, 3, 4];
  const cols = Array.from({ length: dayCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6 select-none" ref={containerRef}>
      
      {/* TOOLBAR 1: Row count, Desk Capacity & Action Buttons (Matching Screenshot 3) */}
      <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-soft flex flex-wrap items-center justify-between gap-4">
        
        {/* Row Count Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-black text-slate-500 flex items-center space-x-1">
            <Grid className="w-4 h-4 text-purple-600" />
            <span>Dãy bàn:</span>
          </span>

          {[2, 3, 4, 6].map(num => (
            <button
              key={num}
              onClick={() => {
                soundFx.playClick();
                setDayCount(num);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                dayCount === num ? 'bg-purple-600 text-white shadow-purple-glow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {num} Dãy
            </button>
          ))}
        </div>

        {/* Action Buttons (Matching Screenshot 3) */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <button
            onClick={handleAutoSeatAll}
            className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Shuffle className="w-4 h-4 text-emerald-600" />
            <span>Xếp tất cả ({students.length} HS)</span>
          </button>

          <button
            onClick={handleClearAllSeats}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4 text-purple-600" />
            <span>Xóa xếp chỗ</span>
          </button>

          <button
            onClick={handleExportPNG}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-extrabold shadow-purple-glow transition-all flex items-center space-x-1.5"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Xuất ra Ảnh (PNG)</span>
          </button>

        </div>

      </div>

      {/* TOOLBAR 2: View Mode, Zoom & 3D Angles (Matching Screenshot 1 & 2) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-3 px-5 border border-purple-100 shadow-soft flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-black text-slate-800 tracking-tight flex items-center space-x-1.5">
            <Box className="w-5 h-5 text-purple-600" />
            <span>SƠ ĐỒ PHÒNG HỌC</span>
          </span>
          <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold px-3 py-0.5 rounded-full">
            {dayCount} Dãy • {dayCount * 4} Bàn Học
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('3D');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                viewMode === '3D' ? 'bg-purple-600 text-white shadow-purple-glow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>3D Không Gian</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('2D');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                viewMode === '2D' ? 'bg-purple-600 text-white shadow-purple-glow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2D Phẳng</span>
            </button>
          </div>

          {/* Zoom Control Group */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1 text-xs font-bold">
            <button onClick={() => handleZoom(-10)} className="text-slate-500 hover:text-purple-600">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-slate-800 w-10 text-center">{zoomLevel}%</span>
            <button onClick={() => handleZoom(10)} className="text-slate-500 hover:text-purple-600">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setZoomLevel(100)} className="text-slate-400 hover:text-slate-700 ml-1">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3D Angles */}
          {viewMode === '3D' && (
            <div className="flex items-center space-x-1 text-xs font-bold text-slate-500 bg-slate-50 p-1 rounded-2xl border border-slate-200">
              <span className="px-2 text-[10px] uppercase font-extrabold text-slate-400">Góc 3D:</span>
              <button
                onClick={() => setPerspective('near')}
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${perspective === 'near' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}
              >
                Gần
              </button>
              <button
                onClick={() => setPerspective('normal')}
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${perspective === 'normal' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}
              >
                Chuẩn
              </button>
              <button
                onClick={() => setPerspective('deep')}
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${perspective === 'deep' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}
              >
                Sâu
              </button>
            </div>
          )}

        </div>
      </div>

      {/* MAIN LAYOUT: CANVAS 3D/2D + UNSEATED TRAY (Matching Screenshots 1, 2, 4, 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column 1, 2, 3: Classroom Stage Area */}
        <div className="lg:col-span-3 space-y-6">
          
          <div
            className={`transition-all duration-300 transform origin-top ${
              viewMode === '3D'
                ? perspective === 'near'
                  ? 'rotate-x-6 scale-95'
                  : perspective === 'deep'
                  ? 'rotate-x-16 scale-90'
                  : 'rotate-x-12'
                : ''
            }`}
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* Blackboard Banner (Matching Screenshot 1 & 2) */}
            <div className="w-full bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border-4 border-amber-500/40 text-center relative overflow-hidden mb-6">
              <div className="text-[11px] font-extrabold tracking-widest text-amber-400 uppercase mb-1">
                ✦ KỶ LUẬT - TRI THỨC ✦ SÁNG TẠO ✦
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300">
                ✦ ★ BẢNG LỚP {currentClass?.name || '8A5'} ★ ✦
              </h2>
              <div className="text-xs font-bold text-slate-300 mt-2 flex flex-wrap items-center justify-center gap-3">
                <span>Niên khóa: {currentClass?.academic_year || '2025 - 2026'}</span>
                <span>•</span>
                <span>GVCN: {teacherProfile?.full_name || 'Nguyễn Văn Hải'}</span>
                <span>•</span>
                <span>Sĩ số: {students.length} học sinh</span>
              </div>
            </div>

            {/* Teacher Desk Box (Matching Screenshot 1, 2, 4) */}
            <div className="w-64 mx-auto bg-purple-100/90 border-2 border-purple-300 rounded-3xl p-3.5 text-center shadow-md mb-8">
              <div className="text-xs font-black text-purple-800 flex items-center justify-center space-x-1.5 uppercase">
                <Monitor className="w-4 h-4 text-purple-600" />
                <span>BÀN GIÁO VIÊN ☀️</span>
              </div>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                {teacherProfile?.full_name || 'Nguyễn Văn Hải'}
              </div>
            </div>

            {/* Desk Columns Grid (Dãy 1, Dãy 2, Dãy 3, Dãy 4...) */}
            <div className={`grid gap-6 ${
              dayCount === 2 ? 'grid-cols-2' : dayCount === 3 ? 'grid-cols-3' : dayCount === 4 ? 'grid-cols-4' : 'grid-cols-6'
            }`}>
              {cols.map(c => (
                <div key={`col-${c}`} className="space-y-4">
                  
                  {/* Row Pin Banner */}
                  <div className="bg-purple-600 text-white rounded-2xl py-1.5 px-3 text-center text-xs font-black shadow-md flex items-center justify-center space-x-1">
                    <Pin className="w-3.5 h-3.5 fill-white" />
                    <span>DÃY {c}</span>
                  </div>

                  {/* Desks in this Column */}
                  {rows.map(r => {
                    const student = getStudentAtSeat(r, c);
                    const deskNumber = (r - 1) * dayCount + c;

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        className={`rounded-3xl p-3 transition-all relative border-2 ${
                          student
                            ? 'bg-white border-purple-200 shadow-soft hover:shadow-xl'
                            : selectedUnseatedId
                            ? 'bg-purple-50 border-dashed border-purple-500 animate-pulse cursor-pointer'
                            : 'bg-slate-50/60 border-dashed border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                          <span>Bàn {deskNumber} • Hàng {r}</span>
                          {student && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>{student.total_stars || 0} xu</span>
                            </span>
                          )}
                        </div>

                        {student ? (
                          <div className="flex items-center space-x-3 my-1">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                soundFx.playClick();
                                onOpenAvatarModal?.(student);
                              }}
                              className="relative cursor-pointer group"
                              title="Bấm để đổi ảnh đại diện"
                            >
                              <img
                                src={student.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.id}`}
                                alt={student.full_name}
                                className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-200 bg-purple-50 group-hover:scale-105 transition-transform"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-800 truncate">{student.full_name}</h4>
                              <span className="text-[10px] font-bold text-slate-400 block">
                                {student.gender === 'male' ? 'Nam' : 'Nữ'} • Tổ {student.team_group || 1}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-3 text-center space-y-1 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mx-auto">
                              <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-purple-700 block">Bàn Trống</span>
                          </div>
                        )}

                      </div>
                    );
                  })}

                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Right Column 4: Unseated Students Tray (Matching Screenshot 2, 3, 5) */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col h-fit sticky top-24 space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-800 flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Học sinh chưa xếp ({unseatedStudents.length})</span>
            </h3>
          </div>

          {unseatedStudents.length === 0 ? (
            <div className="bg-emerald-50 rounded-2xl p-6 text-center space-y-2 border border-emerald-200">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black text-emerald-800">Tất cả học sinh đã có chỗ ngồi!</h4>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {unseatedStudents.map(st => {
                const isSelected = selectedUnseatedId === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedUnseatedId(isSelected ? null : st.id);
                    }}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-purple-glow transform scale-[1.02]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                        isSelected ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {st.full_name.charAt(0)}
                      </div>
                      <span className="text-xs font-extrabold truncate">{st.full_name}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'text-slate-400'
                    }`}>
                      Chạm chọn
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { PrintSeatingChartModal } from './PrintSeatingChartModal';
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
  Printer,
  Check,
  Plus,
  Star,
  Users,
  Pin,
  Glasses,
  Handshake,
  Glasses as GlassesIcon,
  Save,
  FolderOpen,
  Eye,
  Camera
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
  // Toolbar States
  const [dayCount, setDayCount] = useState(4); // 2, 3, 4, 6 Dãy
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D' | 'VR'
  const [zoomLevel, setZoomLevel] = useState(85);
  const [perspective, setPerspective] = useState('normal'); // 'near' | 'normal' | 'deep'
  const [selectedUnseatedId, setSelectedUnseatedId] = useState(null);

  // Preset Layout State (Feature 2)
  const [selectedPreset, setSelectedPreset] = useState('hk1'); // 'hk1' | 'exam' | 'group'
  const [savedPresets, setSavedPresets] = useState({
    hk1: null,
    exam: null,
    group: null
  });

  // VR 360 State (Feature 5)
  const [vrAngle, setVrAngle] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Load saved presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`seating_presets_${currentClass?.id || 'demo'}`);
      if (stored) {
        setSavedPresets(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Lỗi tải phương án sơ đồ:', err);
    }
  }, [currentClass]);

  // Unseated students filter
  const unseatedStudents = students.filter(
    s => !s.seat_row || !s.seat_col || s.seat_row > 6 || s.seat_col > dayCount
  );

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

    students.forEach((st, idx) => {
      const col = (idx % dayCount) + 1;
      const row = Math.floor(idx / dayCount) + 1;
      onMoveStudentSeat(st.id, row, col);
    });
  };

  // Feature 3: Smart Auto-Seating for Glasses / Height
  const handleSeatGlassesAndHeight = () => {
    soundFx.playCorrect();
    confetti({ particleCount: 35, spread: 80, origin: { y: 0.5 } });

    // Separate students with glasses or shorter height
    const priorityStudents = [...students].sort((a, b) => {
      if (a.has_glasses && !b.has_glasses) return -1;
      if (!a.has_glasses && b.has_glasses) return 1;
      return 0;
    });

    priorityStudents.forEach((st, idx) => {
      const col = (idx % dayCount) + 1;
      const row = Math.floor(idx / dayCount) + 1; // Row 1 & 2 filled first!
      onMoveStudentSeat(st.id, row, col);
    });
  };

  // Feature 4: Pair Study Rule (Ghép Đôi Bạn Cùng Tiến)
  const handlePairStudyRule = () => {
    soundFx.playCorrect();
    confetti({ particleCount: 40, spread: 90, origin: { y: 0.5 } });

    // Sort by total stars: highest stars (Top) and lowest stars
    const sorted = [...students].sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0));
    const paired = [];

    const half = Math.floor(sorted.length / 2);
    const topHalf = sorted.slice(0, half);
    const bottomHalf = sorted.slice(half).reverse();

    for (let i = 0; i < half; i++) {
      if (topHalf[i]) paired.push(topHalf[i]);
      if (bottomHalf[i]) paired.push(bottomHalf[i]);
    }
    // Add any remaining
    sorted.forEach(st => {
      if (!paired.includes(st)) paired.push(st);
    });

    paired.forEach((st, idx) => {
      const col = (idx % dayCount) + 1;
      const row = Math.floor(idx / dayCount) + 1;
      onMoveStudentSeat(st.id, row, col);
    });
  };

  // Feature 2: Save current seating layout as Preset
  const handleSavePreset = () => {
    soundFx.playCorrect();
    const layoutSnapshot = students.map(s => ({
      id: s.id,
      seat_row: s.seat_row,
      seat_col: s.seat_col
    }));

    const updatedPresets = {
      ...savedPresets,
      [selectedPreset]: layoutSnapshot
    };

    setSavedPresets(updatedPresets);
    localStorage.setItem(
      `seating_presets_${currentClass?.id || 'demo'}`,
      JSON.stringify(updatedPresets)
    );
  };

  // Feature 2: Load selected Preset layout
  const handleLoadPreset = (presetKey) => {
    soundFx.playClick();
    setSelectedPreset(presetKey);

    const snapshot = savedPresets[presetKey];
    if (snapshot && Array.isArray(snapshot)) {
      snapshot.forEach(item => {
        onMoveStudentSeat(item.id, item.seat_row, item.seat_col);
      });
      soundFx.playCorrect();
    }
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

    if (selectedUnseatedId) {
      soundFx.playCorrect();
      onMoveStudentSeat(selectedUnseatedId, r, c);
      setSelectedUnseatedId(null);
    }
  };

  const rows = [1, 2, 3, 4];
  const cols = Array.from({ length: dayCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6 select-none">
      
      {/* TOOLBAR 1: Layout Presets & Smart Auto-Seating Rules (Features 2, 3, 4, 1) */}
      <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-soft flex flex-wrap items-center justify-between gap-4">
        
        {/* Feature 2: Layout Presets Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-black text-slate-500 flex items-center space-x-1">
            <FolderOpen className="w-4 h-4 text-purple-600" />
            <span>Phương án:</span>
          </span>

          <select
            value={selectedPreset}
            onChange={(e) => handleLoadPreset(e.target.value)}
            className="bg-purple-50 border border-purple-200 text-purple-900 rounded-xl px-3 py-1.5 text-xs font-extrabold outline-none"
          >
            <option value="hk1">Sơ đồ Học kỳ I {savedPresets.hk1 ? '✓' : ''}</option>
            <option value="exam">Sơ đồ Ôn thi {savedPresets.exam ? '✓' : ''}</option>
            <option value="group">Sơ đồ Thảo luận nhóm {savedPresets.group ? '✓' : ''}</option>
          </select>

          <button
            onClick={handleSavePreset}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1"
            title="Lưu vị trí chỗ ngồi hiện tại vào phương án này"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu sơ đồ</span>
          </button>
        </div>

        {/* Feature 3 & 4: Smart Seating Rules */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Feature 3: Glasses & Height Rule */}
          <button
            onClick={handleSeatGlassesAndHeight}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5"
            title="Ưu tiên xếp học sinh cận thị & chiều cao khiêm tốn vào Hàng 1-2"
          >
            <GlassesIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Xếp Cận Thị / Thấp</span>
          </button>

          {/* Feature 4: Pair Study Rule */}
          <button
            onClick={handlePairStudyRule}
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5"
            title="Ghép 1 học sinh tiêu biểu ngồi cạnh 1 học sinh cần hỗ trợ"
          >
            <Handshake className="w-3.5 h-3.5 text-amber-600" />
            <span>Đôi Bạn Cùng Tiến</span>
          </button>

          {/* Feature 1: Print A4 PDF Modal */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowPrintModal(true);
            }}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-purple-glow transition-all flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Sơ Đồ A4 (PDF)</span>
          </button>

        </div>

      </div>

      {/* TOOLBAR 2: View Mode, VR 360 Camera & Zoom Controls */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-3 px-5 border border-purple-100 shadow-soft flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-black text-slate-800 tracking-tight flex items-center space-x-1.5">
            <Box className="w-5 h-5 text-purple-600" />
            <span>SƠ ĐỒ PHÒNG HỌC</span>
          </span>

          {/* Day count selector */}
          <div className="flex items-center space-x-1 ml-2">
            {[2, 3, 4, 6].map(num => (
              <button
                key={num}
                onClick={() => {
                  soundFx.playClick();
                  setDayCount(num);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                  dayCount === num ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {num} Dãy
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Mode Switcher: 3D, 2D, VR 360 (Feature 5) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('3D');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1 ${
                viewMode === '3D' ? 'bg-purple-600 text-white shadow-purple-glow' : 'text-slate-600'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Không Gian</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('2D');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1 ${
                viewMode === '2D' ? 'bg-purple-600 text-white shadow-purple-glow' : 'text-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Phẳng</span>
            </button>

            {/* Feature 5: 3D VR Mode */}
            <button
              onClick={() => {
                soundFx.playCorrect();
                setViewMode('VR');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1 ${
                viewMode === 'VR' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-glow' : 'text-slate-600'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-pink-300" />
              <span>3D VR 360°</span>
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

        </div>
      </div>

      {/* MAIN CANVAS AREA (3D / 2D / VR 360) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Columns: Classroom Stage */}
        <div className="lg:col-span-3 space-y-6">
          
          <div
            className={`transition-all duration-500 transform origin-top ${
              viewMode === '3D'
                ? perspective === 'near'
                  ? 'rotate-x-6 scale-95'
                  : perspective === 'deep'
                  ? 'rotate-x-16 scale-90'
                  : 'rotate-x-12'
                : viewMode === 'VR'
                ? 'rotate-x-24 scale-95 bg-slate-950 p-6 rounded-3xl shadow-2xl text-white'
                : ''
            }`}
            style={{
              transform: viewMode === 'VR' ? `rotateY(${vrAngle}deg) rotateX(20deg) scale(${zoomLevel / 100})` : `scale(${zoomLevel / 100})`
            }}
          >
            
            {/* Feature 5 VR Angle Slider */}
            {viewMode === 'VR' && (
              <div className="flex items-center justify-between mb-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white text-xs font-extrabold">
                <span className="flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-pink-400" />
                  <span>Xoay Góc Nhìn Camera VR 360° (Góc Bàn Giáo Viên):</span>
                </span>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={vrAngle}
                  onChange={(e) => setVrAngle(Number(e.target.value))}
                  className="w-48 accent-pink-500 cursor-pointer"
                />
              </div>
            )}

            {/* Blackboard Banner */}
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

            {/* Teacher Desk Box */}
            <div className="w-64 mx-auto bg-purple-100/90 border-2 border-purple-300 rounded-3xl p-3.5 text-center shadow-md mb-8">
              <div className="text-xs font-black text-purple-800 flex items-center justify-center space-x-1.5 uppercase">
                <Monitor className="w-4 h-4 text-purple-600" />
                <span>BÀN GIÁO VIÊN ☀️</span>
              </div>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                {teacherProfile?.full_name || 'Nguyễn Văn Hải'}
              </div>
            </div>

            {/* Desk Columns Grid */}
            <div className={`grid gap-6 ${
              dayCount === 2 ? 'grid-cols-2' : dayCount === 3 ? 'grid-cols-3' : dayCount === 4 ? 'grid-cols-4' : 'grid-cols-6'
            }`}>
              {cols.map(c => (
                <div key={`col-${c}`} className="space-y-4">
                  
                  <div className="bg-purple-600 text-white rounded-2xl py-1.5 px-3 text-center text-xs font-black shadow-md flex items-center justify-center space-x-1">
                    <Pin className="w-3.5 h-3.5 fill-white" />
                    <span>DÃY {c}</span>
                  </div>

                  {rows.map(r => {
                    const student = getStudentAtSeat(r, c);
                    const deskNumber = (r - 1) * dayCount + c;

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        className={`rounded-3xl p-3 transition-all relative border-2 ${
                          student
                            ? 'bg-white border-purple-200 shadow-soft hover:shadow-xl text-slate-800'
                            : selectedUnseatedId
                            ? 'bg-purple-50 border-dashed border-purple-500 animate-pulse cursor-pointer'
                            : 'bg-slate-50/60 border-dashed border-slate-200 hover:border-purple-300 text-slate-600'
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
                              <h4 className="text-xs font-black text-slate-800 truncate flex items-center space-x-1">
                                <span>{student.full_name}</span>
                                {student.has_glasses && <span title="Cận thị">👓</span>}
                              </h4>
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

        {/* Right Column 4: Unseated Students Tray */}
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
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold truncate block">{st.full_name}</span>
                        {st.has_glasses && <span className="text-[10px] text-blue-500 font-bold block">👓 Cận thị</span>}
                      </div>
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

      {/* Feature 1: Print A4 PDF Modal */}
      <PrintSeatingChartModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        currentClass={currentClass}
        students={students}
        teacherProfile={teacherProfile}
      />

    </div>
  );
};

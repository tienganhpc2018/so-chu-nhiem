import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { getSmartDisplayName } from '../utils/nameFormatter';
import { PrintSeatingChartModal } from './PrintSeatingChartModal';
import { EditStudentModal } from './EditStudentModal';
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
  Glasses as GlassesIcon,
  Handshake,
  Save,
  FolderOpen,
  Eye,
  Camera,
  AlertTriangle,
  Users2,
  RefreshCw,
  Crown,
  Shield,
  Heart,
  Search,
  Sparkles
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
  onOpenAvatarModal,
  onSaveStudentInfo
}) => {
  // Toolbar States: Default 4 Dãy Bàn
  const [dayCount, setDayCount] = useState(4);
  const [viewMode, setViewMode] = useState('3D');
  const [zoomLevel, setZoomLevel] = useState(85);
  const [perspective, setPerspective] = useState('normal');
  const [selectedUnseatedId, setSelectedUnseatedId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  // Feature 4: Search & Highlight State
  const [searchQuery, setSearchQuery] = useState('');

  // Preset Layout State
  const [selectedPreset, setSelectedPreset] = useState('hk1');
  const [savedPresets, setSavedPresets] = useState({
    hk1: null,
    exam: null,
    group: null
  });

  // VR 360 & Print Modal State
  const [vrAngle, setVrAngle] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);

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
    s => !s.seat_row || !s.seat_col || s.seat_row > 6 || s.seat_col > dayCount * 2
  );

  // Get student at Double Desk (row r, col c, seatPos: 1=Left, 2=Right)
  const getStudentAtSeatPos = (r, c, seatPos) => {
    return students.find(s => Number(s.seat_row) === r && Number(s.seat_col) === (c - 1) * 2 + seatPos);
  };

  // Feature 1: Initials Badge Generator (2 letters e.g. MB for Minh Bảy)
  const getStudentInitials = (fullName = '') => {
    if (!fullName) return 'HS';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Zoom handlers
  const handleZoom = (delta) => {
    soundFx.playClick();
    setZoomLevel(prev => Math.max(50, Math.min(150, prev + delta)));
  };

  // Feature 3: Boy-Girl Cross-Team Seating Rule (Nam Nữ Chéo Tổ)
  const handleBoyGirlCrossTeamRule = () => {
    soundFx.playCorrect();
    confetti({ particleCount: 35, spread: 85, origin: { y: 0.5 } });

    // Group males and females by team_group
    const males = students.filter(s => s.gender === 'male').sort((a, b) => (a.team_group || 1) - (b.team_group || 1));
    const females = students.filter(s => s.gender === 'female').sort((a, b) => (b.team_group || 1) - (a.team_group || 1));
    const rest = students.filter(s => !males.includes(s) && !females.includes(s));

    const pairedList = [];
    const maxLength = Math.max(males.length, females.length);

    for (let i = 0; i < maxLength; i++) {
      if (males[i]) pairedList.push(males[i]);
      if (females[i]) pairedList.push(females[i]);
    }
    rest.forEach(st => {
      if (!pairedList.includes(st)) pairedList.push(st);
    });

    pairedList.forEach((st, idx) => {
      const deskIndex = Math.floor(idx / 2);
      const seatPos = (idx % 2) + 1;

      const col = (deskIndex % dayCount) * 2 + seatPos;
      const row = Math.floor(deskIndex / dayCount) + 1;
      onMoveStudentSeat(st.id, row, col);
    });
  };

  // Rotate Columns after Semester 1
  const handleRotateColumns = () => {
    soundFx.playCorrect();
    confetti({ particleCount: 40, spread: 90, origin: { y: 0.5 } });

    students.forEach(st => {
      if (st.seat_row && st.seat_col) {
        let currentCol = Number(st.seat_col);
        let newCol = currentCol + 2;
        if (newCol > dayCount * 2) {
          newCol = newCol % (dayCount * 2);
          if (newCol === 0) newCol = dayCount * 2;
        }
        onMoveStudentSeat(st.id, st.seat_row, newCol);
      }
    });
  };

  // Smart Auto-Seating for Glasses / Height
  const handleSeatGlassesAndHeight = () => {
    soundFx.playCorrect();
    confetti({ particleCount: 35, spread: 80, origin: { y: 0.5 } });

    const priorityStudents = [...students].sort((a, b) => {
      const scoreA = (a.has_glasses ? 2 : 0) + (a.height_level === 'short' ? 1 : 0);
      const scoreB = (b.has_glasses ? 2 : 0) + (b.height_level === 'short' ? 1 : 0);
      return scoreB - scoreA;
    });

    priorityStudents.forEach((st, idx) => {
      const deskIndex = Math.floor(idx / 2);
      const seatPos = (idx % 2) + 1;

      const col = (deskIndex % dayCount) * 2 + seatPos;
      const row = Math.floor(deskIndex / dayCount) + 1;
      onMoveStudentSeat(st.id, row, col);
    });
  };

  // Save current seating layout as Preset
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

  // Load selected Preset layout
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

  // Touch/Click to place unseated student into empty desk seat
  const handleCellClick = (r, c, seatPos) => {
    const targetCol = (c - 1) * 2 + seatPos;
    const student = getStudentAtSeatPos(r, c, seatPos);

    if (student) {
      onSelectStudent?.(student);
      return;
    }

    if (selectedUnseatedId) {
      soundFx.playCorrect();
      onMoveStudentSeat(selectedUnseatedId, r, targetCol);
      setSelectedUnseatedId(null);
    }
  };

  // Feature 4: Check if student matches search query for highlight
  const isMatchSearch = (student) => {
    if (!searchQuery.trim() || !student) return false;
    return student.full_name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  };

  const glassesCount = students.filter(s => s.has_glasses).length;
  const weakCount = students.filter(s => s.academic_level === 'weak').length;
  const officersCount = students.filter(s => s.class_role && s.class_role !== 'member').length;

  const glassesPct = students.length > 0 ? Math.round((glassesCount / students.length) * 100) : 0;
  const weakPct = students.length > 0 ? Math.round((weakCount / students.length) * 100) : 0;

  const rows = [1, 2, 3, 4];
  const cols = Array.from({ length: dayCount }, (_, i) => i + 1);

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'leader':
        return <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-amber-300">⭐ Lớp trưởng</span>;
      case 'vice_study':
        return <span className="bg-purple-100 text-purple-900 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-purple-300">📝 LP Học tập</span>;
      case 'vice_art':
        return <span className="bg-pink-100 text-pink-900 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-pink-300">🎨 LP Văn thể</span>;
      case 'vice_labor':
        return <span className="bg-emerald-100 text-emerald-900 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-emerald-300">🏃 LP Lao động</span>;
      case 'team_leader':
        return <span className="bg-blue-100 text-blue-900 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-blue-300">👑 Tổ trưởng</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* FEATURE 4: SEARCH BAR & MEDICAL STATS BAR */}
      <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-soft space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Feature 4 Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-purple-600 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm vị trí học sinh... (vd: Minh Bảy)"
              className="w-full bg-purple-50/70 border border-purple-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-purple-400 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold hover:text-slate-600">
                ✕
              </button>
            )}
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-black text-blue-900 flex items-center space-x-1.5">
              <GlassesIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Cận thị: {glassesCount} HS ({glassesPct}%)</span>
            </div>

            <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-black text-amber-900 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Cần hỗ trợ: {weakCount} HS ({weakPct}%)</span>
            </div>

            <div className="bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-black text-purple-900 flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span>Cán sự: {officersCount} em</span>
            </div>
          </div>

        </div>

      </div>

      {/* TOOLBAR 1: Layout Presets & Smart Auto-Seating Rules */}
      <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-soft flex flex-wrap items-center justify-between gap-4">
        
        {/* Preset Switcher */}
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
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu sơ đồ</span>
          </button>
        </div>

        {/* Smart Rules & Print Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Feature 3: Boy-Girl Cross Team Rule */}
          <button
            onClick={handleBoyGirlCrossTeamRule}
            className="px-3.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5"
            title="Xếp 1 Nam Tổ X ngồi cùng Bàn Đôi với 1 Nữ Tổ Y"
          >
            <Heart className="w-3.5 h-3.5 text-pink-600" />
            <span>Nam Nữ Chéo Tổ</span>
          </button>

          <button
            onClick={handleRotateColumns}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xoay Dãy Đổi Chỗ HK2</span>
          </button>

          <button
            onClick={handleSeatGlassesAndHeight}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5"
          >
            <GlassesIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Xếp Cận Thị / Thấp</span>
          </button>

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

      {/* TOOLBAR 2: View Mode & 4 Dãy Bàn Default Selector */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-3 px-5 border border-purple-100 shadow-soft flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-black text-slate-800 tracking-tight flex items-center space-x-1.5">
            <Box className="w-5 h-5 text-purple-600" />
            <span>SƠ ĐỒ PHÒNG HỌC (4 DÃY BÀN ĐÔI - 2 EM / BÀN)</span>
          </span>

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

      {/* MAIN CANVAS: 4 DÃY BÀN ĐÔI (2 EM / BÀN) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
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
            
            {viewMode === 'VR' && (
              <div className="flex items-center justify-between mb-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white text-xs font-extrabold">
                <span className="flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-pink-400" />
                  <span>Xoay Góc Nhìn Camera VR 360° (Bàn Giáo Viên):</span>
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

            {/* 4 DÃY BÀN ĐÔI (2 EM / BÀN) */}
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
                    const studentLeft = getStudentAtSeatPos(r, c, 1);
                    const studentRight = getStudentAtSeatPos(r, c, 2);
                    const deskNumber = (r - 1) * dayCount + c;

                    // Feature 4 Search Highlight check
                    const isLeftMatch = isMatchSearch(studentLeft);
                    const isRightMatch = isMatchSearch(studentRight);
                    const isDeskHighlighted = isLeftMatch || isRightMatch;

                    return (
                      <div
                        key={`desk-${r}-${c}`}
                        className={`bg-white rounded-3xl p-3 border-2 transition-all space-y-2 relative ${
                          isDeskHighlighted
                            ? 'border-emerald-500 ring-4 ring-emerald-400 bg-emerald-50 scale-105 shadow-2xl animate-pulse z-10'
                            : 'border-purple-200 shadow-soft hover:shadow-xl'
                        }`}
                      >
                        <div className="text-[10px] font-black text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 flex items-center justify-between">
                          <span>🪑 Bàn Đôi {deskNumber} • Hàng {r}</span>
                          <span className="text-[9px] text-slate-400">(2 Ghế)</span>
                        </div>

                        {/* 2 Seats per Desk Container */}
                        <div className="grid grid-cols-2 gap-2">
                          
                          {/* Seat Left */}
                          <div
                            onClick={() => handleCellClick(r, c, 1)}
                            className={`p-2 rounded-2xl border transition-all text-center relative flex flex-col justify-between min-h-[105px] ${
                              studentLeft
                                ? isLeftMatch
                                  ? 'bg-emerald-100 border-emerald-400'
                                  : 'bg-slate-50 border-purple-200 hover:border-purple-400'
                                : selectedUnseatedId
                                ? 'bg-purple-50 border-dashed border-purple-500 animate-pulse cursor-pointer'
                                : 'bg-slate-50/50 border-dashed border-slate-200 hover:border-purple-300'
                            }`}
                          >
                            {studentLeft ? (
                              <div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    soundFx.playClick();
                                    setEditingStudent(studentLeft);
                                  }}
                                  className="relative group cursor-pointer"
                                  title="Bấm để cập nhật Chức vụ Ban Cán Sự / Cận thị / Học lực"
                                >
                                  {/* Feature 1 Initials Badge if image missing */}
                                  <img
                                    src={studentLeft.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentLeft.id}`}
                                    alt={studentLeft.full_name}
                                    className="w-9 h-9 rounded-xl mx-auto object-cover border border-purple-200 bg-white"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      soundFx.playClick();
                                      onOpenRewardShop?.(studentLeft);
                                    }}
                                    className="absolute -top-1 -right-1 bg-coral-500 text-white p-0.5 rounded-full text-[8px] shadow-sm hover:scale-125 transition-transform"
                                    title="Đổi quà trực tiếp"
                                  >
                                    🎁
                                  </button>
                                </div>
                                <h5 className="text-[11px] font-black text-slate-800 truncate mt-1">
                                  {getSmartDisplayName(studentLeft.full_name, students)}
                                </h5>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                                  {renderRoleBadge(studentLeft.class_role)}
                                  {studentLeft.has_glasses && (
                                    <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5 rounded-md" title="Học sinh bị cận thị">
                                      👓 Cận
                                    </span>
                                  )}
                                  {studentLeft.academic_level === 'weak' && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md" title="Học sinh cần hỗ trợ">
                                      ⚠️ Yếu
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="my-auto py-2">
                                <Plus className="w-3.5 h-3.5 text-purple-400 mx-auto mb-0.5" />
                                <span className="text-[9px] font-bold text-purple-600 block">Ghế 1 Trống</span>
                              </div>
                            )}
                          </div>

                          {/* Seat Right */}
                          <div
                            onClick={() => handleCellClick(r, c, 2)}
                            className={`p-2 rounded-2xl border transition-all text-center relative flex flex-col justify-between min-h-[105px] ${
                              studentRight
                                ? isRightMatch
                                  ? 'bg-emerald-100 border-emerald-400'
                                  : 'bg-slate-50 border-purple-200 hover:border-purple-400'
                                : selectedUnseatedId
                                ? 'bg-purple-50 border-dashed border-purple-500 animate-pulse cursor-pointer'
                                : 'bg-slate-50/50 border-dashed border-slate-200 hover:border-purple-300'
                            }`}
                          >
                            {studentRight ? (
                              <div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    soundFx.playClick();
                                    setEditingStudent(studentRight);
                                  }}
                                  className="relative group cursor-pointer"
                                  title="Bấm để cập nhật Chức vụ Ban Cán Sự / Cận thị / Học lực"
                                >
                                  <img
                                    src={studentRight.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentRight.id}`}
                                    alt={studentRight.full_name}
                                    className="w-9 h-9 rounded-xl mx-auto object-cover border border-purple-200 bg-white"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      soundFx.playClick();
                                      onOpenRewardShop?.(studentRight);
                                    }}
                                    className="absolute -top-1 -right-1 bg-coral-500 text-white p-0.5 rounded-full text-[8px] shadow-sm hover:scale-125 transition-transform"
                                    title="Đổi quà trực tiếp"
                                  >
                                    🎁
                                  </button>
                                </div>
                                <h5 className="text-[11px] font-black text-slate-800 truncate mt-1">
                                  {getSmartDisplayName(studentRight.full_name, students)}
                                </h5>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                                  {renderRoleBadge(studentRight.class_role)}
                                  {studentRight.has_glasses && (
                                    <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5 rounded-md" title="Học sinh bị cận thị">
                                      👓 Cận
                                    </span>
                                  )}
                                  {studentRight.academic_level === 'weak' && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md" title="Học sinh cần hỗ trợ">
                                      ⚠️ Yếu
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="my-auto py-2">
                                <Plus className="w-3.5 h-3.5 text-purple-400 mx-auto mb-0.5" />
                                <span className="text-[9px] font-bold text-purple-600 block">Ghế 2 Trống</span>
                              </div>
                            )}
                          </div>

                        </div>

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
                        {getStudentInitials(st.full_name)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold truncate block flex items-center space-x-1">
                          <span>{st.full_name}</span>
                          {st.has_glasses && <span>👓</span>}
                          {st.academic_level === 'weak' && <span>⚠️</span>}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block">Tổ {st.team_group || 1}</span>
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

      {/* Print Modal */}
      <PrintSeatingChartModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        currentClass={currentClass}
        students={students}
        teacherProfile={teacherProfile}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSaveStudentInfo={(updated) => {
          if (onSaveStudentInfo) {
            onSaveStudentInfo(updated);
          }
          setEditingStudent(null);
        }}
      />

    </div>
  );
};

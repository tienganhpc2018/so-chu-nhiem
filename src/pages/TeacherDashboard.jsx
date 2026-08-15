import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/soundEffects';
import { AddStudentModal } from '../components/AddStudentModal';
import { StudentAvatarModal } from '../components/StudentAvatarModal';
import { SeatingGrid } from '../components/SeatingGrid';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { AttendanceModal } from '../components/AttendanceModal';
import { PointCriteriaModal } from '../components/PointCriteriaModal';
import { LuckyWheelModal } from '../components/LuckyWheelModal';
import { NoiseMeterModal } from '../components/NoiseMeterModal';
import { GroupGeneratorModal } from '../components/GroupGeneratorModal';
import { RewardShopModal } from '../components/RewardShopModal';
import { CountdownTimerModal } from '../components/CountdownTimerModal';
import { MascotRobot } from '../components/MascotRobot';
import {
  UserPlus,
  Plus,
  Grid,
  Users,
  Award,
  Sparkles,
  Search,
  School,
  X,
  Star,
  FileSpreadsheet,
  Download,
  Upload,
  Trophy,
  Flame,
  ShieldCheck,
  Check
} from 'lucide-react';

export const TeacherDashboard = ({
  classes = [],
  currentClass = null,
  onSelectClass,
  onRefreshClasses,
  modalState = {},
  onOpenModal,
  onCloseModal
}) => {
  const { user, profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudentForPoints, setSelectedStudentForPoints] = useState(null);
  const [selectedStudentForReward, setSelectedStudentForReward] = useState(null);
  const [selectedStudentForAvatar, setSelectedStudentForAvatar] = useState(null);

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState(8);
  const [newStudentName, setNewStudentName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (currentClass) {
      fetchStudents(currentClass.id);
    } else {
      setStudents([]);
    }
  }, [currentClass]);

  const fetchStudents = async (classId) => {
    setLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('seat_row', { ascending: true })
        .order('seat_col', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách học sinh:', err);
      // Fallback sample students if DB query error
      if (classId === '8a500000-0000-0000-0000-0000000008a5' || String(classId).includes('8A5')) {
        setStudents(getSampleStudents8A5(classId));
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  const getSampleStudents8A5 = (cId) => [
    { id: 'st1', class_id: cId, full_name: 'Nguyễn Minh Anh', seat_row: 1, seat_col: 1, total_stars: 45, team_group: 1, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=minhanh' },
    { id: 'st2', class_id: cId, full_name: 'Trần Bảo Nam', seat_row: 1, seat_col: 2, total_stars: 30, team_group: 1, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=baonam' },
    { id: 'st3', class_id: cId, full_name: 'Lê Hoàng Khánh', seat_row: 1, seat_col: 3, total_stars: 50, team_group: 1, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=hoangkhanh' },
    { id: 'st4', class_id: cId, full_name: 'Phạm Thu Trang', seat_row: 1, seat_col: 4, total_stars: 65, team_group: 2, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=thutrang' },
    { id: 'st5', class_id: cId, full_name: 'Vũ Đức Anh', seat_row: 1, seat_col: 5, total_stars: 25, team_group: 2, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ducanh' },
    { id: 'st6', class_id: cId, full_name: 'Đặng Thảo Nguyên', seat_row: 1, seat_col: 6, total_stars: 40, team_group: 2, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=thaonguyen' },
    { id: 'st7', class_id: cId, full_name: 'Bùi Gia Huy', seat_row: 2, seat_col: 1, total_stars: 35, team_group: 3, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=giahuy' },
    { id: 'st8', class_id: cId, full_name: 'Đỗ Phương Linh', seat_row: 2, seat_col: 2, total_stars: 80, team_group: 3, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=phuonglinh' },
    { id: 'st9', class_id: cId, full_name: 'Nông Văn Mạnh', seat_row: 2, seat_col: 3, total_stars: 20, team_group: 3, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=vanmanh' },
    { id: 'st10', class_id: cId, full_name: 'Hà Ánh Tuyết', seat_row: 2, seat_col: 4, total_stars: 55, team_group: 4, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=anhtuyet' },
    { id: 'st11', class_id: cId, full_name: 'Ngô Quốc Trung', seat_row: 2, seat_col: 5, total_stars: 15, team_group: 4, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=quoctrung' },
    { id: 'st12', class_id: cId, full_name: 'Dương Mỹ Duyên', seat_row: 2, seat_col: 6, total_stars: 70, team_group: 4, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=myduyen' },
    { id: 'st13', class_id: cId, full_name: 'Lý Hải Long', seat_row: 3, seat_col: 1, total_stars: 60, team_group: 1, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=hailong' },
    { id: 'st14', class_id: cId, full_name: 'Trịnh Cẩm Tú', seat_row: 3, seat_col: 2, total_stars: 40, team_group: 2, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=camtu' },
    { id: 'st15', class_id: cId, full_name: 'Đoàn Quang Vinh', seat_row: 3, seat_col: 3, total_stars: 90, team_group: 3, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=quangvinh' },
    { id: 'st16', class_id: cId, full_name: 'Mai Ngọc Hà', seat_row: 3, seat_col: 4, total_stars: 75, team_group: 4, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ngocha' },
    { id: 'st17', class_id: cId, full_name: 'Lương Minh Tuấn', seat_row: 3, seat_col: 5, total_stars: 30, team_group: 1, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=minhtuan' },
    { id: 'st18', class_id: cId, full_name: 'Tào Thanh Thảo', seat_row: 3, seat_col: 6, total_stars: 45, team_group: 2, avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=thanhthao' }
  ];

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setCreating(true);
    soundFx.playClick();

    const classCode = `${newGradeLevel}A-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      const payload = {
        name: newClassName.trim(),
        grade_level: Number(newGradeLevel),
        code: classCode
      };

      const { data, error } = await supabase
        .from('classes')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('DB class insert fallback:', error);
      }

      const createdClass = data || {
        id: `class-${Date.now()}`,
        name: newClassName.trim(),
        grade_level: Number(newGradeLevel),
        code: classCode
      };

      soundFx.playCorrect();
      setShowAddClassModal(false);
      setNewClassName('');
      await onRefreshClasses();
      onSelectClass(createdClass);
    } catch (err) {
      console.error('Create class exception:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleAddStudentsBatch = async (newStudentsList) => {
    if (!currentClass || !newStudentsList || newStudentsList.length === 0) return;
    soundFx.playCorrect();

    const formattedList = newStudentsList.map(st => ({
      ...st,
      class_id: currentClass.id
    }));

    // Update state immediately
    setStudents(prev => [...prev, ...formattedList]);

    // Persist in DB
    try {
      await supabase.from('students').insert(formattedList);
    } catch (err) {
      console.error('Lỗi lưu danh sách học sinh vào DB:', err);
    }
  };

  const handleMoveStudentSeat = async (studentId, newRow, newCol) => {
    setStudents(prev =>
      prev.map(st => st.id === studentId ? { ...st, seat_row: newRow, seat_col: newCol } : st)
    );

    try {
      await supabase
        .from('students')
        .update({ seat_row: newRow, seat_col: newCol })
        .eq('id', studentId);
    } catch (err) {
      console.error('Lỗi di chuyển chỗ ngồi DB:', err);
    }
  };

  const handleUpdateStudentAvatar = async (studentId, newAvatarUrl) => {
    setStudents(prev =>
      prev.map(st => st.id === studentId ? { ...st, avatar_url: newAvatarUrl } : st)
    );

    try {
      await supabase
        .from('students')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', studentId);
    } catch (err) {
      console.error('Lỗi cập nhật avatar học sinh DB:', err);
    }
  };

  const handleConfirmPointChange = async (student, points, reason, actionType) => {
    // Immediate UI Star Update
    setStudents(prev =>
      prev.map(st => {
        if (st.id === student.id) {
          const currentStars = st.total_stars || 0;
          const newStars = actionType === 'add' ? currentStars + points : Math.max(0, currentStars - points);
          return { ...st, total_stars: newStars };
        }
        return st;
      })
    );

    try {
      await supabase
        .from('point_history')
        .insert([{
          student_id: student.id,
          class_id: currentClass.id,
          points_changed: points,
          reason,
          action_type: actionType
        }]);
    } catch (err) {
      console.error('Lỗi lưu lịch sử tích điểm:', err);
    }
  };

  // Export Class Report to CSV/Excel
  const handleExportExcel = () => {
    if (!currentClass || students.length === 0) return;
    soundFx.playCorrect();

    let csvContent = "\uFEFF"; // UTF-8 BOM for Vietnamese Excel
    csvContent += `SỔ CHỦ NHIỆM THCS - BÁO CÁO THI ĐƯA NỀ NẾP LỚP ${currentClass.name}\n`;
    csvContent += `GVCN: ${profile?.full_name || 'Nguyễn Văn Hải'} - Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}\n\n`;
    csvContent += "STT,Họ và Tên Học Sinh,Vị Trí Bàn,Tổ Thi Đua,Tổng Sao Tích Lũy\n";

    students.forEach((st, idx) => {
      csvContent += `${idx + 1},"${st.full_name}",Bàn H${st.seat_row}-C${st.seat_col},Tổ ${st.team_group || 1},${st.total_stars || 0}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SoChaiNhiem_Lop_${currentClass.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Seed 8A5 Demo Class
  const handleSeedDemoClass = () => {
    soundFx.playCorrect();
    const demoClass = {
      id: '8a500000-0000-0000-0000-0000000008a5',
      name: '8A5',
      grade_level: 8,
      code: '8A5-GVCN-HAI'
    };
    onSelectClass(demoClass);
    setStudents(getSampleStudents8A5(demoClass.id));
  };

  const filteredStudents = students.filter(st =>
    st.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group competitions stats
  const teamScores = [1, 2, 3, 4].map(teamId => {
    const teamSts = students.filter(st => (st.team_group || 1) === teamId);
    const score = teamSts.reduce((acc, curr) => acc + (curr.total_stars || 0), 0);
    return { teamId, score, count: teamSts.length };
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Claymorphic 3D Top Banner */}
      <div className="bg-gradient-to-r from-mint-500 via-mint-600 to-coral-500 rounded-[2.5rem] p-6 md:p-8 text-white shadow-mint-glow relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 border-4 border-white/40">
        
        <div className="flex items-center space-x-5 relative z-10">
          <div className="p-3.5 bg-white/25 backdrop-blur-xl rounded-3xl border-2 border-white/40 shadow-inner">
            <MascotRobot mode="happy" size={64} className="w-16 h-16 animate-float" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-[11px] font-extrabold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-mint-200" />
              <span>GVCN: {profile?.full_name || 'Nguyễn Văn Hải'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentClass ? `SƠ ĐỒ CHỖ NGỒI LỚP ${currentClass.name}` : 'SỔ CHỦ NHIỆM THCS ĐIỆN TỬ'}
            </h2>
            <p className="text-xs text-mint-100 mt-1 font-bold">
              {currentClass
                ? `Mã Lớp: ${currentClass.code} • Sĩ Số: ${students.length} HS • Khối ${currentClass.grade_level}`
                : 'Hệ thống theo dõi nề nếp thi đua & xếp chỗ ngồi bàn học THCS chuyên nghiệp.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          
          <button
            onClick={() => {
              setShowAddClassModal(true);
              soundFx.playClick();
            }}
            className="bg-white/20 hover:bg-white/30 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md border border-white/30 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <School className="w-4 h-4" />
            <span>Tạo Lớp Mới</span>
          </button>

          {currentClass && (
            <>
              <button
                onClick={handleExportExcel}
                className="bg-white/20 hover:bg-white/30 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md border border-white/30 transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Xuất Excel Sổ Lớp</span>
              </button>

              <button
                onClick={() => {
                  setShowAddStudentModal(true);
                  soundFx.playClick();
                }}
                className="bg-white text-mint-900 hover:bg-mint-50 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-1.5 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserPlus className="w-4 h-4 text-mint-600" />
                <span>Thêm Học Sinh</span>
              </button>
            </>
          )}

        </div>
      </div>

      {/* Quick Demo Class Launcher (If no class selected) */}
      {!currentClass && (
        <div className="bg-white rounded-3xl p-8 border-2 border-mint-200 shadow-soft text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-mint-50 rounded-full mb-1">
            <MascotRobot mode="celebrate" size={56} />
          </div>
          <h3 className="text-xl font-black text-slate-800">Trải Nghiệm Lớp 8A5 Mẫu Có Sẵn 18 Học Sinh</h3>
          <p className="text-xs text-slate-500">
            Thầy có thể bấm nút bên dưới để mở ngay Lớp 8A5 mẫu với đầy đủ sơ đồ 18 học sinh, điểm sao thi đua & nhóm thảo luận:
          </p>
          <button
            onClick={handleSeedDemoClass}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-mint-500 to-coral-500 hover:from-mint-600 hover:to-coral-600 text-white font-black text-sm rounded-2xl shadow-mint-glow transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            <Sparkles className="w-5 h-5 text-amber-200 fill-amber-200" />
            <span>MỞ NGAY LỚP 8A5 MẪU (GVCN NGUYỄN VĂN HẢI)</span>
          </button>
        </div>
      )}

      {currentClass && (
        <>
          {/* Neumorphic 4 Teams Competition Scores Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {teamScores.map(ts => (
              <div
                key={ts.teamId}
                className="bg-white rounded-2xl p-3.5 border border-mint-100 shadow-soft flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                    ts.teamId === 1 ? 'bg-mint-500' : ts.teamId === 2 ? 'bg-coral-500' : ts.teamId === 3 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}>
                    TỔ {ts.teamId}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Thi Đưa Tổ {ts.teamId}</span>
                    <span className="text-xs font-semibold text-slate-700">{ts.count} Thành viên</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-600 block">{ts.score} ⭐</span>
                  <span className="text-[10px] text-slate-400 font-bold">Tổng sao</span>
                </div>
              </div>
            ))}
          </div>

          {/* Controls Bar: Search & Class Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm học sinh theo tên..."
                className="w-full bg-white border border-mint-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 shadow-soft focus:ring-2 focus:ring-mint-500 outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className="bg-mint-100 text-mint-800 px-3.5 py-1.5 rounded-full border border-mint-200">
                Sĩ số: {students.length} HS
              </span>
              <span className="bg-amber-100 text-amber-800 px-3.5 py-1.5 rounded-full border border-amber-200 flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>
                  Tổng sao lớp: {students.reduce((acc, curr) => acc + (curr.total_stars || 0), 0)} ⭐
                </span>
              </span>
            </div>

          </div>

          {/* Main Seating Chart Grid */}
          {loadingStudents ? (
            <SkeletonLoader type="cards" count={8} />
          ) : students.length === 0 ? (
            <EmptyState
              title={`Lớp ${currentClass.name} chưa có Học sinh`}
              description="Thầy hãy bấm nút bên dưới để thêm các học sinh vào lớp hoặc chọn nạp Lớp mẫu 8A5."
              actionText="Nạp Nhanh 18 HS Lớp Mẫu 8A5"
              onAction={handleSeedDemoClass}
              robotMode="happy"
            />
          ) : (
            <SeatingGrid
              students={filteredStudents}
              currentClass={currentClass}
              teacherProfile={profile}
              onMoveStudentSeat={handleMoveStudentSeat}
              onAddPoints={(st) => setSelectedStudentForPoints(st)}
              onDeductPoints={(st) => setSelectedStudentForPoints(st)}
              onOpenRewardShop={(st) => setSelectedStudentForReward(st)}
              onSelectStudent={(st) => setSelectedStudentForPoints(st)}
              onOpenAvatarModal={(st) => setSelectedStudentForAvatar(st)}
            />
          )}
        </>
      )}

      {/* Modal 1: Add Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-mint-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800">Tạo Lớp Học Chủ Nhiệm Mới</h3>
              <button onClick={() => setShowAddClassModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Khối Lớp THCS:</label>
                <select
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none"
                >
                  <option value={6}>Khối 6</option>
                  <option value={7}>Khối 7</option>
                  <option value={8}>Khối 8</option>
                  <option value={9}>Khối 9</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Lớp Học:</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: 8A5, 7A3, 6A1..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-mint-500 hover:bg-mint-600 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-mint-glow disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'TẠO LỚP HỌC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-feature Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        currentClass={currentClass}
        onAddStudents={handleAddStudentsBatch}
      />

      {/* Feature Modals */}
      <AttendanceModal
        isOpen={modalState.attendance}
        onClose={() => onCloseModal('attendance')}
        classId={currentClass?.id}
        students={students}
      />

      <PointCriteriaModal
        isOpen={!!selectedStudentForPoints}
        onClose={() => setSelectedStudentForPoints(null)}
        student={selectedStudentForPoints}
        onConfirmPointChange={handleConfirmPointChange}
      />

      <LuckyWheelModal
        isOpen={modalState.luckyWheel}
        onClose={() => onCloseModal('luckyWheel')}
        students={students}
      />

      <NoiseMeterModal
        isOpen={modalState.noiseMeter}
        onClose={() => onCloseModal('noiseMeter')}
      />

      <GroupGeneratorModal
        isOpen={modalState.groupGenerator}
        onClose={() => onCloseModal('groupGenerator')}
        students={students}
      />

      <RewardShopModal
        isOpen={!!selectedStudentForReward}
        onClose={() => setSelectedStudentForReward(null)}
        student={selectedStudentForReward}
        onRewardRedeemed={() => currentClass && fetchStudents(currentClass.id)}
      />

      <CountdownTimerModal
        isOpen={modalState.countdownTimer}
        onClose={() => onCloseModal('countdownTimer')}
      />

      <StudentAvatarModal
        isOpen={!!selectedStudentForAvatar}
        onClose={() => setSelectedStudentForAvatar(null)}
        student={selectedStudentForAvatar}
        onUpdateStudentAvatar={handleUpdateStudentAvatar}
      />

    </div>
  );
};

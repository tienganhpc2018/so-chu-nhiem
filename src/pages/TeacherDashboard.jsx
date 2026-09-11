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
  students: propStudents = [],
  onSelectClass,
  onRefreshClasses,
  onRefreshStudents,
  activeTab = 'seating',
  modalState = {},
  onOpenModal,
  onCloseModal
}) => {
  const { user, profile } = useAuth();
  const [localStudents, setLocalStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const students = (propStudents && propStudents.length > 0) ? propStudents : localStudents;
  const setStudents = setLocalStudents;

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
      setLocalStudents([]);
    }
  }, [currentClass]);

  const fetchStudents = async (classId) => {
    setLoadingStudents(true);
    let localSt = [];
    try {
      const stored = localStorage.getItem(`custom_students_${classId}`);
      if (stored) localSt = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('seat_row', { ascending: true })
        .order('seat_col', { ascending: true });

      if (error) throw error;
      const combined = [...(data || []), ...localSt];
      const unique = combined.reduce((acc, curr) => {
        if (!acc.some(s => s.id === curr.id)) acc.push(curr);
        return acc;
      }, []);
      setLocalStudents(unique);
    } catch (err) {
      console.error('Lỗi tải danh sách học sinh:', err);
      setLocalStudents(localSt);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setCreating(true);
    soundFx.playClick();

    const classCode = `${newGradeLevel}A-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      const newClassId = `class-${Date.now()}`;
      const payload = {
        id: newClassId,
        name: newClassName.trim(),
        grade_level: Number(newGradeLevel),
        code: classCode,
        academic_year: '2026 - 2027'
      };

      const { data } = await supabase
        .from('classes')
        .insert([payload])
        .select()
        .single();

      const createdClass = data || payload;

      try {
        const stored = JSON.parse(localStorage.getItem('user_created_classes') || '[]');
        stored.push(createdClass);
        localStorage.setItem('user_created_classes', JSON.stringify(stored));
      } catch (e) {}

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

    // Save to LocalStorage custom_students_${currentClass.id}
    try {
      const stored = JSON.parse(localStorage.getItem(`custom_students_${currentClass.id}`) || '[]');
      const combined = [...stored, ...formattedList];
      const unique = combined.reduce((acc, curr) => {
        if (!acc.some(s => s.id === curr.id)) acc.push(curr);
        return acc;
      }, []);
      localStorage.setItem(`custom_students_${currentClass.id}`, JSON.stringify(unique));
      setLocalStudents(unique);
    } catch (e) {
      console.error(e);
    }

    // Persist in DB
    try {
      await supabase.from('students').insert(formattedList);
    } catch (err) {
      console.error('Lỗi lưu danh sách học sinh vào DB:', err);
    }

    if (onRefreshStudents) await onRefreshStudents();
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

      {/* Quick Class Launcher (If no class selected) */}
      {!currentClass && (
        <div className="bg-white rounded-3xl p-8 border-2 border-purple-200 shadow-soft text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-purple-50 rounded-full mb-1">
            <MascotRobot mode="happy" size={56} />
          </div>
          <h3 className="text-xl font-black text-slate-800">Chưa Chọn Lớp Học Nào</h3>
          <p className="text-xs text-slate-500">
            Thầy hãy bấm nút bên dưới để tạo lớp học đầu tiên hoặc chọn một lớp từ danh sách để bắt đầu:
          </p>
          <button
            onClick={() => setShowAddClassModal(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-purple-glow transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5 text-white" />
            <span>+ TẠO LỚP HỌC ĐẦU TIÊN NGAY</span>
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

          {/* Main Content: Seating Chart Grid vs Student Table List */}
          {loadingStudents ? (
            <SkeletonLoader type="cards" count={8} />
          ) : students.length === 0 ? (
            <EmptyState
              title={`Lớp ${currentClass.name} chưa có Học sinh`}
              description="Thầy hãy bấm nút bên dưới để thêm các học sinh vào lớp nhé."
              actionText="+ Thêm Học Sinh Vào Lớp"
              onAction={() => setShowAddStudentModal(true)}
              robotMode="happy"
            />
          ) : activeTab === 'students' ? (
            /* Student List Table View */
            <div className="bg-white rounded-3xl border border-purple-200/80 shadow-soft overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-50 via-slate-50 to-purple-50 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-black text-slate-800">👨‍🎓 Danh Sách Học Sinh Lớp {currentClass.name}</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-extrabold px-3 py-1 rounded-full border border-purple-200">
                    Hiển thị {filteredStudents.length} / {students.length} HS
                  </span>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5 transform hover:scale-102"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Thêm Học Sinh Mới</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 font-black uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3.5 text-center w-14">STT</th>
                      <th className="p-3.5">Họ và Tên Học Sinh</th>
                      <th className="p-3.5 text-center">Tổ Thi Đua</th>
                      <th className="p-3.5 text-center">Vị Trí Sơ Đồ Bàn Học</th>
                      <th className="p-3.5 text-center">Tổng Sao Tích Lũy ⭐</th>
                      <th className="p-3.5 text-center">Thao Tác Nhanh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {filteredStudents.map((st, idx) => (
                      <tr key={st.id || idx} className="hover:bg-purple-50/60 transition-colors">
                        <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3.5">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setSelectedStudentForAvatar(st)}
                              className="relative group focus:outline-none"
                              title="Bấm để đổi Avatar"
                            >
                              <img
                                src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(st.full_name)}`}
                                alt={st.full_name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-purple-300 shadow-sm group-hover:scale-110 transition-transform"
                              />
                            </button>
                            <div>
                              <span className="font-bold text-slate-900 block text-sm">{st.full_name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">Mã: {st.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black text-white shadow-xs ${
                            (st.team_group || 1) === 1 ? 'bg-mint-500' : (st.team_group || 1) === 2 ? 'bg-coral-500' : (st.team_group || 1) === 3 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}>
                            Tổ {st.team_group || 1}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-700 font-bold">
                          Dãy {Math.ceil((st.seat_col || 1) / 2)} • Bàn {st.seat_row || 1}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-300 font-black text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{st.total_stars || 0} ⭐</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setSelectedStudentForPoints(st)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-[11px] shadow-sm transition-all flex items-center space-x-1"
                              title="Tích điểm / Trừ điểm"
                            >
                              <Star className="w-3.5 h-3.5 fill-white" />
                              <span>Cộng / Trừ Sao</span>
                            </button>
                            <button
                              onClick={() => setSelectedStudentForReward(st)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-[11px] shadow-sm transition-all flex items-center space-x-1"
                              title="Đổi quà"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Đổi Quà</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
              onSaveStudentInfo={async (updatedSt) => {
                setStudents(prev => prev.map(s => s.id === updatedSt.id ? updatedSt : s));
                try {
                  await supabase.from('students').upsert(updatedSt);
                } catch (err) {
                  console.error('Lỗi cập nhật học sinh:', err);
                }
              }}
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

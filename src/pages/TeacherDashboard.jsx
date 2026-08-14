import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/soundEffects';
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
  Star
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
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudentForPoints, setSelectedStudentForPoints] = useState(null);
  const [selectedStudentForReward, setSelectedStudentForReward] = useState(null);

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
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim() || !user) return;
    setCreating(true);
    soundFx.playClick();

    try {
      const classCode = `${newGradeLevel}A-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          name: newClassName.trim(),
          grade_level: Number(newGradeLevel),
          code: classCode,
          teacher_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      soundFx.playCorrect();
      setShowAddClassModal(false);
      setNewClassName('');
      await onRefreshClasses();
      if (data) onSelectClass(data);
    } catch (err) {
      console.error('Lỗi tạo lớp mới:', err);
      alert('Không thể tạo lớp mới. Vui lòng kiểm tra RLS policy hoặc kết nối SQL.');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !currentClass) return;
    setCreating(true);
    soundFx.playClick();

    try {
      // Find empty seat
      let targetRow = 1;
      let targetCol = 1;

      for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= 6; c++) {
          const occupied = students.some(st => Number(st.seat_row) === r && Number(st.seat_col) === c);
          if (!occupied) {
            targetRow = r;
            targetCol = c;
            break;
          }
        }
        if (targetRow !== 1 || targetCol !== 1) break;
      }

      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newStudentName.trim() + Math.random())}`;

      const { data, error } = await supabase
        .from('students')
        .insert([{
          class_id: currentClass.id,
          full_name: newStudentName.trim(),
          avatar_url: avatar,
          seat_row: targetRow,
          seat_col: targetCol,
          total_stars: 0
        }])
        .select()
        .single();

      if (error) throw error;

      soundFx.playCorrect();
      setShowAddStudentModal(false);
      setNewStudentName('');
      fetchStudents(currentClass.id);
    } catch (err) {
      console.error('Lỗi thêm học sinh mới:', err);
      alert('Không thể thêm học sinh. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  const handleMoveStudentSeat = async (studentId, newRow, newCol) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ seat_row: newRow, seat_col: newCol })
        .eq('id', studentId);

      if (error) throw error;

      setStudents(prev =>
        prev.map(st => st.id === studentId ? { ...st, seat_row: newRow, seat_col: newCol } : st)
      );
    } catch (err) {
      console.error('Lỗi di chuyển chỗ ngồi:', err);
    }
  };

  const handleConfirmPointChange = async (student, points, reason, actionType) => {
    try {
      const { error } = await supabase
        .from('point_history')
        .insert([{
          student_id: student.id,
          class_id: currentClass.id,
          points_changed: points,
          reason,
          action_type: actionType
        }]);

      if (error) throw error;

      fetchStudents(currentClass.id);
    } catch (err) {
      console.error('Lỗi lưu lịch sử tích điểm:', err);
    }
  };

  const filteredStudents = students.filter(st =>
    st.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Welcome Bar */}
      <div className="bg-gradient-to-r from-mint-500 via-mint-600 to-coral-500 rounded-3xl p-6 text-white shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
            <MascotRobot mode="happy" size={56} />
          </div>
          <div>
            <h2 className="text-2xl font-black">
              {currentClass ? `Quản Lý Lớp ${currentClass.name} (Khối ${currentClass.grade_level})` : 'Chào mừng Giáo viên Chủ nhiệm THCS!'}
            </h2>
            <p className="text-xs text-mint-100 mt-1 font-semibold">
              {currentClass
                ? `Mã Lớp: ${currentClass.code} • Sĩ số: ${students.length} Học sinh`
                : 'Hãy tạo hoặc chọn một lớp học để bắt đầu điểm danh & theo dõi nề nếp thi đua.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setShowAddClassModal(true);
              soundFx.playClick();
            }}
            className="bg-white/20 hover:bg-white/30 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md border border-white/30 transition-all flex items-center space-x-1.5"
          >
            <School className="w-4 h-4" />
            <span>Tạo Lớp Mới</span>
          </button>

          {currentClass && (
            <button
              onClick={() => {
                setShowAddStudentModal(true);
                soundFx.playClick();
              }}
              className="bg-white text-mint-800 hover:bg-mint-50 font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center space-x-1.5 transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4 text-mint-600" />
              <span>Thêm Học Sinh</span>
            </button>
          )}
        </div>
      </div>

      {/* No Classes Empty State */}
      {classes.length === 0 ? (
        <EmptyState
          title="Chưa có Lớp Chủ Nhiệm nào"
          description="Bạn chưa tạo lớp học THCS nào trong tài khoản. Hãy tạo lớp học mới ngay!"
          actionText="Tạo Lớp Học Đầu Tiên"
          onAction={() => setShowAddClassModal(true)}
          robotMode="thinking"
        />
      ) : !currentClass ? (
        <div className="bg-white rounded-3xl p-8 border border-mint-100 text-center shadow-soft">
          <p className="text-slate-600 font-bold mb-4">Vui lòng chọn một lớp học ở danh sách bên dưới để bắt đầu:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectClass(c)}
                className="p-4 bg-mint-50 hover:bg-mint-100 border border-mint-200 rounded-2xl text-left transition-all hover:scale-105"
              >
                <span className="text-lg font-black text-mint-800 block">Lớp {c.name}</span>
                <span className="text-xs font-bold text-mint-600">Khối {c.grade_level}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Controls Bar: Search & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên học sinh..."
                className="w-full bg-white border border-mint-100 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 shadow-soft focus:ring-2 focus:ring-mint-500 outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
              <span className="bg-mint-100 text-mint-800 px-3 py-1 rounded-full">
                Sĩ số: {students.length} HS
              </span>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>
                  Tổng sao: {students.reduce((acc, curr) => acc + (curr.total_stars || 0), 0)} ⭐
                </span>
              </span>
            </div>

          </div>

          {/* Main Seating Chart Grid */}
          {loadingStudents ? (
            <SkeletonLoader type="cards" count={8} />
          ) : students.length === 0 ? (
            <EmptyState
              title={`Lớp ${currentClass.name} chưa có Học sinh nào`}
              description="Hãy thêm các học sinh vào lớp để sắp xếp sơ đồ bàn học và tích điểm nề nếp."
              actionText="Thêm Học Sinh Ngay"
              onAction={() => setShowAddStudentModal(true)}
              robotMode="happy"
            />
          ) : (
            <SeatingGrid
              students={filteredStudents}
              onMoveStudentSeat={handleMoveStudentSeat}
              onAddPoints={(st) => setSelectedStudentForPoints(st)}
              onDeductPoints={(st) => setSelectedStudentForPoints(st)}
              onOpenRewardShop={(st) => setSelectedStudentForReward(st)}
              onSelectStudent={(st) => setSelectedStudentForPoints(st)}
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
                  placeholder="Ví dụ: 8A5, 6A1, 9A2..."
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

      {/* Modal 2: Add Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-mint-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800">Thêm Học Sinh Vào Lớp</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên Học sinh:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Trần Thị Mai Anh"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-mint-500 hover:bg-mint-600 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-mint-glow disabled:opacity-50"
                >
                  {creating ? 'Đang thêm...' : 'THÊM HỌC SINH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

    </div>
  );
};

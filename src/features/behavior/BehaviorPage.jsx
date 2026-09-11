import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Users, Award, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

import { TopActionBar } from './components/TopActionBar';
import { StudentCard } from './components/StudentCard';
import { PointModal } from './components/PointModal';
import { AttendanceModal4 } from './components/AttendanceModal4';
import { AddClassModal4 } from './components/AddClassModal4';
import { TetHaiHoaModal } from './components/TetHaiHoaModal';
import { BlindPouchModal } from './components/BlindPouchModal';
import { SuspenseCallModal } from './components/SuspenseCallModal';
import { BeeRaceModal } from './components/BeeRaceModal';
import { SeatingChartModal } from './components/SeatingChartModal';
import { DiscussionTimerModal } from './components/DiscussionTimerModal';
import { GroupTeamsModal } from './components/GroupTeamsModal';

export const BehaviorPage = ({
  currentClass,
  students: propStudents = [],
  onSelectClass,
  onRefreshClasses
}) => {
  // State 1: students
  const [students, setStudents] = useState([]);
  // State 2: calledStudentIds
  const [calledStudentIds, setCalledStudentIds] = useState([]);
  // State 3: openedPouchNumbers
  const [openedPouchNumbers, setOpenedPouchNumbers] = useState([]);
  // State 4: avatarSize
  const [avatarSize, setAvatarSize] = useState('normal'); // 'normal' | 'large'

  // Modals state
  const [modalState, setModalState] = useState({
    addClass: false,
    attendance: false,
    points: false,
    tetHaiHoa: false,
    singleCall: false,
    blindPouch: false,
    multiCall: false,
    groupTeams: false,
    beeRace: false,
    timer: false,
    seating: false
  });

  const [selectedStudentForPoints, setSelectedStudentForPoints] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('all'); // 'all' | '1' | '2' | '3' | '4' | 'called' | 'absent'

  // Initialize students from props or LocalStorage
  useEffect(() => {
    const classKey = currentClass?.id || 'default_class';
    let loaded = [];

    try {
      const stored = localStorage.getItem(`behavior_students_${classKey}`);
      if (stored) loaded = JSON.parse(stored);
    } catch (e) {}

    if (!loaded || loaded.length === 0) {
      if (propStudents && propStudents.length > 0) {
        loaded = propStudents.map((st, idx) => ({
          id: st.id || `st-${idx + 1}`,
          code: st.code || `HS${String(idx + 1).padStart(2, '0')}`,
          full_name: st.full_name,
          gender: st.gender || (idx % 2 === 0 ? 'Nữ' : 'Nam'),
          plus_points: Number(st.total_stars ?? 5),
          minus_points: 0,
          status: st.status || 'Present',
          avatar: st.avatar || st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(st.full_name)}`,
          seat_row: Number(st.seat_row || Math.floor(idx / 8) + 1),
          seat_col: Number(st.seat_col || (idx % 8) + 1),
          team_group: Number(st.team_group || (idx % 4) + 1),
          notes: st.notes || ''
        }));
      }
    }

    setStudents(loaded);
  }, [currentClass, propStudents]);

  // Save to LocalStorage whenever students update
  const updateStudentsState = (newStudents) => {
    setStudents(newStudents);
    const classKey = currentClass?.id || 'default_class';
    try {
      localStorage.setItem(`behavior_students_${classKey}`, JSON.stringify(newStudents));
    } catch (e) {}
  };

  const openModal = (name) => setModalState(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModalState(prev => ({ ...prev, [name]: false }));

  // Point Change Handler (+ / - points)
  const handleApplyPointChange = (studentId, points, type, reason) => {
    const updated = students.map(st => {
      if (st.id === studentId) {
        if (type === 'plus') {
          return { ...st, plus_points: (st.plus_points || 0) + points };
        } else {
          return { ...st, minus_points: (st.minus_points || 0) + points };
        }
      }
      return st;
    });

    updateStudentsState(updated);
  };

  // Avatar Update Handler
  const handleUpdateAvatar = (studentId, newAvatarUrl) => {
    const updated = students.map(st =>
      st.id === studentId ? { ...st, avatar: newAvatarUrl, avatar_url: newAvatarUrl } : st
    );
    updateStudentsState(updated);
  };

  // Attendance Update Handler
  const handleUpdateAttendance = (studentId, data) => {
    const updated = students.map(st =>
      st.id === studentId ? { ...st, ...data } : st
    );
    updateStudentsState(updated);
  };

  // Drag & Drop Seat Swap Handler
  const handleSwapSeats = (studentA, targetRow, targetCol, studentB) => {
    const updated = students.map(st => {
      if (st.id === studentA.id) {
        return { ...st, seat_row: targetRow, seat_col: targetCol };
      }
      if (studentB && st.id === studentB.id) {
        return { ...st, seat_row: studentA.seat_row, seat_col: studentA.seat_col };
      }
      return st;
    });
    updateStudentsState(updated);
  };

  // Add Class Handler
  const handleCreateClass = (newClassData) => {
    if (newClassData.students && newClassData.students.length > 0) {
      updateStudentsState(newClassData.students);
    }
    if (onSelectClass) onSelectClass(newClassData);
    if (onRefreshClasses) onRefreshClasses();
  };

  // Winner Reward from Random Call / Tet / Blind Pouch
  const handleConfirmWinner = (studentId, rewardPoints = 3) => {
    if (!calledStudentIds.includes(studentId)) {
      setCalledStudentIds(prev => [...prev, studentId]);
    }
    handleApplyPointChange(studentId, rewardPoints, 'plus', 'Thưởng vòng quay may mắn');
  };

  // Blind Pouch Handler
  const handleOpenPouch = (pouchNum, studentId) => {
    if (!openedPouchNumbers.includes(pouchNum)) {
      setOpenedPouchNumbers(prev => [...prev, pouchNum]);
    }
    if (studentId && !calledStudentIds.includes(studentId)) {
      setCalledStudentIds(prev => [...prev, studentId]);
      handleApplyPointChange(studentId, 5, 'plus', 'Thưởng Túi Mù May Mắn');
    }
  };

  // Reset Called List
  const handleResetCalled = () => {
    soundFx.playClick();
    setCalledStudentIds([]);
  };

  // Filtered Students List
  const filteredStudents = students.filter(st => {
    const matchName = st.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchName) return false;

    if (filterTeam === 'all') return true;
    if (filterTeam === 'called') return calledStudentIds.includes(st.id);
    if (filterTeam === 'absent') return st.status === 'Absent_Perm' || st.status === 'Absent_NoPerm';
    return String(st.team_group || 1) === filterTeam;
  });

  // Global Class Statistics
  const totalStudents = students.length;
  const presentCount = students.filter(s => s.status === 'Present' || !s.status).length;
  const absentCount = students.filter(s => s.status === 'Absent_Perm' || s.status === 'Absent_NoPerm').length;
  const totalPlusPoints = students.reduce((acc, curr) => acc + (curr.plus_points || 0), 0);
  const totalMinusPoints = students.reduce((acc, curr) => acc + (curr.minus_points || 0), 0);

  return (
    <div className="space-y-5 pb-16 animate-in fade-in">
      
      {/* Claymorphic Top Class Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 rounded-[2.5rem] p-5 sm:p-7 text-white shadow-xl shadow-purple-900/20 border-4 border-white/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 z-10">
          <div className="w-14 h-14 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30">
            ⭐
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-1 text-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SỔ CHỦ NHIỆM 4.0 • QUẢN LÝ NỀ NẾP & THI ĐUA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentClass ? `NỀ NẾP LỚP ${currentClass.name}` : 'SỔ NỀ NẾP LỚP HỌC 4.0'}
            </h2>
            <p className="text-xs text-purple-200 font-bold mt-0.5">
              Sĩ số: {totalStudents} HS • Hiện diện: {presentCount} • Vắng: {absentCount} • Đã gọi tên: {calledStudentIds.length}/{totalStudents}
            </p>
          </div>
        </div>

        {/* Quick Points Summary Badges */}
        <div className="flex items-center space-x-3 z-10">
          <div className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] font-black uppercase text-rose-200 block">Tổng Điểm (+)</span>
            <span className="text-lg font-black text-white">+{totalPlusPoints} ⭐</span>
          </div>

          <div className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] font-black uppercase text-purple-200 block">Tổng Điểm (-)</span>
            <span className="text-lg font-black text-white">-{totalMinusPoints}</span>
          </div>
        </div>
      </div>

      {/* 13-Action Top Pill Bar */}
      <TopActionBar
        avatarSize={avatarSize}
        onToggleAvatarSize={() => {
          soundFx.playClick();
          setAvatarSize(prev => (prev === 'normal' ? 'large' : 'normal'));
        }}
        onOpenAddClass={() => openModal('addClass')}
        onOpenAttendance={() => openModal('attendance')}
        onOpenPointModal={() => openModal('points')}
        onOpenTetHaiHoa={() => openModal('tetHaiHoa')}
        onOpenSingleCall={() => openModal('singleCall')}
        onOpenBlindPouch={() => openModal('blindPouch')}
        onOpenMultiCall={() => openModal('multiCall')}
        onOpenGroupTeams={() => openModal('groupTeams')}
        onOpenBeeRace={() => openModal('beeRace')}
        onOpenTimer={() => openModal('timer')}
        onOpenSeatingChart={() => openModal('seating')}
        onResetCalled={handleResetCalled}
        calledCount={calledStudentIds.length}
        totalStudents={totalStudents}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm học sinh theo tên..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            onClick={() => setFilterTeam('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              filterTeam === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({students.length})
          </button>

          {[1, 2, 3, 4].map(t => (
            <button
              key={t}
              onClick={() => setFilterTeam(String(t))}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                filterTeam === String(t)
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tổ {t}
            </button>
          ))}

          <button
            onClick={() => setFilterTeam('called')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              filterTeam === 'called'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đã Gọi ({calledStudentIds.length})
          </button>

          <button
            onClick={() => setFilterTeam('absent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              filterTeam === 'absent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vắng ({absentCount})
          </button>
        </div>

      </div>

      {/* Main Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
          <span className="text-4xl">👨‍🎓</span>
          <h3 className="text-base font-black text-slate-700">Không tìm thấy học sinh phù hợp</h3>
          <p className="text-xs text-slate-400">Hãy thử tìm kiếm từ khóa khác hoặc đặt lại bộ lọc</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredStudents.map(student => {
            const isCalled = calledStudentIds.includes(student.id);
            const isAbsent = student.status === 'Absent_Perm' || student.status === 'Absent_NoPerm';

            return (
              <StudentCard
                key={student.id}
                student={student}
                avatarSize={avatarSize}
                isCalled={isCalled}
                isAbsent={isAbsent}
                onOpenPoints={(st) => {
                  setSelectedStudentForPoints(st);
                  openModal('points');
                }}
              />
            );
          })}
        </div>
      )}

      {/* MODALS */}

      {/* 1. Add Class Modal */}
      <AddClassModal4
        isOpen={modalState.addClass}
        onClose={() => closeModal('addClass')}
        onCreateClass={handleCreateClass}
      />

      {/* 2. Attendance Modal */}
      <AttendanceModal4
        isOpen={modalState.attendance}
        onClose={() => closeModal('attendance')}
        students={students}
        currentClass={currentClass}
        onUpdateAttendance={handleUpdateAttendance}
      />

      {/* 3. Point Criteria & Avatar Modal */}
      <PointModal
        isOpen={modalState.points}
        onClose={() => {
          closeModal('points');
          setSelectedStudentForPoints(null);
        }}
        student={selectedStudentForPoints}
        allStudents={students}
        onApplyPointChange={handleApplyPointChange}
        onUpdateAvatar={handleUpdateAvatar}
      />

      {/* 4. Tet Hai Hoa Dan Chu Modal */}
      <TetHaiHoaModal
        isOpen={modalState.tetHaiHoa}
        onClose={() => closeModal('tetHaiHoa')}
        students={students}
        calledStudentIds={calledStudentIds}
        onRewardStudent={handleConfirmWinner}
      />

      {/* 5. Blind Pouch 32 Modal */}
      <BlindPouchModal
        isOpen={modalState.blindPouch}
        onClose={() => closeModal('blindPouch')}
        students={students}
        calledStudentIds={calledStudentIds}
        openedPouchNumbers={openedPouchNumbers}
        onOpenPouch={handleOpenPouch}
        onResetPouches={() => setOpenedPouchNumbers([])}
      />

      {/* 6. Single Call (6s Suspense) Modal */}
      <SuspenseCallModal
        isOpen={modalState.singleCall}
        onClose={() => closeModal('singleCall')}
        mode="single"
        students={students}
        calledStudentIds={calledStudentIds}
        onConfirmWinner={handleConfirmWinner}
      />

      {/* 7. Multi Call (3 Students) Modal */}
      <SuspenseCallModal
        isOpen={modalState.multiCall}
        onClose={() => closeModal('multiCall')}
        mode="multi"
        students={students}
        calledStudentIds={calledStudentIds}
        onConfirmWinner={handleConfirmWinner}
      />

      {/* 8. Bee Race (Duck Race) Modal */}
      <BeeRaceModal
        isOpen={modalState.beeRace}
        onClose={() => closeModal('beeRace')}
        students={students}
        onRewardTop3={(topDucks) => {
          topDucks.forEach((d, i) => {
            const pts = i === 0 ? 5 : i === 1 ? 3 : 2;
            if (d.student?.id) handleApplyPointChange(d.student.id, pts, 'plus', `Top ${i + 1} Đua Vịt`);
          });
        }}
      />

      {/* 9. Seating Chart HTML5 Drag & Drop Modal */}
      <SeatingChartModal
        isOpen={modalState.seating}
        onClose={() => closeModal('seating')}
        students={students}
        currentClass={currentClass}
        onSwapSeats={handleSwapSeats}
      />

      {/* 10. Discussion Timer Modal */}
      <DiscussionTimerModal
        isOpen={modalState.timer}
        onClose={() => closeModal('timer')}
      />

      {/* 11. Group Teams Modal */}
      <GroupTeamsModal
        isOpen={modalState.groupTeams}
        onClose={() => closeModal('groupTeams')}
        students={students}
      />

    </div>
  );
};

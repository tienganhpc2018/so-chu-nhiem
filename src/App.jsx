import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './pages/HomeView';
import { ClassesView } from './pages/ClassesView';
import { AttendanceView } from './pages/AttendanceView';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { LeaderboardView } from './pages/LeaderboardView';
import { Settings } from './pages/Settings';
import { TimetableGrid } from './pages/TimetableGrid';
import { RewardsView } from './pages/RewardsView';
import { LuckyWheelView } from './pages/LuckyWheelView';
import { FilmStripView } from './pages/FilmStripView';
import { NoiseMeterView } from './pages/NoiseMeterView';
import { CountdownTimerView } from './pages/CountdownTimerView';
import { QuickLinksView } from './pages/QuickLinksView';
import { AnalyticsView } from './pages/AnalyticsView';
import { Auth } from './pages/Auth';
import { BehaviorPage } from './features/behavior/BehaviorPage';
import { AssessmentPage } from './features/assessment/AssessmentPage';

const MainLayout = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('sochunhiem_active_tab') || 'behavior';
    } catch (e) {
      return 'behavior';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sochunhiem_active_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [students, setStudents] = useState([]);

  // Modals state
  const [modalState, setModalState] = useState({
    luckyWheel: false,
    noiseMeter: false,
    groupGenerator: false,
    countdownTimer: false,
    attendance: false,
    addStudent: false,
    rewards: false
  });

  const openModal = (name) => {
    setModalState(prev => ({ ...prev, [name]: true }));
  };

  const closeModal = (name) => {
    setModalState(prev => ({ ...prev, [name]: false }));
  };

  // Clean Slate Routine: Purge legacy mock classes and demo students once
  useEffect(() => {
    const CLEAN_KEY = 'system_clean_slate_2026_v2';
    if (localStorage.getItem(CLEAN_KEY) !== 'done') {
      try {
        localStorage.removeItem('user_created_classes');
        localStorage.removeItem('selected_class_id');
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (
            k.startsWith('custom_students_') ||
            k.startsWith('behavior_students_') ||
            k.startsWith('attendance_') ||
            k.startsWith('point_history_')
          )) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(CLEAN_KEY, 'done');
        setClasses([]);
        setCurrentClass(null);
        setStudents([]);
      } catch (e) {
        console.error('Error cleaning legacy storage:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (currentClass) {
      localStorage.setItem('selected_class_id', currentClass.id);
      fetchStudents(currentClass);
    } else {
      setStudents([]);
    }
  }, [currentClass]);

  const fetchClasses = async () => {
    let localClasses = [];
    try {
      const stored = localStorage.getItem('user_created_classes');
      if (stored) localClasses = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    try {
      const { data } = await supabase
        .from('classes')
        .select('*')
        .order('grade_level', { ascending: true });

      const combined = [...(data || []), ...localClasses];
      // Deduplicate by ID AND Class Name
      const unique = combined.reduce((acc, curr) => {
        if (!acc.some(c => c.id === curr.id || (c.name.trim().toLowerCase() === curr.name.trim().toLowerCase() && Number(c.grade_level) === Number(curr.grade_level)))) {
          acc.push(curr);
        }
        return acc;
      }, []);

      setClasses(unique);

      // Restore active selected class from LocalStorage
      const savedId = localStorage.getItem('selected_class_id');
      const found = unique.find(c => c.id === savedId || c.name === savedId);
      setCurrentClass(found || (unique.length > 0 ? unique[0] : null));
    } catch (err) {
      const unique = localClasses.reduce((acc, curr) => {
        if (!acc.some(c => c.id === curr.id || (c.name.trim().toLowerCase() === curr.name.trim().toLowerCase() && Number(c.grade_level) === Number(curr.grade_level)))) {
          acc.push(curr);
        }
        return acc;
      }, []);
      setClasses(unique);
      const savedId = localStorage.getItem('selected_class_id');
      const found = unique.find(c => c.id === savedId || c.name === savedId);
      setCurrentClass(found || (unique.length > 0 ? unique[0] : null));
    }
  };

  const fetchStudents = async (targetClassOrId) => {
    if (!targetClassOrId) {
      setStudents([]);
      return;
    }

    const classId = typeof targetClassOrId === 'object' ? targetClassOrId.id : targetClassOrId;
    const className = typeof targetClassOrId === 'object' ? targetClassOrId.name : (currentClass?.name || '');

    let localSt = [];

    try {
      const stored = localStorage.getItem(`custom_students_${classId}`);
      if (stored) localSt = JSON.parse(stored);
    } catch (e) {}

    if ((!localSt || localSt.length === 0) && className) {
      try {
        const storedByName = localStorage.getItem(`custom_students_${className}`);
        if (storedByName) localSt = JSON.parse(storedByName);
      } catch (e) {}
    }

    if (!localSt || localSt.length === 0) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('custom_students_')) {
            const parsed = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(parsed) && parsed.length > 0) {
              const matching = parsed.filter(s => s.class_id === classId || s.class_id === className || key.endsWith(`_${className}`) || key.endsWith(`_${classId}`));
              if (matching.length > 0) {
                localSt = [...localSt, ...matching];
              }
            }
          }
        }
      } catch (e) {}
    }

    let dbSt = [];
    try {
      const { data } = await supabase
        .from('students')
        .select('*')
        .or(`class_id.eq.${classId},class_id.eq.${className}`)
        .order('seat_row', { ascending: true })
        .order('seat_col', { ascending: true });

      if (data) dbSt = data;
    } catch (err) {}

    let combined = [...dbSt, ...localSt];
    let unique = combined.reduce((acc, curr) => {
      if (!acc.some(s => s.id === curr.id || s.full_name === curr.full_name)) acc.push(curr);
      return acc;
    }, []);

    setStudents(unique);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-16 h-16 bg-purple-600 rounded-3xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-purple-glow">
            ⭐
          </div>
          <p className="text-sm font-bold text-purple-900">Đang nạp ứng dụng Lớp Học Vui...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Titles mapping per activeTab
  const tabTitleMap = {
    home: { title: 'Trang chủ', subtitle: 'Tổng quan tình hình và hoạt động học tập hôm nay' },
    behavior: { title: 'Sổ Nề Nếp & Quản Lý 4.0', subtitle: 'Hệ thống quản lý nề nếp thi đua, gọi tên ngẫu nhiên & minigames lớp học' },
    assessment: { title: 'Sổ Đánh Giá Môn Học THCS', subtitle: 'Bảng điểm ĐĐG thường xuyên, giữa kỳ, cuối kỳ & AI tự động nhận xét chuẩn Thông tư 22' },
    classes: { title: 'Quản lý Lớp học', subtitle: 'Danh sách các lớp học chủ nhiệm và khởi tạo lớp mới' },
    students: { title: 'Danh sách Học sinh', subtitle: 'Hồ sơ học sinh, điểm thi đua và phân tổ' },
    attendance: { title: 'Điểm danh Chuyên cần', subtitle: 'Điểm danh hiện diện học sinh theo ngày' },
    seating: { title: 'Sơ đồ Chỗ ngồi Lớp học', subtitle: 'Kéo thả avatar học sinh sắp xếp bàn học 4x6' },
    timetable: { title: 'Thời khóa biểu', subtitle: 'Lịch học và thời gian các tiết trong tuần' },
    rewards: { title: 'Cửa Hàng Đổi Quà Lớp', subtitle: 'Quy đổi xu thi đua lấy phần thưởng học tập, đặc quyền và quà lưu niệm' },
    luckywheel: { title: 'Vòng quay May mắn', subtitle: 'Gọi tên học sinh ngẫu nhiên phát biểu' },
    leaderboard: { title: 'Bảng Vinh danh & Cuộn Phim', subtitle: 'Vinh danh top học sinh xuất sắc và tiến bộ' },
    noisemeter: { title: 'Đo Độ ồn Lớp học', subtitle: 'Giám sát âm thanh microphone thời gian thực' },
    timer: { title: 'Đồng hồ Đếm ngược', subtitle: 'Đếm ngược giờ làm bài và thảo luận nhóm' },
    links: { title: 'Liên Kết & Tài Liệu', subtitle: 'Kho liên kết bài giảng và tài liệu học tập' },
    stats: { title: 'Thống kê Thi đua', subtitle: 'Báo cáo tổng kết thi đua các tổ' },
    data: { title: 'Quản lý Dữ liệu', subtitle: 'Sao lưu, khôi phục và xuất file Excel' },
    settings: { title: 'Cài đặt hệ thống', subtitle: 'Thiết lập thông tin giáo viên và quy tắc lớp học' },
  };

  const currentTabInfo = tabTitleMap[activeTab] || tabTitleMap.home;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-row">
      
      {/* Sidebar Navigation (Left Vertical Menu) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        studentCount={students.length}
        teacherProfile={profile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <Header
          activeTabTitle={currentTabInfo.title}
          activeTabSubtitle={currentTabInfo.subtitle}
          classes={classes}
          currentClass={currentClass}
          onSelectClass={setCurrentClass}
          teacherProfile={profile}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenAddClass={() => setActiveTab('classes')}
        />

        {/* 4-Tab Management Navigation Bar */}
        {['classes', 'students', 'seating', 'attendance', 'behavior', 'assessment', 'rewards'].includes(activeTab) && (
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setActiveTab('behavior')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'behavior'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200 scale-102'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
                }`}
              >
                <span>⭐</span>
                <span>Sổ Nề Nếp 4.0</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  activeTab === 'behavior' ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'
                }`}>
                  MỚI
                </span>
              </button>

              <button
                onClick={() => setActiveTab('assessment')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'assessment'
                    ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md shadow-teal-200 scale-102'
                    : 'text-teal-800 hover:text-teal-950 hover:bg-teal-50'
                }`}
              >
                <span>📋</span>
                <span>Sổ Đánh Giá</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  activeTab === 'assessment' ? 'bg-amber-400 text-amber-950' : 'bg-teal-100 text-teal-800'
                }`}>
                  AI ✨
                </span>
              </button>

              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'rewards'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200 scale-102'
                    : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
                }`}
              >
                <span>🎁</span>
                <span>Cửa Hàng Đổi Quà</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  activeTab === 'rewards' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  HOT
                </span>
              </button>

              <button
                onClick={() => setActiveTab('classes')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'classes'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-102'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>🏫</span>
                <span>Thêm & Quản Lý Lớp</span>
                <span className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'classes' ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {classes.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'students'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-102'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>👨‍🎓</span>
                <span>Thêm & Danh Sách Học Sinh</span>
                <span className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'students' ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {students.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('seating')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'seating'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-102'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>🪑</span>
                <span>Xếp Sơ Đồ Lớp (4 Dãy)</span>
              </button>

              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'attendance'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-102'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>📝</span>
                <span>Điểm Danh Chuyên Cần</span>
              </button>
            </div>

            {currentClass && (
              <div className="hidden lg:flex items-center space-x-2 bg-purple-50 px-3.5 py-2 rounded-xl border border-purple-200 text-purple-800 text-xs font-extrabold">
                <span>📍 Lớp đang chọn:</span>
                <span className="text-purple-900 text-sm font-black">{currentClass.name}</span>
                <span className="text-purple-600 bg-white px-2 py-0.5 rounded-md border border-purple-200 font-bold">{students.length} HS</span>
              </div>
            )}
          </div>
        )}

        {/* Page Content View */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeView
              currentClass={currentClass}
              students={students}
              teacherProfile={profile}
              onTabChange={handleTabChange}
              onOpenAttendance={() => openModal('attendance')}
              onOpenAddStudent={() => openModal('addStudent')}
              onOpenLuckyWheel={() => openModal('luckyWheel')}
              onOpenRewards={() => openModal('rewards')}
            />
          )}

          {activeTab === 'behavior' && (
            <BehaviorPage
              currentClass={currentClass}
              students={students}
              onSelectClass={setCurrentClass}
              onRefreshClasses={fetchClasses}
            />
          )}

          {activeTab === 'assessment' && (
            <AssessmentPage
              currentClass={currentClass}
              classes={classes}
              students={students}
              onSelectClass={setCurrentClass}
              onOpenQuickAddStudents={() => openModal('addStudent')}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesView
              classes={classes}
              currentClass={currentClass}
              onSelectClass={(cls) => {
                setCurrentClass(cls);
                setActiveTab('students');
              }}
              onRefreshClasses={fetchClasses}
              onOpenAddStudent={() => openModal('addStudent')}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              currentClass={currentClass}
              students={students}
            />
          )}

          {(activeTab === 'seating' || activeTab === 'students') && (
            <TeacherDashboard
              classes={classes}
              currentClass={currentClass}
              onSelectClass={setCurrentClass}
              onRefreshClasses={fetchClasses}
              students={students}
              onRefreshStudents={() => currentClass?.id && fetchStudents(currentClass.id)}
              activeTab={activeTab}
              modalState={modalState}
              onOpenModal={openModal}
              onCloseModal={closeModal}
            />
          )}

          {activeTab === 'links' && (
            <QuickLinksView currentClass={currentClass} />
          )}

          {activeTab === 'stats' && (
            <AnalyticsView
              currentClass={currentClass}
              students={students}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableGrid
              currentClass={currentClass}
              teacherProfile={profile}
            />
          )}

          {activeTab === 'rewards' && (
            <RewardsView
              currentClass={currentClass}
              students={students}
              onRefreshStudents={() => fetchStudents(currentClass.id)}
            />
          )}

          {activeTab === 'luckywheel' && (
            <LuckyWheelView
              currentClass={currentClass}
              students={students}
            />
          )}

          {(activeTab === 'filmstrip' || activeTab === 'leaderboard') && (
            <FilmStripView
              currentClass={currentClass}
              students={students}
            />
          )}

          {activeTab === 'noisemeter' && (
            <NoiseMeterView
              currentClass={currentClass}
            />
          )}

          {activeTab === 'timer' && (
            <CountdownTimerView />
          )}

          {activeTab === 'settings' && (
            <Settings
              currentClass={currentClass}
              onRefreshClasses={fetchClasses}
            />
          )}

          {activeTab !== 'home' && activeTab !== 'behavior' && activeTab !== 'assessment' && activeTab !== 'seating' && activeTab !== 'classes' && activeTab !== 'students' && activeTab !== 'leaderboard' && activeTab !== 'stats' && activeTab !== 'timetable' && activeTab !== 'rewards' && activeTab !== 'luckywheel' && activeTab !== 'filmstrip' && activeTab !== 'noisemeter' && activeTab !== 'timer' && activeTab !== 'links' && activeTab !== 'settings' && (
            <TeacherDashboard
              classes={classes}
              currentClass={currentClass}
              onSelectClass={setCurrentClass}
              onRefreshClasses={fetchClasses}
              students={students}
              onRefreshStudents={() => currentClass?.id && fetchStudents(currentClass.id)}
              activeTab={activeTab}
              modalState={modalState}
              onOpenModal={openModal}
              onCloseModal={closeModal}
            />
          )}
        </main>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

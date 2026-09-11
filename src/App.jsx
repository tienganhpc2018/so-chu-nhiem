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

const MainLayout = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
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

  useEffect(() => {
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (currentClass) {
      localStorage.setItem('selected_class_id', currentClass.id);
      fetchStudents(currentClass.id);
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
      // Deduplicate by ID
      const unique = combined.reduce((acc, curr) => {
        if (!acc.some(c => c.id === curr.id)) acc.push(curr);
        return acc;
      }, []);

      setClasses(unique);

      // Restore active selected class from LocalStorage
      const savedId = localStorage.getItem('selected_class_id');
      const found = unique.find(c => c.id === savedId);
      setCurrentClass(found || (unique.length > 0 ? unique[0] : null));
    } catch (err) {
      const unique = localClasses.reduce((acc, curr) => {
        if (!acc.some(c => c.id === curr.id)) acc.push(curr);
        return acc;
      }, []);
      setClasses(unique);
      const savedId = localStorage.getItem('selected_class_id');
      const found = unique.find(c => c.id === savedId);
      setCurrentClass(found || (unique.length > 0 ? unique[0] : null));
    }
  };

  const fetchStudents = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }

    let localSt = [];
    try {
      const stored = localStorage.getItem(`custom_students_${classId}`);
      if (stored) localSt = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    try {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('seat_row', { ascending: true })
        .order('seat_col', { ascending: true });

      const combined = [...(data || []), ...localSt];
      const unique = combined.reduce((acc, curr) => {
        if (!acc.some(s => s.id === curr.id)) acc.push(curr);
        return acc;
      }, []);

      setStudents(unique);
    } catch (err) {
      setStudents(localSt);
    }
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
    classes: { title: 'Quản lý Lớp học', subtitle: 'Danh sách các lớp học chủ nhiệm và khởi tạo lớp mới' },
    students: { title: 'Danh sách Học sinh', subtitle: 'Hồ sơ học sinh, điểm thi đua và phân tổ' },
    attendance: { title: 'Điểm danh Chuyên cần', subtitle: 'Điểm danh hiện diện học sinh theo ngày' },
    seating: { title: 'Sơ đồ Chỗ ngồi Lớp học', subtitle: 'Kéo thả avatar học sinh sắp xếp bàn học 4x6' },
    timetable: { title: 'Thời khóa biểu', subtitle: 'Lịch học và thời gian các tiết trong tuần' },
    rewards: { title: 'Cửa hàng Đổi quà', subtitle: 'Đổi xu sao lấy đặc quyền học tập' },
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
        />

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

          {activeTab === 'classes' && (
            <ClassesView
              classes={classes}
              currentClass={currentClass}
              onSelectClass={(cls) => {
                setCurrentClass(cls);
                setActiveTab('seating');
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

          {activeTab !== 'home' && activeTab !== 'seating' && activeTab !== 'classes' && activeTab !== 'students' && activeTab !== 'leaderboard' && activeTab !== 'stats' && activeTab !== 'timetable' && activeTab !== 'rewards' && activeTab !== 'luckywheel' && activeTab !== 'filmstrip' && activeTab !== 'noisemeter' && activeTab !== 'timer' && activeTab !== 'links' && activeTab !== 'settings' && (
            <TeacherDashboard
              classes={classes}
              currentClass={currentClass}
              onSelectClass={setCurrentClass}
              onRefreshClasses={fetchClasses}
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

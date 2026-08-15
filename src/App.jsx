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
import { Auth } from './pages/Auth';

const defaultDemoClass = {
  id: '8a500000-0000-0000-0000-0000000008a5',
  name: '8A5',
  grade_level: 8,
  code: '8A5-GVCN-HAI'
};

const MainLayout = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [classes, setClasses] = useState([defaultDemoClass]);
  const [currentClass, setCurrentClass] = useState(defaultDemoClass);
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
    if (user) {
      fetchClasses();
    } else {
      setClasses([defaultDemoClass]);
      setCurrentClass(defaultDemoClass);
    }
  }, [user]);

  useEffect(() => {
    if (currentClass) {
      fetchStudents(currentClass.id);
    }
  }, [currentClass]);

  const fetchClasses = async () => {
    try {
      const { data } = await supabase
        .from('classes')
        .select('*')
        .order('grade_level', { ascending: true });

      if (data && data.length > 0) {
        setClasses(data);
        setCurrentClass(prev => (prev && data.some(c => c.id === prev.id) ? prev : data[0]));
      } else {
        setClasses([defaultDemoClass]);
        setCurrentClass(defaultDemoClass);
      }
    } catch (err) {
      setClasses([defaultDemoClass]);
      setCurrentClass(defaultDemoClass);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('seat_row', { ascending: true })
        .order('seat_col', { ascending: true });

      if (data && data.length > 0) {
        setStudents(data);
      } else {
        setStudents(getSampleStudents(classId));
      }
    } catch (err) {
      setStudents(getSampleStudents(classId));
    }
  };

  const getSampleStudents = (cId) => [
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
    if (tabId === 'timer') openModal('countdownTimer');
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

          {(activeTab === 'leaderboard' || activeTab === 'filmstrip') && (
            <FilmStripView
              currentClass={currentClass}
              students={students}
            />
          )}

          {activeTab === 'stats' && (
            <LeaderboardView currentClass={currentClass} />
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

          {activeTab === 'filmstrip' && (
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

          {activeTab === 'settings' && (
            <Settings
              currentClass={currentClass}
              onRefreshClasses={fetchClasses}
            />
          )}

          {activeTab !== 'home' && activeTab !== 'seating' && activeTab !== 'classes' && activeTab !== 'students' && activeTab !== 'leaderboard' && activeTab !== 'stats' && activeTab !== 'timetable' && activeTab !== 'rewards' && activeTab !== 'luckywheel' && activeTab !== 'filmstrip' && activeTab !== 'noisemeter' && activeTab !== 'settings' && (
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

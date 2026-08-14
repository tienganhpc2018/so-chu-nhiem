import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { LeaderboardView } from './pages/LeaderboardView';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Global Tool Modals state
  const [modalState, setModalState] = useState({
    luckyWheel: false,
    noiseMeter: false,
    groupGenerator: false,
    countdownTimer: false,
    attendance: false
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
      setClasses([]);
      setCurrentClass(null);
      setLoadingClasses(false);
    }
  }, [user]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('grade_level', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      setClasses(data || []);
      if (data && data.length > 0) {
        // Keep current selected if valid, or default to first
        setCurrentClass(prev => {
          if (prev && data.some(c => c.id === prev.id)) {
            return prev;
          }
          return data[0];
        });
      } else {
        setCurrentClass(null);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách lớp học:', err);
    } finally {
      setLoadingClasses(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3FBF7] flex items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-16 h-16 bg-mint-500 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-mint-glow">
            ⭐
          </div>
          <p className="text-sm font-bold text-mint-800">Đang khởi tạo Sổ Chủ Nhiệm THCS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#F3FBF7] text-slate-800 flex flex-col">
      <Navbar
        classes={classes}
        currentClass={currentClass}
        onSelectClass={setCurrentClass}
        onOpenLuckyWheel={() => openModal('luckyWheel')}
        onOpenNoiseMeter={() => openModal('noiseMeter')}
        onOpenGroupGenerator={() => openModal('groupGenerator')}
        onOpenCountdownTimer={() => openModal('countdownTimer')}
        onOpenAttendance={() => openModal('attendance')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route
            path="/"
            element={
              <TeacherDashboard
                classes={classes}
                currentClass={currentClass}
                onSelectClass={setCurrentClass}
                onRefreshClasses={fetchClasses}
                modalState={modalState}
                onOpenModal={openModal}
                onCloseModal={closeModal}
              />
            }
          />
          <Route
            path="/leaderboard"
            element={<LeaderboardView currentClass={currentClass} />}
          />
          <Route
            path="/settings"
            element={
              <Settings
                currentClass={currentClass}
                onRefreshClasses={fetchClasses}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MascotRobot } from './MascotRobot';
import { soundFx } from '../utils/soundEffects';
import {
  LayoutGrid,
  Trophy,
  Gift,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Volume2,
  Users,
  Timer as TimerIcon,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export const Navbar = ({
  classes = [],
  currentClass = null,
  onSelectClass,
  onOpenLuckyWheel,
  onOpenNoiseMeter,
  onOpenGroupGenerator,
  onOpenCountdownTimer,
  onOpenAttendance
}) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-mint-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Mascot */}
          <div className="flex items-center space-x-3">
            <Link 
              to="/" 
              onClick={() => soundFx.playClick()}
              className="flex items-center space-x-3 group"
            >
              <div className="bg-mint-100 p-2 rounded-2xl group-hover:bg-mint-200 transition-colors">
                <MascotRobot mode="happy" size={40} className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-mint-600 to-coral-500 bg-clip-text text-transparent">
                  SỔ CHỦ NHIỆM
                </span>
                <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Khối THCS 6-9 • Smart EdTech
                </span>
              </div>
            </Link>

            {/* Class Selector Pill */}
            {classes.length > 0 && (
              <div className="relative ml-4 hidden md:block">
                <button
                  onClick={() => {
                    setShowClassDropdown(!showClassDropdown);
                    soundFx.playClick();
                  }}
                  className="flex items-center space-x-2 bg-mint-50 hover:bg-mint-100 text-mint-800 border border-mint-200 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-mint-500 animate-ping"></span>
                  <span>{currentClass ? `Lớp ${currentClass.name} (Khối ${currentClass.grade_level})` : 'Chọn lớp'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-mint-600" />
                </button>

                {showClassDropdown && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-mint-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Danh sách Lớp Chủ Nhiệm
                    </div>
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => {
                          onSelectClass(cls);
                          setShowClassDropdown(false);
                          soundFx.playClick();
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-mint-50 transition-colors ${
                          currentClass?.id === cls.id ? 'font-bold text-mint-700 bg-mint-50/70' : 'text-slate-700'
                        }`}
                      >
                        <span>Lớp {cls.name}</span>
                        <span className="text-xs bg-mint-100 text-mint-700 px-2 py-0.5 rounded-md font-semibold">
                          Khối {cls.grade_level}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              onClick={() => soundFx.playClick()}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/') 
                  ? 'bg-mint-500 text-white shadow-mint-glow' 
                  : 'text-slate-600 hover:text-mint-600 hover:bg-mint-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Sơ Đồ & Lớp Học</span>
            </Link>

            <Link
              to="/leaderboard"
              onClick={() => soundFx.playClick()}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/leaderboard') 
                  ? 'bg-mint-500 text-white shadow-mint-glow' 
                  : 'text-slate-600 hover:text-mint-600 hover:bg-mint-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Vinh Danh</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => soundFx.playClick()}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/settings') 
                  ? 'bg-mint-500 text-white shadow-mint-glow' 
                  : 'text-slate-600 hover:text-mint-600 hover:bg-mint-50'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Cài Đặt</span>
            </Link>
          </nav>

          {/* Quick Action Tools Bar */}
          <div className="flex items-center space-x-2">
            
            {/* Quick Attendance */}
            <button
              onClick={() => {
                onOpenAttendance?.();
                soundFx.playClick();
              }}
              title="Điểm danh nhanh"
              className="flex items-center space-x-1.5 bg-coral-50 hover:bg-coral-100 text-coral-600 border border-coral-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-coral-500" />
              <span className="hidden sm:inline">Điểm Danh</span>
            </button>

            {/* Lucky Wheel Tool */}
            <button
              onClick={() => {
                onOpenLuckyWheel?.();
                soundFx.playClick();
              }}
              title="Vòng quay ngẫu nhiên"
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Noise Meter Tool */}
            <button
              onClick={() => {
                onOpenNoiseMeter?.();
                soundFx.playClick();
              }}
              title="Đo độ ồn lớp học"
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Group Generator Tool */}
            <button
              onClick={() => {
                onOpenGroupGenerator?.();
                soundFx.playClick();
              }}
              title="Thuật toán Chia nhóm"
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* Countdown Timer Tool */}
            <button
              onClick={() => {
                onOpenCountdownTimer?.();
                soundFx.playClick();
              }}
              title="Đồng hồ đếm ngược"
              className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <TimerIcon className="w-4 h-4" />
            </button>

            {/* User Profile & Logout */}
            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center space-x-2 pl-1">
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-bold text-slate-800">
                  {profile?.full_name || 'Giáo viên'}
                </span>
                <span className="block text-[10px] text-mint-600 font-semibold uppercase">
                  {profile?.role === 'admin' ? 'Quản trị' : 'GVCN'}
                </span>
              </div>
              <button
                onClick={signOut}
                title="Đăng xuất"
                className="p-2 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

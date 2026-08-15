import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { MascotRobot } from './MascotRobot';
import {
  LayoutDashboard,
  School,
  GraduationCap,
  UserCheck,
  Grid,
  Calendar,
  Gift,
  Sparkles,
  Film,
  Volume2,
  Timer,
  Link as LinkIcon,
  BarChart3,
  Database,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  PhoneCall
} from 'lucide-react';

export const Sidebar = ({ activeTab, onTabChange, studentCount = 18, teacherProfile = null }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: LayoutDashboard },
    { id: 'classes', label: 'Lớp học', icon: School },
    { id: 'students', label: 'Học sinh', icon: GraduationCap, badge: studentCount, badgeColor: 'bg-blue-100 text-blue-700' },
    { id: 'attendance', label: 'Điểm danh', icon: UserCheck },
    { id: 'seating', label: 'Sơ đồ lớp', icon: Grid },
    { id: 'timetable', label: 'Thời khóa biểu', icon: Calendar },
    { id: 'rewards', label: 'Đổi quà', icon: Gift, badge: 'HOT', badgeColor: 'bg-coral-100 text-coral-600 font-bold' },
    { id: 'luckywheel', label: 'Vòng quay', icon: Sparkles, badge: 'HOT', badgeColor: 'bg-amber-100 text-amber-700 font-bold' },
    { id: 'leaderboard', label: 'Cuộn Phim', icon: Film, badge: 'NEW', badgeColor: 'bg-mint-100 text-mint-700 font-bold' },
    { id: 'noisemeter', label: 'Chống Ồn', icon: Volume2 },
    { id: 'timer', label: 'Đếm Ngược', icon: Timer },
    { id: 'links', label: 'Liên Kết', icon: LinkIcon },
    { id: 'stats', label: 'Thống Kê', icon: BarChart3 },
    { id: 'data', label: 'Dữ Liệu', icon: Database },
    { id: 'settings', label: 'Cài Đặt', icon: Settings },
  ];

  return (
    <aside
      className={`bg-white border-r border-purple-100 flex flex-col justify-between transition-all duration-300 z-30 sticky top-0 h-screen ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header Logo */}
      <div className="p-4 border-b border-purple-50 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center space-x-2.5">
            <div className="bg-purple-50 p-2 rounded-2xl border border-purple-100 shadow-sm">
              <MascotRobot mode="happy" size={32} className="w-8 h-8" />
            </div>
            <div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-coral-500 bg-clip-text text-transparent block leading-tight">
                Lớp Học Vui
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sổ Chủ Nhiệm THCS
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto bg-purple-50 p-2 rounded-2xl border border-purple-100">
            <MascotRobot mode="happy" size={32} className="w-8 h-8" />
          </div>
        )}

        <button
          onClick={() => {
            soundFx.playClick();
            setCollapsed(!collapsed);
          }}
          className="p-1.5 text-purple-400 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Vertical Menu Scroll Area (Image 1, 2, 5 Style) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                onTabChange(item.id);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-purple-glow transform scale-[1.02]'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Section (Image 1, 2, 5 Style) */}
      {!collapsed && (
        <div className="p-3 border-t border-purple-50 space-y-2 bg-slate-50/50">
          
          {/* Guide Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              alert('Chào mừng Thầy/Cô đến với Sổ Chủ Nhiệm THCS - Lớp Học Vui!');
            }}
            className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-2xl text-xs shadow-sm flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
          >
            <BookOpen className="w-4 h-4 text-amber-950" />
            <span>Xem Hướng Dẫn</span>
          </button>

          {/* Author Support Card (Image 1 & 5) */}
          <div className="bg-blue-50/70 rounded-2xl p-2.5 border border-blue-100 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-purple-700 font-extrabold text-[10px] uppercase">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>TÁC GIẢ ỨNG DỤNG</span>
            </div>
            <div className="font-extrabold text-slate-800 text-xs">
              {teacherProfile?.full_name ? `Thầy. ${teacherProfile.full_name}` : 'Thầy. Nguyễn Văn Hải'}
            </div>
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500">Zalo hỗ trợ:</span>
              <span className="bg-emerald-500 text-white font-mono font-bold px-2 py-0.5 rounded-full text-[10px]">
                0974754446
              </span>
            </div>
          </div>

        </div>
      )}
    </aside>
  );
};

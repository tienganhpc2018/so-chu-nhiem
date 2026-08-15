import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { ClassJournalModal } from '../components/ClassJournalModal';
import {
  UserCheck,
  UserPlus,
  Sparkles,
  Gift,
  Users,
  CheckCircle2,
  Coins,
  Award,
  Calendar,
  ChevronRight,
  Plus,
  ExternalLink,
  Camera
} from 'lucide-react';

export const HomeView = ({
  currentClass,
  students = [],
  teacherProfile,
  onTabChange,
  onOpenAttendance,
  onOpenAddStudent,
  onOpenLuckyWheel,
  onOpenRewards
}) => {
  const [showJournalModal, setShowJournalModal] = useState(false);

  const teacherName = teacherProfile?.full_name || 'Nguyễn Văn Hải';
  const teacherAvatar = teacherProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${teacherName}`;

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  // Stats calculation
  const totalStudents = students.length;
  const presentCount = totalStudents; // Default present for demo
  const totalStars = students.reduce((acc, curr) => acc + (curr.total_stars || 0), 0);
  const avgStars = totalStudents > 0 ? (totalStars / totalStudents).toFixed(1) : 0;

  // Top 5 students
  const topStudents = [...students].sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0)).slice(0, 5);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Top Banner Card (Image 2 Style) */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-6 md:p-8 border border-purple-100/80 shadow-soft relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Banner Left Info */}
        <div className="flex items-center space-x-5 relative z-10">
          <img
            src={teacherAvatar}
            alt={teacherName}
            className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-md bg-purple-100"
          />
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-white/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-purple-200 text-[11px] font-extrabold text-purple-700 shadow-sm mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Năm học 2026 - 2027 • Khối {currentClass?.grade_level || 8}</span>
            </div>
            
            {/* FEATURE 1: NEXT PERIOD COUNTDOWN WIDGET */}
            <div className="mt-1 p-3 bg-purple-900 text-white rounded-2xl shadow-md border border-purple-700 flex items-center space-x-2 text-xs font-black">
              <Calendar className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>⏰ TIẾT HỌC TIẾP THEO: TIẾT 2 SÁNG — TIẾNG ANH (07:50 - 08:35)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {greeting}, <span className="bg-gradient-to-r from-purple-600 to-coral-500 bg-clip-text text-transparent">{teacherName}! 👋</span>
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1 max-w-xl leading-relaxed">
              Chúc thầy/cô một ngày dạy học tràn ngập tiếng cười và nhiều niềm vui cùng tập thể lớp <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-extrabold">{currentClass?.name || '8A5'}</span>.
            </p>
          </div>
        </div>

        {/* Banner Quick Action Buttons (4 Action Pills matching Image 2) */}
        <div className="grid grid-cols-2 gap-2.5 w-full lg:w-auto relative z-10">
          
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenAttendance?.();
            }}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl text-xs font-extrabold shadow-sm transition-all transform hover:scale-[1.02]"
          >
            <UserCheck className="w-4 h-4" />
            <span>Điểm danh ngay</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onOpenAddStudent?.();
            }}
            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-2xl text-xs font-extrabold shadow-sm transition-all transform hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onOpenLuckyWheel?.();
            }}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl text-xs font-extrabold shadow-sm transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Vòng quay may mắn</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowJournalModal(true);
            }}
            className="flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-2xl text-xs font-extrabold shadow-sm transition-all transform hover:scale-[1.02]"
          >
            <Camera className="w-4 h-4" />
            <span>Nhật ký sinh hoạt</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onOpenRewards?.();
            }}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-3 rounded-2xl text-xs font-extrabold shadow-sm transition-all transform hover:scale-[1.02]"
          >
            <Gift className="w-4 h-4" />
            <span>Cửa hàng đổi quà</span>
          </button>

        </div>

      </div>

      {/* 4 Stat Cards Row (Matching Image 2 Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat Card 1: Sĩ số */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <button
              onClick={() => onTabChange('students')}
              className="text-[11px] font-bold text-slate-400 hover:text-purple-600 flex items-center space-x-0.5"
            >
              <span>Chi tiết</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Sĩ số học sinh</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-800">{totalStudents}</span>
              <span className="text-xs font-bold text-slate-400">em ({currentClass?.name || '8A5'})</span>
            </div>
          </div>
        </div>

        {/* Stat Card 2: Hiện diện */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <button
              onClick={() => onOpenAttendance?.()}
              className="text-[11px] font-bold text-slate-400 hover:text-purple-600 flex items-center space-x-0.5"
            >
              <span>Điểm danh</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Hiện diện hôm nay</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-800">{presentCount}/{totalStudents}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                (100%)
              </span>
            </div>
          </div>
        </div>

        {/* Stat Card 3: Tổng xu thi đua */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-coral-50 text-coral-600 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
            <button
              onClick={() => onOpenRewards?.()}
              className="text-[11px] font-bold text-slate-400 hover:text-purple-600 flex items-center space-x-0.5"
            >
              <span>Đổi phần thưởng</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Tổng xu thi đua</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black text-coral-600">{totalStars}</span>
              <span className="text-xs font-bold text-slate-400">xu toàn lớp</span>
            </div>
          </div>
        </div>

        {/* Stat Card 4: Trung bình xu */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <button
              onClick={() => onTabChange('leaderboard')}
              className="text-[11px] font-bold text-slate-400 hover:text-purple-600 flex items-center space-x-0.5"
            >
              <span>Báo cáo</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Trung bình / học sinh</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black text-purple-600">{avgStars}</span>
              <span className="text-xs font-bold text-slate-400">xu / em</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2-Column Bottom Layout (Matching Image 2 Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Thời Khóa Biểu Hôm Nay (Feature 2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-extrabold text-slate-800">
                Lịch Học Hôm Nay ({new Date().getDay() === 0 ? 'Chủ Nhật' : `Thứ ${new Date().getDay() + 1}`})
              </h3>
            </div>
            <button
              onClick={() => onTabChange('timetable')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
            >
              <span>Xem cả tuần</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {(() => {
            const todayDay = new Date().getDay() === 0 ? 7 : new Date().getDay() + 1; // 2..7
            const timetableData = (() => {
              try {
                const stored = localStorage.getItem(`timetable_${currentClass?.id || 'demo'}`);
                return stored ? JSON.parse(stored) : {};
              } catch {
                return {};
              }
            })();

            const todayMorning = [];
            const todayAfternoon = [];

            for (let p = 1; p <= 6; p++) {
              if (timetableData[`morning_${p}_${todayDay}`]) {
                todayMorning.push({ period: p, ...timetableData[`morning_${p}_${todayDay}`] });
              }
              if (timetableData[`afternoon_${p}_${todayDay}`]) {
                todayAfternoon.push({ period: p, ...timetableData[`afternoon_${p}_${todayDay}`] });
              }
            }

            if (todayMorning.length === 0 && todayAfternoon.length === 0) {
              return (
                <div className="bg-slate-50 rounded-2xl p-6 text-center text-xs font-semibold text-slate-400 border border-slate-100">
                  Hôm nay không có tiết học nào trong thời khóa biểu hoặc là ngày nghỉ.
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {todayMorning.length > 0 && (
                  <div>
                    <span className="text-[11px] font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">☀️ Buổi Sáng:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {todayMorning.map(m => (
                        <div key={`m-${m.period}`} className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs font-bold">
                          <span className="text-amber-950">{m.icon || '📚'} Tiết {m.period}: {m.subject}</span>
                          <span className="text-[10px] text-amber-800 font-extrabold">{m.teacher}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {todayAfternoon.length > 0 && (
                  <div>
                    <span className="text-[11px] font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">🌆 Buổi Chiều:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {todayAfternoon.map(a => (
                        <div key={`a-${a.period}`} className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center justify-between text-xs font-bold">
                          <span className="text-purple-950">{a.icon || '📚'} Tiết {a.period}: {a.subject}</span>
                          <span className="text-[10px] text-purple-800 font-extrabold">{a.teacher}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Column 3: Top Thi Đua Nhận Xu */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-coral-500" />
              <h3 className="text-base font-extrabold text-slate-800">Top Thi Đua Nhận Xu</h3>
            </div>
            <button
              onClick={() => onTabChange('leaderboard')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {topStudents.map((st, idx) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-purple-50/50 rounded-2xl border border-slate-100 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <img
                    src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                    alt={st.full_name}
                    className="w-9 h-9 rounded-xl object-cover bg-white border border-purple-100"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{st.full_name}</span>
                    <span className="text-[10px] text-slate-400">Học sinh ngoan</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{st.total_stars || 0} xu</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FEATURE 4: CLASS JOURNAL PHOTO DIARY MODAL */}
      <ClassJournalModal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        currentClass={currentClass}
      />

    </div>
  );
};

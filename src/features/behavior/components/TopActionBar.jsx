import React from 'react';
import {
  School,
  Maximize2,
  Minimize2,
  UserCheck,
  Award,
  Sparkles,
  Zap,
  Gift,
  Users,
  Layers,
  Flame,
  Timer,
  Grid,
  RotateCcw
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const TopActionBar = ({
  avatarSize,
  onToggleAvatarSize,
  onOpenAddClass,
  onOpenAttendance,
  onOpenPointModal,
  onOpenTetHaiHoa,
  onOpenSingleCall,
  onOpenBlindPouch,
  onOpenMultiCall,
  onOpenGroupTeams,
  onOpenBeeRace,
  onOpenTimer,
  onOpenSeatingChart,
  onResetCalled,
  calledCount = 0,
  totalStudents = 0
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-purple-100 rounded-3xl p-3 shadow-soft">
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
        
        {/* 1. Thêm Lớp Mới */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenAddClass();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-purple-200 hover:scale-105 active:scale-95 transition-all"
        >
          <School className="w-3.5 h-3.5" />
          <span>+ Thêm Lớp Mới</span>
        </button>

        {/* 2. Hiển Thị To/Nhỏ */}
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleAvatarSize();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all active:scale-95 border border-slate-200"
        >
          {avatarSize === 'large' ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Cỡ Nhỏ (80px)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Cỡ To (96px)</span>
            </>
          )}
        </button>

        {/* 3. Điểm Danh */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenAttendance();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-100 hover:scale-105 active:scale-95 transition-all"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Điểm Danh</span>
        </button>

        {/* 4. Danh Sách & Cho Điểm */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenPointModal();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md shadow-amber-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Danh Sách & Cho Điểm</span>
        </button>

        {/* 5. Tết (Hái hoa dân chủ) 🌸 */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenTetHaiHoa();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white font-extrabold text-xs shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
          <span>Tết (Hái hoa dân chủ) 🌸</span>
        </button>

        {/* 6. Vòng Quay & Gọi 1 (6s Hồi Hộp) */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenSingleCall();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>Gọi 1 (6s Hồi Hộp)</span>
        </button>

        {/* 7. Túi Mù (32 Hộp Quà) 🎁 */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenBlindPouch();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-xs shadow-md shadow-pink-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Túi Mù (32 Hộp Quà) 🎁</span>
        </button>

        {/* 8. Gọi Nhiều (Xem Full Lớp) 👥 */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenMultiCall();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-extrabold text-xs shadow-md shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Gọi Nhiều (Xem Full Lớp) 👥</span>
        </button>

        {/* 9. Chia Nhóm & Theo Tổ 🐝 */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenGroupTeams();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold text-xs shadow-md shadow-teal-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Chia Nhóm & Theo Tổ 🐝</span>
        </button>

        {/* 10. Bee Race (Đua Vịt Slider) 🐥 */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenBeeRace();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md shadow-yellow-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Flame className="w-3.5 h-3.5 text-yellow-100" />
          <span>Bee Race (Đua Vịt Slider) 🐥</span>
        </button>

        {/* 11. Bấm Giờ ⏱️ */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenTimer();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-purple-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Bấm Giờ ⏱️</span>
        </button>

        {/* 12. Sơ Đồ Lớp (Chỉnh Sửa Chỗ Ngồi) 🏫 */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenSeatingChart();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 text-white font-extrabold text-xs shadow-md shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Grid className="w-3.5 h-3.5 text-amber-300" />
          <span>Sơ Đồ Lớp (Đổi Chỗ Kéo Thả) 🏫</span>
        </button>

        {/* 13. Đặt Lại Danh Sách Gọi Tên */}
        <button
          onClick={() => {
            soundFx.playClick();
            onResetCalled();
          }}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs border border-rose-200 transition-all active:scale-95"
          title="Xóa nhãn [ ĐÃ GỌI ] để bắt đầu lượt gọi mới"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt Lại Lượt Gọi ({calledCount}/{totalStudents})</span>
        </button>

      </div>
    </div>
  );
};

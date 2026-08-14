import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/soundEffects';
import { DangerZone } from '../components/DangerZone';
import { MascotRobot } from '../components/MascotRobot';
import { EmptyState } from '../components/EmptyState';
import { Settings as SettingsIcon, User, ShieldCheck, Database, Check } from 'lucide-react';

export const Settings = ({ currentClass, onRefreshClasses }) => {
  const { profile, user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleResetPointsHistory = async (classId) => {
    const { error } = await supabase
      .from('point_history')
      .delete()
      .eq('class_id', classId);

    if (error) throw error;

    // Reset total_stars of all students in class to 0
    await supabase
      .from('students')
      .update({ total_stars: 0 })
      .eq('class_id', classId);

    soundFx.playCorrect();
    alert('Đã xóa toàn bộ lịch sử tích điểm và đặt lại điểm Sao của lớp về 0!');
  };

  const handleResetSeatingChart = async (classId) => {
    const { error } = await supabase
      .from('students')
      .update({ seat_row: 1, seat_col: 1 })
      .eq('class_id', classId);

    if (error) throw error;

    soundFx.playCorrect();
    alert('Đã đặt lại sơ đồ chỗ ngồi của toàn bộ học sinh về vị trí mặc định!');
  };

  const handleDeleteClassRoster = async (classId) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('class_id', classId);

    if (error) throw error;

    soundFx.playCorrect();
    alert('Đã xóa toàn bộ danh sách học sinh của lớp khỏi cơ sở dữ liệu!');
    if (onRefreshClasses) onRefreshClasses();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-mint-600 via-mint-500 to-coral-500 rounded-3xl p-6 text-white shadow-soft flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
            <MascotRobot mode="happy" size={56} />
          </div>
          <div>
            <h2 className="text-2xl font-black flex items-center space-x-2">
              <SettingsIcon className="w-6 h-6 text-mint-100" />
              <span>CÀI ĐẶT HỆ THỐNG & BẢO MẬT</span>
            </h2>
            <p className="text-xs text-mint-100 mt-0.5 font-semibold">
              Quản lý tài khoản Giáo viên chủ nhiệm, cấu hình lớp học và vùng nguy hiểm dữ liệu
            </p>
          </div>
        </div>
      </div>

      {/* Account Profile Details */}
      <div className="bg-white rounded-3xl p-6 border border-mint-100 shadow-soft max-w-3xl mx-auto space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-mint-600" />
          <h3 className="text-base font-extrabold text-slate-800">Thông Tin Tài Khoản Giáo Viên</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Họ và Tên</span>
            <span className="text-sm font-extrabold text-slate-900">{profile?.full_name || 'Giáo viên'}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Email Đăng Nhập</span>
            <span className="text-sm font-extrabold text-slate-900">{user?.email || 'N/A'}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Vai Trò Hệ Thống</span>
            <span className="text-sm font-extrabold text-mint-700 uppercase">{profile?.role || 'Teacher'}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Lớp Chủ Nhiệm Hiện Tại</span>
            <span className="text-sm font-extrabold text-coral-600">
              {currentClass ? `Lớp ${currentClass.name} (Khối ${currentClass.grade_level})` : 'Chưa chọn lớp'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {currentClass ? (
        <DangerZone
          currentClass={currentClass}
          onResetPointsHistory={handleResetPointsHistory}
          onResetSeatingChart={handleResetSeatingChart}
          onDeleteClassRoster={handleDeleteClassRoster}
        />
      ) : (
        <EmptyState
          title="Chọn Lớp để quản lý Vùng nguy hiểm"
          description="Bạn cần chọn một lớp học cụ thể để cấu hình cài đặt nâng cao và xóa dữ liệu."
          robotMode="thinking"
        />
      )}

    </div>
  );
};

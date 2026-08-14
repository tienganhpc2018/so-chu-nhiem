import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { soundFx } from '../utils/soundEffects';
import { MascotRobot } from './MascotRobot';
import { X, Calendar, CheckCircle2, Clock, AlertTriangle, XCircle, Save } from 'lucide-react';

export const AttendanceModal = ({ isOpen, onClose, classId, students = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen && classId && students.length > 0) {
      loadAttendance(selectedDate);
    }
  }, [isOpen, selectedDate, classId, students]);

  const loadAttendance = async (dateStr) => {
    setFetching(true);
    try {
      const studentIds = students.map(s => s.id);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .in('student_id', studentIds)
        .eq('date', dateStr);

      if (error) throw error;

      const initialMap = {};
      // Default present for all unless record exists
      students.forEach(s => {
        initialMap[s.id] = 'present';
      });

      if (data) {
        data.forEach(item => {
          initialMap[item.student_id] = item.status;
        });
      }

      setAttendanceData(initialMap);
    } catch (err) {
      console.error('Lỗi tải dữ liệu điểm danh:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    soundFx.playClick();
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    soundFx.playClick();
    try {
      const payload = students.map(s => ({
        student_id: s.id,
        date: selectedDate,
        status: attendanceData[s.id] || 'present'
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(payload, { onConflict: 'student_id, date' });

      if (error) throw error;

      soundFx.playCorrect();
      onClose();
    } catch (err) {
      console.error('Lỗi lưu điểm danh:', err);
      alert('Không thể lưu dữ liệu điểm danh. Vui lòng kiểm tra kết nối.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return { label: 'Có mặt', bg: 'bg-mint-500 text-white', icon: CheckCircle2 };
      case 'late':
        return { label: 'Đi muộn', bg: 'bg-amber-500 text-white', icon: Clock };
      case 'absent_p':
        return { label: 'Vắng phép', bg: 'bg-blue-500 text-white', icon: AlertTriangle };
      case 'absent_kp':
        return { label: 'Vắng KP', bg: 'bg-coral-500 text-white', icon: XCircle };
      default:
        return { label: 'Có mặt', bg: 'bg-mint-500 text-white', icon: CheckCircle2 };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-mint-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <MascotRobot mode="happy" size={44} />
            <div>
              <h3 className="text-xl font-bold text-slate-800">Điểm Danh Chuyên Cần Lớp Học</h3>
              <p className="text-xs text-slate-500">Cập nhật nhanh tình hình hiện diện của học sinh THCS theo ngày</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Filter */}
        <div className="my-4 flex items-center justify-between bg-mint-50/60 p-3 rounded-2xl border border-mint-100">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-mint-600" />
            <span className="text-sm font-bold text-slate-700">Ngày điểm danh:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-mint-200 rounded-xl px-3 py-1 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Tổng số: <span className="font-extrabold text-mint-700">{students.length} HS</span>
          </div>
        </div>

        {/* Attendance List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 my-2">
          {fetching ? (
            <div className="py-8 text-center text-slate-400">Đang tải dữ liệu điểm danh...</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-slate-400">Chưa có danh sách học sinh trong lớp này.</div>
          ) : (
            students.map((st) => {
              const currentStatus = attendanceData[st.id] || 'present';
              return (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-mint-50/30 rounded-2xl border border-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                      alt={st.full_name}
                      className="w-10 h-10 rounded-full border border-mint-200 bg-white"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">{st.full_name}</span>
                      <span className="text-[11px] text-slate-400">Bàn B{st.seat_row}-C{st.seat_col}</span>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center space-x-1.5">
                    {[
                      { key: 'present', label: 'Có mặt', color: 'hover:bg-mint-500 hover:text-white border-mint-200 text-mint-700 bg-mint-50' },
                      { key: 'late', label: 'Đi muộn', color: 'hover:bg-amber-500 hover:text-white border-amber-200 text-amber-700 bg-amber-50' },
                      { key: 'absent_p', label: 'Vắng P', color: 'hover:bg-blue-500 hover:text-white border-blue-200 text-blue-700 bg-blue-50' },
                      { key: 'absent_kp', label: 'Vắng KP', color: 'hover:bg-coral-500 hover:text-white border-coral-200 text-coral-700 bg-coral-50' }
                    ].map(opt => {
                      const isSelected = currentStatus === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleStatusChange(st.id, opt.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                            isSelected
                              ? opt.key === 'present' ? 'bg-mint-500 text-white border-mint-500 shadow-sm'
                              : opt.key === 'late' ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : opt.key === 'absent_p' ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'bg-coral-500 text-white border-coral-500 shadow-sm'
                              : opt.color
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || students.length === 0}
            className="flex items-center space-x-2 bg-mint-500 hover:bg-mint-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-mint-glow transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Đang lưu...' : 'Lưu Điểm Danh'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

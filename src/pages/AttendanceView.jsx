import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { soundFx } from '../utils/soundEffects';
import { UserCheck, Clock, HelpCircle, XCircle, FileSpreadsheet, Save, Check, Calendar } from 'lucide-react';

export const AttendanceView = ({ currentClass, students = [] }) => {
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Default all students to 'present' for selected date
    const initialRecords = {};
    students.forEach(st => {
      initialRecords[st.id] = 'present';
    });
    setAttendanceRecords(initialRecords);

    if (currentClass) {
      fetchAttendanceData(currentClass.id, dateStr);
    }
  }, [currentClass, dateStr, students]);

  const fetchAttendanceData = async (classId, date) => {
    try {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', date);

      if (data && data.length > 0) {
        setAttendanceRecords(prev => {
          const updated = { ...prev };
          data.forEach(rec => {
            updated[rec.student_id] = rec.status;
          });
          return updated;
        });
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu điểm danh:', err);
    }
  };

  const handleSetAllStatus = (status) => {
    soundFx.playClick();
    const updated = {};
    students.forEach(st => {
      updated[st.id] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleStudentStatusChange = (studentId, status) => {
    soundFx.playClick();
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    soundFx.playCorrect();

    try {
      const recordsToInsert = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        student_id: studentId,
        date: dateStr,
        status
      }));

      await supabase.from('attendance').upsert(recordsToInsert, { onConflict: 'student_id,date' });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Lỗi lưu điểm danh:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    soundFx.playCorrect();
    let csvContent = "\uFEFF";
    csvContent += `SỔ CHỦ NHIỆM THCS - BÁO CÁO ĐIỂM DANH HÀNG NGÀY LỚP ${currentClass?.name || '8A5'}\n`;
    csvContent += `Ngày điểm danh: ${dateStr}\n\n`;
    csvContent += "STT,Họ và tên Học sinh,Tổ,Trạng thái điểm danh\n";

    const statusMap = {
      present: 'Có mặt',
      late: 'Đi muộn',
      absent_p: 'Vắng có phép',
      absent_kp: 'Vắng không phép'
    };

    students.forEach((st, idx) => {
      const sttStatus = statusMap[attendanceRecords[st.id] || 'present'];
      csvContent += `${idx + 1},"${st.full_name}",Tổ ${st.team_group || 1},${sttStatus}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DiemDanh_Lop_${currentClass?.name || '8A5'}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Counts calculation
  const presentCount = Object.values(attendanceRecords).filter(s => s === 'present').length;
  const lateCount = Object.values(attendanceRecords).filter(s => s === 'late').length;
  const absentPCount = Object.values(attendanceRecords).filter(s => s === 'absent_p').length;
  const absentKPCount = Object.values(attendanceRecords).filter(s => s === 'absent_kp').length;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      
      {/* Top Header & Action Controls Bar (Image 5 Style) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Điểm Danh Hàng Ngày Lớp {currentClass?.name || '8A5'}
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Điểm danh hiện diện, đi muộn, vắng mặt của học sinh.
          </p>
        </div>

        {/* Date Selector & Action Buttons (Image 5 Style) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          <div className="relative bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 shadow-sm flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-800"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-purple-glow transition-all flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Đang lưu...' : 'Lưu điểm danh'}</span>
          </button>

        </div>
      </div>

      {/* 4 Summary Cards (Matching Image 5 Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Có mặt */}
        <div className="bg-emerald-50/80 rounded-3xl p-5 border border-emerald-200 shadow-soft flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 uppercase">Có mặt</span>
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-700">{presentCount}</span>
            <button
              onClick={() => handleSetAllStatus('present')}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-900 block mt-1 underline"
            >
              Bấm để chọn tất cả
            </button>
          </div>
        </div>

        {/* Card 2: Đi muộn */}
        <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200 shadow-soft flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 uppercase">Đi muộn</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-amber-700">{lateCount}</span>
            <button
              onClick={() => handleSetAllStatus('late')}
              className="text-[11px] font-bold text-amber-600 hover:text-amber-900 block mt-1 underline"
            >
              Bấm để chọn tất cả
            </button>
          </div>
        </div>

        {/* Card 3: Vắng có phép */}
        <div className="bg-blue-50/80 rounded-3xl p-5 border border-blue-200 shadow-soft flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-800 uppercase">Vắng có phép</span>
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-blue-700">{absentPCount}</span>
            <button
              onClick={() => handleSetAllStatus('absent_p')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-900 block mt-1 underline"
            >
              Bấm để chọn tất cả
            </button>
          </div>
        </div>

        {/* Card 4: Vắng không phép */}
        <div className="bg-red-50/80 rounded-3xl p-5 border border-red-200 shadow-soft flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-800 uppercase">Vắng không phép</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-red-700">{absentKPCount}</span>
            <button
              onClick={() => handleSetAllStatus('absent_kp')}
              className="text-[11px] font-bold text-red-600 hover:text-red-900 block mt-1 underline"
            >
              Bấm để chọn tất cả
            </button>
          </div>
        </div>

      </div>

      {/* Attendance Roster Table List (Matching Image 5 Style) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
          <span>HỌC SINH</span>
          <span>TRẠNG THÁI ĐIỂM DANH NGÀY {dateStr}</span>
        </div>

        <div className="space-y-3">
          {students.map((st) => {
            const currentStatus = attendanceRecords[st.id] || 'present';
            return (
              <div
                key={st.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50/70 hover:bg-purple-50/40 rounded-2xl border border-slate-100 transition-all gap-3"
              >
                
                {/* Student Info */}
                <div className="flex items-center space-x-3">
                  <img
                    src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                    alt={st.full_name}
                    className="w-10 h-10 rounded-2xl object-cover bg-white border border-purple-100 shadow-sm"
                  />
                  <div>
                    <span className="text-sm font-black text-slate-800 block">{st.full_name}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">Tổ {st.team_group || 1}</span>
                  </div>
                </div>

                {/* 4 Status Option Pills (Matching Image 5 Style) */}
                <div className="flex items-center space-x-1.5 self-end sm:self-center">
                  
                  <button
                    onClick={() => handleStudentStatusChange(st.id, 'present')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-500 text-white shadow-emerald-glow'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    Có mặt
                  </button>

                  <button
                    onClick={() => handleStudentStatusChange(st.id, 'late')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-amber-glow'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    Đi muộn
                  </button>

                  <button
                    onClick={() => handleStudentStatusChange(st.id, 'absent_p')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                      currentStatus === 'absent_p'
                        ? 'bg-blue-500 text-white shadow-blue-glow'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    Có phép
                  </button>

                  <button
                    onClick={() => handleStudentStatusChange(st.id, 'absent_kp')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                      currentStatus === 'absent_kp'
                        ? 'bg-red-500 text-white shadow-red-glow'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-red-50'
                    }`}
                  >
                    Không phép
                  </button>

                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Success Toast Notification */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-emerald-400 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">Thành công</h4>
            <p className="text-[11px] font-bold text-slate-500">Đã lưu kết quả điểm danh ngày {dateStr}</p>
          </div>
        </div>
      )}

    </div>
  );
};

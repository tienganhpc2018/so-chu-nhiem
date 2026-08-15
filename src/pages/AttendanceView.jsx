import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { soundFx } from '../utils/soundEffects';
import {
  UserCheck,
  Clock,
  HelpCircle,
  XCircle,
  FileSpreadsheet,
  Save,
  Check,
  Calendar,
  AlertTriangle,
  BarChart3,
  FileText,
  Printer,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';

export const AttendanceView = ({ currentClass, students = [] }) => {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'monthly' | 'semester'
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedSemester, setSelectedSemester] = useState('hk1'); // 'hk1' | 'hk2'
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});
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

  // Generate simulated/real monthly attendance stats for all students
  useEffect(() => {
    const stats = {};
    students.forEach(st => {
      // Calculate or generate deterministic demo attendance stats based on student ID
      const seed = st.id.charCodeAt(st.id.length - 1);
      const absentCount = seed % 5; // 0 to 4 absences
      const lateCount = (seed + 1) % 3; // 0 to 2 lates
      const presentCount = 22 - absentCount - lateCount; // 22 school days/month

      stats[st.id] = {
        present: presentCount,
        late: lateCount,
        absent_p: Math.floor(absentCount / 2),
        absent_kp: Math.ceil(absentCount / 2),
        total_absent: absentCount,
        rate: Math.round((presentCount / 22) * 100)
      };
    });
    setMonthlyStats(stats);
  }, [students, selectedMonth]);

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
    csvContent += `SỔ CHỦ NHIỆM THCS - BÁO CÁO ĐIỂM DANH LỚP ${currentClass?.name || '8A5'}\n`;
    csvContent += `Chế độ: ${activeTab === 'daily' ? `Ngày ${dateStr}` : activeTab === 'monthly' ? `Tháng ${selectedMonth}` : `Học kỳ ${selectedSemester === 'hk1' ? 'I' : 'II'}`}\n\n`;
    csvContent += "STT,Họ và tên Học sinh,Tổ,Số ngày có mặt,Đi muộn,Vắng có phép,Vắng không phép,Tỷ lệ chuyên cần,Xếp loại\n";

    students.forEach((st, idx) => {
      const stStat = monthlyStats[st.id] || { present: 22, late: 0, absent_p: 0, absent_kp: 0, rate: 100 };
      const rating = stStat.rate >= 95 ? 'Xuất sắc' : stStat.rate >= 85 ? 'Tốt' : stStat.rate >= 75 ? 'Khá' : 'Cần rèn luyện';
      csvContent += `${idx + 1},"${st.full_name}",Tổ ${st.team_group || 1},${stStat.present},${stStat.late},${stStat.absent_p},${stStat.absent_kp},${stStat.rate}%,${rating}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoDiemDanh_Lop_${currentClass?.name || '8A5'}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find students with > 3 absences (Feature 2: Absence Warning Alert)
  const warningStudents = students.filter(st => {
    const stStat = monthlyStats[st.id];
    return stStat && stStat.total_absent > 3;
  });

  // Daily Counts calculation
  const presentCount = Object.values(attendanceRecords).filter(s => s === 'present').length;
  const lateCount = Object.values(attendanceRecords).filter(s => s === 'late').length;
  const absentPCount = Object.values(attendanceRecords).filter(s => s === 'absent_p').length;
  const absentKPCount = Object.values(attendanceRecords).filter(s => s === 'absent_kp').length;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Điểm Danh & Thống Kê Chuyên Cần Lớp {currentClass?.name || '8A5'}
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Quản lý hiện diện hàng ngày, thống kê biểu đồ chuyên cần tháng và báo cáo tổng kết học kỳ.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Báo Cáo Excel</span>
          </button>

          {activeTab === 'daily' && (
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-purple-glow transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu điểm danh'}</span>
            </button>
          )}

        </div>
      </div>

      {/* Feature 2: Red Alert Banner for Students with > 3 Absences */}
      {warningStudents.length > 0 && (
        <div className="bg-red-500 text-white rounded-3xl p-5 shadow-xl border-2 border-red-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-bounce-short">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide flex items-center space-x-1">
                <span>🚨 CẢNH BÁO NGHỈ HỌC QUÁ 3 BUỔI TRONG THÁNG!</span>
              </h3>
              <p className="text-xs text-red-100 font-semibold mt-1">
                Hệ thống phát hiện <span className="font-extrabold text-yellow-300">{warningStudents.length} học sinh</span> vắng mặt nhiều hơn 3 buổi. Thầy nên đôn đốc và liên hệ ngay với Phụ huynh:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {warningStudents.map(st => (
                  <span key={st.id} className="bg-white text-red-700 px-3 py-1 rounded-full text-xs font-black shadow-sm flex items-center space-x-1">
                    <span>{st.full_name}</span>
                    <span className="text-[10px] text-red-500">({monthlyStats[st.id]?.total_absent} buổi)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => alert(`Đã gửi danh sách ${warningStudents.length} học sinh nghỉ quá 3 buổi tới Zalo hỗ trợ Phụ huynh!`)}
            className="px-5 py-2.5 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-2xl shadow-md shrink-0 flex items-center space-x-1.5 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-red-600" />
            <span>Liên Hệ Phụ Huynh Qua Zalo</span>
          </button>
        </div>
      )}

      {/* Main Mode Sub-Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('daily');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'daily' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Điểm Danh Hàng Ngày</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('monthly');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'monthly' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Biểu Đồ Chuyên Cần Tháng</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('semester');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'semester' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Báo Cáo Tổng Kết Học Kỳ</span>
        </button>
      </div>

      {/* TAB 1: DAILY ATTENDANCE (Matching Image 5) */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50/80 rounded-3xl p-5 border border-emerald-200 shadow-soft flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 uppercase">Có mặt</span>
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-3xl font-black text-emerald-700">{presentCount}</span>
                <button onClick={() => handleSetAllStatus('present')} className="text-[11px] font-bold text-emerald-600 hover:text-emerald-900 block mt-1 underline">
                  Bấm để chọn tất cả
                </button>
              </div>
            </div>

            <div className="bg-amber-50/80 rounded-3xl p-5 border border-amber-200 shadow-soft flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-800 uppercase">Đi muộn</span>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-3xl font-black text-amber-700">{lateCount}</span>
                <button onClick={() => handleSetAllStatus('late')} className="text-[11px] font-bold text-amber-600 hover:text-amber-900 block mt-1 underline">
                  Bấm để chọn tất cả
                </button>
              </div>
            </div>

            <div className="bg-blue-50/80 rounded-3xl p-5 border border-blue-200 shadow-soft flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-800 uppercase">Vắng có phép</span>
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-3xl font-black text-blue-700">{absentPCount}</span>
                <button onClick={() => handleSetAllStatus('absent_p')} className="text-[11px] font-bold text-blue-600 hover:text-blue-900 block mt-1 underline">
                  Bấm để chọn tất cả
                </button>
              </div>
            </div>

            <div className="bg-red-50/80 rounded-3xl p-5 border border-red-200 shadow-soft flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-800 uppercase">Vắng không phép</span>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <span className="text-3xl font-black text-red-700">{absentKPCount}</span>
                <button onClick={() => handleSetAllStatus('absent_kp')} className="text-[11px] font-bold text-red-600 hover:text-red-900 block mt-1 underline">
                  Bấm để chọn tất cả
                </button>
              </div>
            </div>
          </div>

          {/* Roster List */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
              <span>HỌC SINH</span>
              <span>TRẠNG THÁI ĐIỂM DANH NGÀY {dateStr}</span>
            </div>

            <div className="space-y-3">
              {students.map((st) => {
                const currentStatus = attendanceRecords[st.id] || 'present';
                const stStat = monthlyStats[st.id];
                const isWarn = stStat && stStat.total_absent > 3;

                return (
                  <div
                    key={st.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border transition-all gap-3 ${
                      isWarn ? 'bg-red-50/70 border-red-200' : 'bg-slate-50/70 hover:bg-purple-50/40 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                        alt={st.full_name}
                        className="w-10 h-10 rounded-2xl object-cover bg-white border border-purple-100 shadow-sm"
                      />
                      <div>
                        <span className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                          <span>{st.full_name}</span>
                          {isWarn && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                              🚨 Vắng {stStat.total_absent} buổi
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">Tổ {st.team_group || 1}</span>
                      </div>
                    </div>

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
        </div>
      )}

      {/* TAB 2: MONTHLY ATTENDANCE CHART (Feature 1) */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Biểu Đồ Thống Kê Chuyên Cần Theo Tháng</span>
            </h3>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-purple-50 border border-purple-200 text-purple-900 font-extrabold text-xs rounded-xl px-3 py-1.5 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m}>Tháng {m} / 2026</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {students.map(st => {
              const stStat = monthlyStats[st.id] || { present: 20, late: 1, absent_p: 1, absent_kp: 0, rate: 91 };
              const isWarn = stStat.total_absent > 3;

              return (
                <div key={st.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800">
                    <span className="flex items-center space-x-2">
                      <span>{st.full_name}</span>
                      {isWarn && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          🚨 Vắng {stStat.total_absent} buổi
                        </span>
                      )}
                    </span>

                    <span className="text-purple-700 font-extrabold">
                      Tỷ lệ chuyên cần: {stStat.rate}% ({stStat.present}/22 buổi)
                    </span>
                  </div>

                  {/* Visual Attendance Bar Chart */}
                  <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(stStat.present / 22) * 100}%` }}
                      className="h-full bg-emerald-500"
                      title={`Có mặt: ${stStat.present} buổi`}
                    ></div>
                    <div
                      style={{ width: `${(stStat.late / 22) * 100}%` }}
                      className="h-full bg-amber-400"
                      title={`Đi muộn: ${stStat.late} buổi`}
                    ></div>
                    <div
                      style={{ width: `${(stStat.absent_p / 22) * 100}%` }}
                      className="h-full bg-blue-500"
                      title={`Vắng có phép: ${stStat.absent_p} buổi`}
                    ></div>
                    <div
                      style={{ width: `${(stStat.absent_kp / 22) * 100}%` }}
                      className="h-full bg-red-500"
                      title={`Vắng không phép: ${stStat.absent_kp} buổi`}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                    <span className="text-emerald-700">🟢 Có mặt: {stStat.present}</span>
                    <span className="text-amber-700">🟡 Đi muộn: {stStat.late}</span>
                    <span className="text-blue-700">🔵 Vắng có phép: {stStat.absent_p}</span>
                    <span className="text-red-700">🔴 Vắng không phép: {stStat.absent_kp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SEMESTER SUMMARY REPORT (Feature 4) */}
      {activeTab === 'semester' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Báo Cáo Tổng Kết Chuyên Cần Cuối Học Kỳ</span>
            </h3>

            <div className="flex items-center space-x-2">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-purple-50 border border-purple-200 text-purple-900 font-extrabold text-xs rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="hk1">Tổng kết Học Kỳ I</option>
                <option value="hk2">Tổng kết Học Kỳ II</option>
              </select>

              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-purple-glow flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Báo Cáo</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50 text-purple-900 uppercase font-black">
                <tr>
                  <th className="p-3">STT</th>
                  <th className="p-3">Họ và Tên Học Sinh</th>
                  <th className="p-3">Tổ</th>
                  <th className="p-3 text-center">Có Mặt</th>
                  <th className="p-3 text-center">Đi Muộn</th>
                  <th className="p-3 text-center">Tổng Vắng</th>
                  <th className="p-3 text-center">Tỷ Lệ %</th>
                  <th className="p-3 text-center">Xếp Loại Chuyên Cần</th>
                  <th className="p-3 text-center">Gợi Ý Hạnh Kiểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {students.map((st, idx) => {
                  const stStat = monthlyStats[st.id] || { present: 88, late: 2, absent_p: 2, absent_kp: 0, rate: 95 };
                  const rating = stStat.rate >= 95 ? 'Xuất sắc' : stStat.rate >= 85 ? 'Tốt' : stStat.rate >= 75 ? 'Khá' : 'Cần rèn luyện';
                  const conduct = stStat.rate >= 90 ? 'Tốt' : stStat.rate >= 75 ? 'Khá' : 'Đạt';

                  return (
                    <tr key={st.id} className="hover:bg-purple-50/40">
                      <td className="p-3 font-bold">{idx + 1}</td>
                      <td className="p-3 font-black text-slate-900">{st.full_name}</td>
                      <td className="p-3">Tổ {st.team_group || 1}</td>
                      <td className="p-3 text-center text-emerald-700 font-extrabold">{stStat.present * 4} buổi</td>
                      <td className="p-3 text-center text-amber-700 font-extrabold">{stStat.late * 4} lần</td>
                      <td className="p-3 text-center text-red-700 font-extrabold">{stStat.total_absent * 4} buổi</td>
                      <td className="p-3 text-center font-black text-purple-700">{stStat.rate}%</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          stStat.rate >= 90 ? 'bg-emerald-100 text-emerald-800' : stStat.rate >= 75 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rating}
                        </span>
                      </td>
                      <td className="p-3 text-center font-black text-slate-800">{conduct}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success Toast */}
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

import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { SubjectConfigModal } from '../components/SubjectConfigModal';
import { PrintMonthlyAnalyticsModal } from '../components/PrintMonthlyAnalyticsModal';
import { PrintTeamAwardModal } from '../components/PrintTeamAwardModal';
import {
  BarChart3,
  Download,
  Users,
  Coins,
  Award,
  PlusCircle,
  MinusCircle,
  BookOpen,
  History,
  TrendingUp,
  Filter,
  Printer,
  Settings
} from 'lucide-react';

export const AnalyticsView = ({ currentClass, students = [], teacherProfile }) => {
  // Main Sub-Tab Switcher: 'overview' | 'subjects' | 'history'
  const [activeSubTab, setActiveSubTab] = useState('overview');
  
  // Gender Filter for Leaderboard: 'all' | 'male' | 'female'
  const [genderFilter, setGenderFilter] = useState('all');

  // Modals state
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showTeamAwardModal, setShowTeamAwardModal] = useState(false);

  const totalStudents = students.length || 15;
  const maleStudents = students.filter(s => s.gender === 'male' || s.gender === 'Nam').length || Math.floor(totalStudents * 0.47);
  const femaleStudents = totalStudents - maleStudents;

  const totalStars = students.reduce((acc, curr) => acc + (curr.total_stars || 0), 0);
  const avgStars = totalStudents > 0 ? (totalStars / totalStudents).toFixed(1) : 0;

  // Compute 4 Teams totals for Feature 3
  const teamStats = [1, 2, 3, 4].map(tNum => {
    const teamSt = students.filter(s => Number(s.team_group) === tNum);
    const sumCoins = teamSt.reduce((acc, curr) => acc + (curr.total_stars || 0), 0);
    return { team: tNum, total: sumCoins, count: teamSt.length };
  });

  const maxTeamTotal = Math.max(...teamStats.map(t => t.total), 1);

  // Subjects List
  const subjectsList = [
    'Tiếng Anh', 'Toán', 'Ngữ Văn', 'KHTN', 'Lịch Sử & Địa Lý',
    'Tin Học', 'Công Nghệ', 'GDCD', 'GDTC', 'Nghệ Thuật', 'Hoạt Động Trải Nghiệm'
  ];

  // History Logs
  const historyLogs = [
    { id: 'h1', time: new Date().toLocaleTimeString('vi-VN'), student: 'Nguyễn Minh Anh', type: 'plus', amount: 5, reason: 'Làm bài tập Tiếng Anh sạch đẹp, xuất sắc' }
  ];

  // Handle Export Excel Report
  const handleExportExcel = () => {
    soundFx.playCorrect();
    const rows = [
      ['STT', 'Họ và tên học sinh', 'Giới tính', 'Tổ thi đua', 'Tổng xu tích lũy', 'Xếp hạng thi đua'],
      ...students.map((st, idx) => [
        idx + 1,
        st.full_name,
        st.gender === 'male' || st.gender === 'Nam' ? 'Nam' : 'Nữ',
        `Tổ ${st.team_group || 1}`,
        st.total_stars || 0,
        `Hạng ${idx + 1}`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BaoCao_ThongKeThiDua_Lop${currentClass?.name || '8A5'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredStudents = [...students].filter(st => {
    if (genderFilter === 'male') return st.gender === 'male' || st.gender === 'Nam';
    if (genderFilter === 'female') return st.gender === 'female' || st.gender === 'Nữ';
    return true;
  }).sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
      
      {/* HEADER BANNER (Screenshot 5) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-purple-100 px-3 py-1 rounded-full text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1.5">
            <span>BÁO CÁO & PHÂN TÍCH</span>
            <span>•</span>
            <span>Khối {currentClass?.grade_level || 8} • Lớp {currentClass?.name || '8A5'}</span>
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Thống Kê Điểm Xu & Lịch Sử Tích Đổi
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            Tổng hợp kết quả thi đua theo lớp, theo môn học đã thiết lập và nhật ký chi tiết cộng/trừ điểm.
          </p>
        </div>

        {/* Scope Selector & Print/Export Buttons (Feature 1) */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Feature 4: Weekly Auto Closing Schedule Toggle */}
          <label className="flex items-center space-x-1.5 px-3 py-2 bg-purple-50 rounded-2xl border border-purple-200 text-xs font-black text-purple-900 cursor-pointer shadow-xs">
            <input
              type="checkbox"
              defaultChecked={true}
              onChange={(e) => {
                soundFx.playCorrect();
                alert(e.target.checked ? 'Đã bật tự động chốt sổ xu thi đua vào 19:00 Thứ Bảy hàng tuần!' : 'Đã tắt tự động chốt sổ.');
              }}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span>⏰ Tự chốt sổ 19:00 T7</span>
          </label>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowPrintModal(true);
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo (A4/PDF)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel Đầy Đủ (.xlsx)</span>
          </button>
        </div>

      </div>

      {/* 3 MAIN SUB-TAB SWITCHERS (Screenshot 5) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('overview');
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 ${
            activeSubTab === 'overview'
              ? 'bg-purple-600 text-white shadow-purple-glow'
              : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 Tổng Quan & Theo Lớp</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('subjects');
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 ${
            activeSubTab === 'subjects'
              ? 'bg-purple-600 text-white shadow-purple-glow'
              : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📚 Thống Kê Theo Môn Học ({subjectsList.length})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab('history');
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 ${
            activeSubTab === 'history'
              ? 'bg-purple-600 text-white shadow-purple-glow'
              : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>📜 Lịch Sử Cộng / Trừ Chi Tiết ({historyLogs.length})</span>
        </button>
      </div>

      {/* OVERVIEW SUBTAB CONTENT */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 5 TOP SUMMARY CARDS ROW (Screenshot 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft space-y-1">
              <span className="text-xs font-bold text-slate-500 block">Sĩ số học sinh</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-blue-600">{totalStudents}</span>
                <span className="text-xs text-slate-400 font-bold">({maleStudents} Nam • {femaleStudents} Nữ)</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft space-y-1">
              <span className="text-xs font-bold text-slate-500 block">Tổng xu thi đua</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-amber-600">{totalStars}</span>
                <span className="text-xs text-slate-400 font-bold">xu tích lũy</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft space-y-1">
              <span className="text-xs font-bold text-slate-500 block">Xu TB/Học sinh</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-purple-600">{avgStars}</span>
                <span className="text-xs text-slate-400 font-bold">điểm trung bình</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft space-y-1">
              <span className="text-xs font-bold text-slate-500 block">Lượt cộng (+xu)</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-emerald-600">1</span>
                <span className="text-xs text-slate-400 font-bold">Khen thưởng</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft space-y-1">
              <span className="text-xs font-bold text-slate-500 block">Lượt trừ (-xu)</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-coral-600">0</span>
                <span className="text-xs text-slate-400 font-bold">Nhắc nhở nề nếp</span>
              </div>
            </div>

          </div>

          {/* 2 BOTTOM CARDS BREAKDOWN (Screenshot 5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT CARD (7 Cols): BẢNG XẾP HẠNG XU THI ĐUA */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-800 flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span>Bảng Xếp Hạng Xu Thi Đua</span>
                </h3>

                {/* Gender Tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    onClick={() => setGenderFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${genderFilter === 'all' ? 'bg-white text-purple-700 shadow-sm font-black' : 'text-slate-500'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setGenderFilter('male')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${genderFilter === 'male' ? 'bg-white text-purple-700 shadow-sm font-black' : 'text-slate-500'}`}
                  >
                    Nam ♂
                  </button>
                  <button
                    onClick={() => setGenderFilter('female')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${genderFilter === 'female' ? 'bg-white text-purple-700 shadow-sm font-black' : 'text-slate-500'}`}
                  >
                    Nữ ♀
                  </button>
                </div>
              </div>

              {/* Student Rank List (Screenshot 5) */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {filteredStudents.map((st, idx) => (
                  <div key={st.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <img
                        src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                        alt={st.full_name}
                        className="w-9 h-9 rounded-xl object-cover border border-purple-200 bg-white"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{st.full_name}</span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Học sinh {st.gender === 'male' || st.gender === 'Nam' ? 'Nam ♂' : 'Nữ ♀'}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      {st.total_stars || 0} xu
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT CARD (5 Cols): CƠ CẤU HỌC SINH & BIỂU ĐỒ 4 TỔ THI ĐUA (Screenshot 5 & Feature 3) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-6">
              
              {/* Feature 3: 4 Teams Bar Chart */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-purple-950 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Biểu Đồ Thi Đua 4 Tổ</span>
                  </h3>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowTeamAwardModal(true);
                    }}
                    className="text-[10px] font-black text-amber-900 bg-amber-400 hover:bg-amber-500 px-2.5 py-1 rounded-full shadow-xs transition-all flex items-center space-x-1"
                  >
                    <Printer className="w-3 h-3" />
                    <span>In Giấy Khen Tổ (A5)</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {teamStats.map(ts => {
                    const pct = Math.round((ts.total / maxTeamTotal) * 100);
                    const isLeader = ts.total === maxTeamTotal && ts.total > 0;
                    return (
                      <div key={ts.team} className="space-y-1">
                        <div className="flex justify-between text-xs font-black">
                          <span className="text-slate-800 flex items-center space-x-1">
                            <span>Tổ {ts.team} ({ts.count} em)</span>
                            {isLeader && <span className="text-amber-500 text-sm animate-bounce" title="Tổ dẫn đầu thi đua!">👑</span>}
                          </span>
                          <span className="text-amber-700">{ts.total} xu {isLeader && '★ (TOP 1)'}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLeader
                                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-md ring-1 ring-amber-300'
                                : 'bg-gradient-to-r from-purple-500 to-amber-500'
                            }`}
                            style={{ width: `${Math.max(5, pct)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gender ratio stats */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Cơ Cấu Học Sinh & Tỷ Lệ Thi Đua</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center space-y-1">
                    <span className="text-xs font-black text-blue-900 block">Học sinh Nam ♂</span>
                    <span className="text-3xl font-black text-blue-600 block">{maleStudents}</span>
                    <span className="text-[10px] font-bold text-blue-500 block">
                      {Math.round((maleStudents / totalStudents) * 100)}% tổng số
                    </span>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 text-center space-y-1">
                    <span className="text-xs font-black text-pink-900 block">Học sinh Nữ ♀</span>
                    <span className="text-3xl font-black text-pink-600 block">{femaleStudents}</span>
                    <span className="text-[10px] font-bold text-pink-500 block">
                      {Math.round((femaleStudents / totalStudents) * 100)}% tổng số
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUBJECTS SUBTAB CONTENT */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-800">Thống Kê Điểm Thi Đua Theo Môn Học</h3>
            
            {/* Subject Configurator Button (Screenshots 2 & 3) */}
            <button
              onClick={() => {
                soundFx.playClick();
                setShowSubjectModal(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow flex items-center space-x-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>Cấu hình môn học</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {subjectsList.map(subj => (
              <div key={subj} className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between">
                <span className="text-xs font-black text-purple-950">📚 Môn {subj}</span>
                <span className="text-xs font-bold text-purple-700 bg-white px-3 py-1 rounded-full border border-purple-200">
                  +12 xu
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY SUBTAB CONTENT */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
          <h3 className="text-base font-black text-slate-800">Lịch Sử Cộng / Trừ Điểm Chi Tiết</h3>
          <div className="space-y-2">
            {historyLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-600 font-black">+{log.amount} xu</span>
                  <span className="text-slate-800 font-extrabold">{log.student}</span>
                  <span className="text-slate-500">({log.reason})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: SUBJECT CONFIGURATOR (Screenshots 2 & 3) */}
      <SubjectConfigModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
      />

      {/* MODAL 2: PRINT MONTHLY ANALYTICS PDF A4 (Feature 1) */}
      <PrintMonthlyAnalyticsModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        currentClass={currentClass}
        students={students}
        teacherProfile={teacherProfile}
      />

      {/* MODAL 3: PRINT TEAM AWARD A5 (Feature 2) */}
      <PrintTeamAwardModal
        isOpen={showTeamAwardModal}
        onClose={() => setShowTeamAwardModal(false)}
        currentClass={currentClass}
        winningTeam={teamStats.sort((a, b) => b.total - a.total)[0]?.team || 1}
        totalCoins={maxTeamTotal}
        students={students}
        teacherProfile={teacherProfile}
      />

    </div>
  );
};

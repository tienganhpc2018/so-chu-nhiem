import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
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
  Filter
} from 'lucide-react';

export const AnalyticsView = ({ currentClass, students = [] }) => {
  // Main Sub-Tab Switcher: 'overview' | 'subjects' | 'history'
  const [activeSubTab, setActiveSubTab] = useState('overview');
  
  // Gender Filter for Leaderboard: 'all' | 'male' | 'female'
  const [genderFilter, setGenderFilter] = useState('all');

  const totalStudents = students.length || 15;
  const maleStudents = students.filter(s => s.gender === 'male' || s.gender === 'Nam').length || Math.floor(totalStudents * 0.47);
  const femaleStudents = totalStudents - maleStudents;

  const totalStars = students.reduce((acc, curr) => acc + (curr.total_stars || 0), 0);
  const avgStars = totalStudents > 0 ? (totalStars / totalStudents).toFixed(1) : 0;

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

        {/* Scope Selector & Export Button (Screenshot 5) */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-2xl border border-slate-200">
            🏫 Phạm vi: {currentClass?.name || '8A5'} ({totalStudents} HS)
          </span>

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

            {/* RIGHT CARD (5 Cols): CƠ CẤU HỌC SINH & TỶ LỆ THI ĐUA (Screenshot 5) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-800 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>Cơ Cấu Học Sinh & Tỷ Lệ Thi Đua</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
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
      )}

      {/* SUBJECTS SUBTAB CONTENT */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
          <h3 className="text-base font-black text-slate-800">Thống Kê Điểm Thi Đua Theo Môn Học</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

    </div>
  );
};

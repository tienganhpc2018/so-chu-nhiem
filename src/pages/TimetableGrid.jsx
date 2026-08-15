import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import {
  Calendar,
  Sun,
  Moon,
  Clock,
  Plus,
  Settings,
  X,
  BookOpen,
  Trash2,
  Edit,
  Save,
  Check,
  Sparkles
} from 'lucide-react';

export const TimetableGrid = ({ currentClass, teacherProfile }) => {
  // Timetable State Config
  const [morningCount, setMorningCount] = useState(5);
  const [afternoonCount, setAfternoonCount] = useState(4);
  const [includeSaturday, setIncludeSaturday] = useState(false);

  // Time Slots
  const [morningTimes, setMorningTimes] = useState([
    '07:30 - 08:05',
    '08:15 - 08:50',
    '09:05 - 09:40',
    '09:50 - 10:25',
    '10:35 - 11:10',
    '11:15 - 11:50'
  ]);

  const [afternoonTimes, setAfternoonTimes] = useState([
    '13:30 - 14:05',
    '14:15 - 14:50',
    '15:05 - 15:40',
    '15:50 - 16:25',
    '16:30 - 17:05'
  ]);

  // Timetable Schedule Data: { [key = `${session}_${period}_${day}`]: { subject, teacher, room, color, icon } }
  const [schedule, setSchedule] = useState(() => {
    try {
      const stored = localStorage.getItem(`timetable_${currentClass?.id || 'demo'}`);
      return stored ? JSON.parse(stored) : getSampleTimetable();
    } catch {
      return getSampleTimetable();
    }
  });

  // Modals state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { session: 'morning'|'afternoon', period: 1, day: 2..6, time: '07:30-08:05' }

  // Add Subject Form state
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState(teacherProfile?.full_name || 'Nguyễn Văn Hải');
  const [subjectColor, setSubjectColor] = useState('purple');
  const [periodTime, setPeriodTime] = useState('');

  // Preset Popular Subjects (Screenshot 2)
  const popularSubjects = [
    { id: 'math', name: 'Toán học', icon: '📘', color: 'blue' },
    { id: 'viet', name: 'Tiếng Việt', icon: '📖', color: 'purple' },
    { id: 'eng', name: 'Tiếng Anh', icon: '🔤', color: 'pink' },
    { id: 'soc', name: 'Tự nhiên & Xã hội', icon: '🌱', color: 'emerald' },
    { id: 'sci', name: 'Khoa học', icon: '🔬', color: 'teal' },
    { id: 'his', name: 'Lịch sử & Địa lý', icon: '📜', color: 'amber' },
    { id: 'it', name: 'Tin học', icon: '💻', color: 'sky' },
    { id: 'tech', name: 'Công nghệ', icon: '⚙️', color: 'slate' },
    { id: 'art', name: 'Mĩ thuật', icon: '🎨', color: 'orange' },
    { id: 'mus', name: 'Âm nhạc', icon: '🎵', color: 'indigo' },
    { id: 'pe', name: 'Giáo dục thể chất', icon: '⚽', color: 'emerald' },
    { id: 'eth', name: 'Đạo đức / GDCD', icon: '⚖️', color: 'amber' },
    { id: 'exp', name: 'Hoạt động trải nghiệm', icon: '☀️', color: 'purple' },
    { id: 'cls', name: 'Sinh hoạt lớp', icon: '🏫', color: 'blue' },
    { id: 'flag', name: 'Chào cờ', icon: '🚩', color: 'red' }
  ];

  function getSampleTimetable() {
    return {
      'morning_1_2': { subject: 'Chào cờ', icon: '🚩', color: 'red', teacher: 'BGH' },
      'morning_2_2': { subject: 'Tiếng Anh', icon: '🔤', color: 'pink', teacher: 'Nguyễn Văn Hải' },
      'morning_3_2': { subject: 'Toán học', icon: '📘', color: 'blue', teacher: 'Trần Văn Nam' },
      'morning_1_3': { subject: 'Toán học', icon: '📘', color: 'blue', teacher: 'Trần Văn Nam' },
      'morning_2_3': { subject: 'Tiếng Việt', icon: '📖', color: 'purple', teacher: 'Lê Thu Hà' },
      'morning_1_4': { subject: 'Tiếng Anh', icon: '🔤', color: 'pink', teacher: 'Nguyễn Văn Hải' },
      'morning_2_4': { subject: 'Khoa học', icon: '🔬', color: 'teal', teacher: 'Phạm Đức Anh' },
      'morning_5_6': { subject: 'Sinh hoạt lớp', icon: '🏫', color: 'blue', teacher: 'Nguyễn Văn Hải' }
    };
  }

  // Save schedule to localStorage
  const saveScheduleData = (newSchedule) => {
    setSchedule(newSchedule);
    try {
      localStorage.setItem(`timetable_${currentClass?.id || 'demo'}`, JSON.stringify(newSchedule));
    } catch (err) {
      console.error('Lỗi lưu thời khóa biểu:', err);
    }
  };

  // Open Add/Edit Modal
  const handleOpenAddModal = (session, period, day, time) => {
    soundFx.playClick();
    const cellKey = `${session}_${period}_${day}`;
    const existing = schedule[cellKey];

    setSelectedCell({ session, period, day, time, cellKey });
    setSubjectName(existing ? existing.subject : '');
    setTeacherName(existing ? existing.teacher : teacherProfile?.full_name || 'Nguyễn Văn Hải');
    setSubjectColor(existing ? existing.color : 'purple');
    setPeriodTime(time);
    setShowAddModal(true);
  };

  // Quick Select Subject Pill
  const handleSelectPopularSubject = (sb) => {
    soundFx.playClick();
    setSubjectName(sb.name);
    setSubjectColor(sb.color);
  };

  // Submit Add/Update Subject
  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!selectedCell || !subjectName.trim()) return;

    soundFx.playCorrect();
    const foundPopular = popularSubjects.find(s => s.name === subjectName.trim());

    const updated = {
      ...schedule,
      [selectedCell.cellKey]: {
        subject: subjectName.trim(),
        teacher: teacherName.trim(),
        color: subjectColor,
        icon: foundPopular ? foundPopular.icon : '📚'
      }
    };

    saveScheduleData(updated);
    setShowAddModal(false);
  };

  // Delete Subject from Cell
  const handleDeleteCellSubject = () => {
    if (!selectedCell) return;
    soundFx.playDeduct();

    const updated = { ...schedule };
    delete updated[selectedCell.cellKey];

    saveScheduleData(updated);
    setShowAddModal(false);
  };

  const daysList = includeSaturday
    ? [{ id: 2, name: 'THỨ HAI' }, { id: 3, name: 'THỨ BA' }, { id: 4, name: 'THỨ TƯ' }, { id: 5, name: 'THỨ NĂM' }, { id: 6, name: 'THỨ SÁU' }, { id: 7, name: 'THỨ BẢY' }]
    : [{ id: 2, name: 'THỨ HAI' }, { id: 3, name: 'THỨ BA' }, { id: 4, name: 'THỨ TƯ' }, { id: 5, name: 'THỨ NĂM' }, { id: 6, name: 'THỨ SÁU' }];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* HEADER BANNER & CONFIG BUTTON (Screenshot 1) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Thời Khóa Biểu Lớp {currentClass?.name || '8A5'}
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Thiết lập lịch dạy Sáng / Chiều và bấm trực tiếp vào từng ô để xếp môn học
          </p>
        </div>

        {/* Overview Status Bar & Config Button (Screenshot 1) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <span className="px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-black flex items-center space-x-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Sáng {morningCount} tiết</span>
          </span>

          <span className="px-3.5 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-black flex items-center space-x-1">
            <Moon className="w-3.5 h-3.5 text-purple-600" />
            <span>Chiều {afternoonCount} tiết</span>
          </span>

          <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black">
            📅 Thứ 2 - {includeSaturday ? 'Thứ 7' : 'Thứ 6'}
          </span>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowConfigModal(true);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-purple-glow transition-all flex items-center space-x-1.5 ml-auto"
          >
            <Settings className="w-4 h-4" />
            <span>Cấu Hình Thời Khóa Biểu</span>
          </button>
        </div>

      </div>

      {/* MAIN TIMETABLE GRID (Screenshot 1) */}
      <div className="space-y-8">
        
        {/* BUỔI SÁNG SECTION */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-soft space-y-4">
          <div className="flex items-center space-x-2 text-amber-900 font-black text-sm pb-2 border-b border-amber-100">
            <Sun className="w-5 h-5 text-amber-500" />
            <span>☀️ BUỔI SÁNG ({morningCount} TIẾT)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-amber-50/70 text-amber-900 text-xs font-black">
                  <th className="p-3 border border-amber-100 rounded-l-2xl w-32">TIẾT / GIỜ</th>
                  {daysList.map(d => (
                    <th key={d.id} className="p-3 border border-amber-100 uppercase tracking-wider">{d.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {Array.from({ length: morningCount }, (_, idx) => idx + 1).map(p => {
                  const timeStr = morningTimes[p - 1] || '07:30 - 08:05';
                  return (
                    <tr key={`m-p-${p}`}>
                      <td className="p-3 border border-amber-100 bg-amber-50/40 text-xs font-extrabold text-slate-700">
                        <div className="font-black text-amber-900">Tiết {p} Sáng</div>
                        <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{timeStr}</span>
                        </div>
                      </td>

                      {daysList.map(d => {
                        const cellKey = `morning_${p}_${d.id}`;
                        const cellData = schedule[cellKey];

                        return (
                          <td key={cellKey} className="p-2 border border-amber-100 align-top">
                            {cellData ? (
                              <div
                                onClick={() => handleOpenAddModal('morning', p, d.id, timeStr)}
                                className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 cursor-pointer transition-all shadow-sm group relative"
                              >
                                <div className="text-sm font-black text-purple-950 flex items-center justify-center space-x-1">
                                  <span>{cellData.icon || '📚'}</span>
                                  <span>{cellData.subject}</span>
                                </div>
                                <div className="text-[10px] text-purple-700 font-bold mt-1">
                                  GV: {cellData.teacher || 'Nguyễn Văn Hải'}
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => handleOpenAddModal('morning', p, d.id, timeStr)}
                                className="p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/40 text-slate-400 hover:text-amber-700 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[65px]"
                              >
                                <Plus className="w-4 h-4 mb-0.5 text-amber-500" />
                                <span className="text-[11px] font-extrabold">Thêm tiết {p}</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* BUỔI CHIỀU SECTION */}
        <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-soft space-y-4">
          <div className="flex items-center space-x-2 text-purple-900 font-black text-sm pb-2 border-b border-purple-100">
            <Moon className="w-5 h-5 text-purple-600" />
            <span>🌆 BUỔI CHIỀU ({afternoonCount} TIẾT)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-purple-50/70 text-purple-900 text-xs font-black">
                  <th className="p-3 border border-purple-100 rounded-l-2xl w-32">TIẾT / GIỜ</th>
                  {daysList.map(d => (
                    <th key={d.id} className="p-3 border border-purple-100 uppercase tracking-wider">{d.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {Array.from({ length: afternoonCount }, (_, idx) => idx + 1).map(p => {
                  const timeStr = afternoonTimes[p - 1] || '13:30 - 14:05';
                  return (
                    <tr key={`a-p-${p}`}>
                      <td className="p-3 border border-purple-100 bg-purple-50/40 text-xs font-extrabold text-slate-700">
                        <div className="font-black text-purple-900">Tiết {p} Chiều</div>
                        <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-purple-500" />
                          <span>{timeStr}</span>
                        </div>
                      </td>

                      {daysList.map(d => {
                        const cellKey = `afternoon_${p}_${d.id}`;
                        const cellData = schedule[cellKey];

                        return (
                          <td key={cellKey} className="p-2 border border-purple-100 align-top">
                            {cellData ? (
                              <div
                                onClick={() => handleOpenAddModal('afternoon', p, d.id, timeStr)}
                                className="p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-all shadow-sm group"
                              >
                                <div className="text-sm font-black text-indigo-950 flex items-center justify-center space-x-1">
                                  <span>{cellData.icon || '📚'}</span>
                                  <span>{cellData.subject}</span>
                                </div>
                                <div className="text-[10px] text-indigo-700 font-bold mt-1">
                                  GV: {cellData.teacher || 'Nguyễn Văn Hải'}
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => handleOpenAddModal('afternoon', p, d.id, timeStr)}
                                className="p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/40 text-slate-400 hover:text-purple-700 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[65px]"
                              >
                                <Plus className="w-4 h-4 mb-0.5 text-purple-500" />
                                <span className="text-[11px] font-extrabold">Thêm tiết {p}</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL 1: ADD / EDIT SUBJECT (Screenshot 2) */}
      {showAddModal && selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-800">Thêm Tiết Học Mới</h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Thứ {selectedCell.day} • Buổi {selectedCell.session === 'morning' ? 'Sáng' : 'Chiều'} • Tiết {selectedCell.period}
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 my-4">
              
              {/* Banner Time Info */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs font-black text-amber-900">
                <span>☀️ Thứ {selectedCell.day} - Buổi {selectedCell.session === 'morning' ? 'Sáng' : 'Chiều'} (Tiết {selectedCell.period})</span>
                <span className="font-mono text-amber-700">{selectedCell.time}</span>
              </div>

              {/* Quick Popular Subject Selector (Screenshot 2) */}
              <div>
                <label className="block text-xs font-extrabold text-purple-900 mb-2 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>CHỌN NHANH MÔN HỌC PHỔ BIẾN:</span>
                </label>

                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {popularSubjects.map(sb => (
                    <button
                      key={sb.id}
                      type="button"
                      onClick={() => handleSelectPopularSubject(sb)}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border flex items-center space-x-1 ${
                        subjectName === sb.name
                          ? 'bg-purple-600 text-white border-purple-600 shadow-purple-glow'
                          : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{sb.icon}</span>
                      <span>{sb.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên môn học / Hoạt động *</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Ví dụ: Tiếng Anh, Toán học, Mĩ thuật..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giáo viên giảng dạy</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {schedule[selectedCell.cellKey] ? (
                  <button
                    type="button"
                    onClick={handleDeleteCellSubject}
                    className="px-4 py-2 bg-coral-50 hover:bg-coral-100 text-coral-600 rounded-xl text-xs font-extrabold flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa tiết</span>
                  </button>
                ) : <div></div>}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-purple-glow flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>LƯU TIẾT HỌC</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: CONFIG TIMETABLE (Screenshot 3) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-purple-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-800">Cấu Hình Thời Khóa Biểu</h3>
                <p className="text-xs text-slate-400 font-semibold">Tùy chỉnh số tiết sáng/chiều, thời gian từng tiết và ngày học trong tuần</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              
              {/* Buổi Sáng Config (Screenshot 3 Left Card) */}
              <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-amber-950 flex items-center space-x-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Buổi Sáng</span>
                  </span>
                  <span className="bg-amber-200 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full">
                    {morningCount} tiết Sáng
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Số tiết dạy buổi Sáng:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map(n => (
                      <button
                        key={`m-cnt-${n}`}
                        onClick={() => {
                          soundFx.playClick();
                          setMorningCount(n);
                        }}
                        className={`py-2 rounded-xl text-xs font-black ${
                          morningCount === n ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-700 border border-amber-200'
                        }`}
                      >
                        {n} tiết
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buổi Chiều Config (Screenshot 3 Right Card) */}
              <div className="bg-purple-50/70 p-5 rounded-3xl border border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-purple-950 flex items-center space-x-1.5">
                    <Moon className="w-4 h-4 text-purple-600" />
                    <span>Buổi Chiều</span>
                  </span>
                  <span className="bg-purple-200 text-purple-900 text-xs font-black px-2.5 py-0.5 rounded-full">
                    {afternoonCount} tiết Chiều
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Số tiết dạy buổi Chiều:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map(n => (
                      <button
                        key={`a-cnt-${n}`}
                        onClick={() => {
                          soundFx.playClick();
                          setAfternoonCount(n);
                        }}
                        className={`py-2 rounded-xl text-xs font-black ${
                          afternoonCount === n ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-700 border border-purple-200'
                        }`}
                      >
                        {n} tiết
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSaturday}
                  onChange={(e) => setIncludeSaturday(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span>Học cả ngày Thứ Bảy</span>
              </label>

              <button
                onClick={() => {
                  soundFx.playCorrect();
                  setShowConfigModal(false);
                }}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-purple-glow"
              >
                ÁP DỤNG CẤU HÌNH
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

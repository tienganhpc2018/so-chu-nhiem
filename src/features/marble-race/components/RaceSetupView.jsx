import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  FileSpreadsheet,
  Upload,
  Scissors,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const RaceSetupView = ({
  currentClass,
  students = [],
  calledStudentIds = [],
  onStartRace,
  onOpenCropModal,
  onClose,
  onUpdateStudentsList
}) => {
  // Mode: 'setup' (Ảnh 3) | 'roster' (Ảnh 1)
  const [viewMode, setViewMode] = useState('setup');

  // Race Config State (Chuẩn Ảnh 3)
  const [trackLength, setTrackLength] = useState('medium'); // 'short' (20s) | 'medium' (30s) | 'long' (40s)
  const [useStudentPhotos, setUseStudentPhotos] = useState(true);
  const [restLastCalled, setRestLastCalled] = useState(true);
  const [enableQuestions, setEnableQuestions] = useState(true);
  const [absentIds, setAbsentIds] = useState(new Set());

  // Roster Manager State (Chuẩn Ảnh 1)
  const [localStudents, setLocalStudents] = useState(students);
  const [classNameInput, setClassNameInput] = useState(currentClass?.name || 'Lớp 8C');
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [excelText, setExcelText] = useState('');

  const photoCount = localStudents.filter(s => s.avatar || s.avatar_url).length;

  // Toggle vắng mặt của học sinh
  const toggleAbsent = (id) => {
    soundFx.playClick();
    setAbsentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAllPresent = () => {
    soundFx.playClick();
    setAbsentIds(new Set());
  };

  // Khởi động cuộc đua
  const handleLaunchRace = () => {
    soundFx.playCorrect();
    // Lọc học sinh tham gia
    let activeParticipants = localStudents.filter(s => !absentIds.has(s.id));

    // Nếu bật chế độ nghỉ một lượt cho bạn vừa gọi
    if (restLastCalled && calledStudentIds.length > 0 && activeParticipants.length > 1) {
      const lastCalledId = calledStudentIds[calledStudentIds.length - 1];
      activeParticipants = activeParticipants.filter(s => s.id !== lastCalledId);
    }

    onStartRace({
      trackLength,
      useStudentPhotos,
      enableQuestions,
      participants: activeParticipants
    });
  };

  // Xử lý thêm học sinh thủ công
  const handleAddStudent = () => {
    soundFx.playClick();
    const newSt = {
      id: `st-${Date.now()}`,
      full_name: `Học sinh mới ${localStudents.length + 1}`,
      code: `HS${String(localStudents.length + 1).padStart(2, '0')}`,
      avatar: null
    };
    const updated = [...localStudents, newSt];
    setLocalStudents(updated);
    onUpdateStudentsList?.(updated);
  };

  // Xóa học sinh
  const handleDeleteStudent = (id) => {
    soundFx.playClick();
    const updated = localStudents.filter(s => s.id !== id);
    setLocalStudents(updated);
    onUpdateStudentsList?.(updated);
  };

  // Nhập danh sách từ Excel
  const handleImportExcel = () => {
    if (!excelText.trim()) return;
    soundFx.playCorrect();
    const lines = excelText.split('\n').map(l => l.trim()).filter(Boolean);
    const newItems = lines.map((name, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      full_name: name,
      code: `HS${String(localStudents.length + idx + 1).padStart(2, '0')}`,
      avatar: null
    }));
    const updated = [...localStudents, ...newItems];
    setLocalStudents(updated);
    onUpdateStudentsList?.(updated);
    setShowExcelImport(false);
    setExcelText('');
  };

  const activeCount = localStudents.length - absentIds.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-purple-100 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* ========================================================= */}
        {/* VIEW 1: THIẾT LẬP CUỘC ĐUA (CHUẨN ẢNH 3 CỦA THẦY) */}
        {/* ========================================================= */}
        {viewMode === 'setup' && (
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Header dải gradient hồng tím (Chuẩn Ảnh 3) */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                  🔮
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                    Đua bi — {classNameInput} {new Date().getFullYear()} - {new Date().getFullYear() + 1}
                  </h3>
                  <p className="text-xs text-purple-100 font-bold mt-0.5">
                    Bi lăn qua chướng ngại vật — viên nào về đích trước, em đó được gọi
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setViewMode('roster')}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>DS Học Sinh</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Nội dung cấu hình cuộc đua */}
            <div className="p-6 sm:p-7 space-y-6 flex-1">
              
              {/* 1. Độ dài đường đua (Chuẩn Ảnh 3) */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-pink-600 uppercase tracking-wide block">
                  Độ dài đường đua
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'short', title: 'Ngắn', time: '~20 giây' },
                    { id: 'medium', title: 'Vừa', time: '~30 giây' },
                    { id: 'long', title: 'Dài', time: '~40 giây' }
                  ].map((len) => (
                    <button
                      key={len.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setTrackLength(len.id);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1 transform hover:scale-102 active:scale-95 ${
                        trackLength === len.id
                          ? 'border-pink-500 bg-pink-50/50 shadow-md shadow-pink-100 text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="text-sm font-black">{len.title}</span>
                      <span className="text-[11px] text-slate-400 font-bold">{len.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Hai Switch Tùy Chọn (Chuẩn Ảnh 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Switch 1: Dùng ảnh học sinh làm bi */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <div
                        onClick={() => setUseStudentPhotos(!useStudentPhotos)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                          useStudentPhotos ? 'bg-purple-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            useStudentPhotos ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-800">
                        Dùng ảnh học sinh làm bi
                      </span>
                    </label>

                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[11px] font-black">
                      {photoCount}/{localStudents.length} em có ảnh
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold pl-13.5">
                    Em nào chưa có ảnh sẽ dùng bi màu kèm chữ viết tắt tên.
                  </p>
                </div>

                {/* Switch 2: Cho bạn vừa được gọi nghỉ một lượt */}
                <div className="space-y-1">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <div
                      onClick={() => setRestLastCalled(!restLastCalled)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        restLastCalled ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          restLastCalled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-800">
                      Cho bạn vừa được gọi nghỉ một lượt
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400 font-bold pl-13.5">
                    Giúp phân bổ lượt gọi công bằng cho các em còn lại.
                  </p>
                </div>
              </div>

              {/* Tùy chọn: Kết hợp câu hỏi Tiếng Anh */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">📚</span>
                  <div>
                    <span className="text-xs font-black text-indigo-950 block">
                      Kết hợp mở câu hỏi trắc nghiệm Tiếng Anh:
                    </span>
                    <span className="text-[11px] text-indigo-700 font-bold">
                      Khi viên bi về nhất, mở ngay 1 câu hỏi kiểm tra nhanh kiến thức.
                    </span>
                  </div>
                </div>
                <div
                  onClick={() => setEnableQuestions(!enableQuestions)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    enableQuestions ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      enableQuestions ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* 3. Điểm danh: Danh sách pills màu hồng phấn (Chuẩn Ảnh 3) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-pink-600 uppercase tracking-wide">
                      Điểm danh
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-black">
                      Có mặt {activeCount}/{localStudents.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={markAllPresent}
                    className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wide"
                  >
                    CÓ MẶT TẤT CẢ
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 font-bold">
                  Bấm vào tên em vắng để loại khỏi cuộc đua.
                </p>

                {/* Pills danh sách học sinh */}
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {localStudents.map((st) => {
                    const isAbsent = absentIds.has(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleAbsent(st.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 flex items-center space-x-1.5 ${
                          isAbsent
                            ? 'bg-slate-200 text-slate-400 line-through opacity-60'
                            : 'bg-pink-100/80 hover:bg-pink-200 text-pink-900 shadow-2xs'
                        }`}
                        title={isAbsent ? 'Đang đánh dấu vắng (Bấm để tham gia lại)' : 'Đang có mặt (Bấm để loại khỏi cuộc đua)'}
                      >
                        {st.avatar && (
                          <img src={st.avatar} alt="avatar" className="w-3.5 h-3.5 rounded-full object-cover" />
                        )}
                        <span>{st.full_name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer: Hủy & Nút Tím Bắt Đầu Đua (Chuẩn Ảnh 3) */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-white">
              <span className="text-xs font-mono font-bold text-slate-400">
                01:41
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all uppercase"
                >
                  HUỶ
                </button>
                <button
                  type="button"
                  onClick={handleLaunchRace}
                  disabled={activeCount === 0}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-200 uppercase tracking-wider flex items-center space-x-2 transition-all transform hover:scale-102 active:scale-95 disabled:opacity-40"
                >
                  <span>🔮</span>
                  <span>BẮT ĐẦU ĐUA</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: QUẢN LÝ DANH SÁCH & ẢNH HỌC SINH (CHUẨN ẢNH 1) */}
        {/* ========================================================= */}
        {viewMode === 'roster' && (
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Header thanh công cụ (Chuẩn Ảnh 1) */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setViewMode('setup')}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black flex items-center space-x-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>

                <div className="flex items-center space-x-1.5 text-xs font-black text-slate-700">
                  <span>🏫 Chọn lớp khác:</span>
                  <span className="text-purple-700 font-extrabold text-sm">{classNameInput}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playCorrect();
                    onUpdateStudentsList?.(localStudents);
                    setViewMode('setup');
                  }}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-black flex items-center space-x-1"
                >
                  <span>💾 Lưu</span>
                </button>
                <span className="px-3 py-1.5 bg-slate-900 text-amber-300 rounded-xl text-xs font-black shadow-xs">
                  FullGame Vĩnh viễn
                </span>
              </div>
            </div>

            {/* Thông tin lớp & Nút Ảnh tập thể (Chuẩn Ảnh 1) */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-white space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-500">Tên lớp:</label>
                  <input
                    type="text"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none w-32"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500">Ảnh tập thể lớp:</span>
                  <button
                    type="button"
                    onClick={onOpenCropModal}
                    className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-black flex items-center space-x-1 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Thêm ảnh lớp</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenCropModal}
                    className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-black flex items-center space-x-1 transition-all"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Lấy ảnh từng HS từ ảnh tập thể</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Ảnh học sinh chỉ cần thiết với một số tính năng đặc trưng, thầy/cô không bắt buộc phải có ảnh.
              </p>
            </div>

            {/* Danh sách học sinh (Chuẩn Ảnh 1) */}
            <div className="p-5 sm:p-6 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-black text-slate-900">
                    Danh sách học sinh
                  </h4>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-xs font-black">
                    {localStudents.length}/100
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowExcelImport(!showExcelImport)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center space-x-1 transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dán từ Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddStudent}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center space-x-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm học sinh</span>
                  </button>
                </div>
              </div>

              {/* Form dán từ Excel */}
              {showExcelImport && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                    <span>Dán danh sách tên học sinh (mỗi tên 1 dòng):</span>
                    <button onClick={() => setShowExcelImport(false)}>✕</button>
                  </div>
                  <textarea
                    rows={4}
                    value={excelText}
                    onChange={(e) => setExcelText(e.target.value)}
                    placeholder="Tạ Thị Ngọc Ánh&#10;Vũ Gia Bảo&#10;Lương Khánh Bích"
                    className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleImportExcel}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm"
                  >
                    Xác nhận thêm vào lớp
                  </button>
                </div>
              )}

              {/* Lưới 2 cột học sinh (Chuẩn Ảnh 1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {localStudents.map((st, i) => (
                  <div
                    key={st.id}
                    className="p-3 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl flex items-center justify-between gap-2 shadow-2xs transition-all"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="text-xs font-black text-purple-600 w-5 text-right">
                        {i + 1}.
                      </span>
                      {st.avatar ? (
                        <img src={st.avatar} alt="av" className="w-7 h-7 rounded-full object-cover border border-purple-200 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black shrink-0">
                          👤
                        </div>
                      )}
                      <span className="text-xs font-extrabold text-slate-800 truncate">
                        {st.full_name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-slate-400 shrink-0">
                      <button
                        type="button"
                        onClick={onOpenCropModal}
                        className="p-1.5 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                        title="Gán/Cắt ảnh đại diện"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(st.id)}
                        className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                        title="Xóa học sinh này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

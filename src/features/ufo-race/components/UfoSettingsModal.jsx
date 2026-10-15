import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, Upload, Music, Camera } from 'lucide-react';
import { DEFAULT_UFO_STUDENTS } from '../data/defaultUfoData';
import { soundFx } from '../../../utils/soundEffects';

export const UfoSettingsModal = ({
  isOpen,
  onClose,
  classes = [],
  currentClassId = 'class_12a1',
  onSelectClass,
  onSaveClass,
  onDeleteClass,
  onCreateNewClass,
  settings = {},
  onSaveSettings,
  onOpenPhotoCrop
}) => {
  const [selectedClassId, setSelectedClassId] = useState(currentClassId);
  const [studentText, setStudentText] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [selectedMusic, setSelectedMusic] = useState(settings.selectedMusic || 'ufo_synth');
  const [customMusicName, setCustomMusicName] = useState(settings.customMusicName || null);
  const [customMusicData, setCustomMusicData] = useState(settings.customMusicData || null);

  const fileInputRef = useRef(null);

  // Đồng bộ nội dung khi chọn lớp
  useEffect(() => {
    setSelectedClassId(currentClassId);
    const activeCls = classes.find(c => c.id === currentClassId);
    if (activeCls && activeCls.students) {
      setStudentText(activeCls.students.map(s => s.name).join('\n'));
    }
  }, [currentClassId, classes, isOpen]);

  // Khi người dùng đổi chọn lớp trong dropdown
  const handleClassChange = (e) => {
    const newId = e.target.value;
    setSelectedClassId(newId);
    onSelectClass?.(newId);
    const cls = classes.find(c => c.id === newId);
    if (cls && cls.students) {
      setStudentText(cls.students.map(s => s.name).join('\n'));
    }
  };

  // Nạp 40 tên mẫu
  const handleLoadSampleNames = () => {
    soundFx.playCorrect();
    setStudentText(DEFAULT_UFO_STUDENTS.join('\n'));
  };

  // Tải file nhạc từ máy tính (.mp3, .wav, .ogg)
  const handleMusicUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
      alert('Vui lòng chọn file âm thanh định dạng .mp3, .wav hoặc .ogg');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setCustomMusicName(file.name);
      setCustomMusicData(dataUrl);
      setSelectedMusic('custom');
      soundFx.playCorrect();
    };
    reader.readAsDataURL(file);
  };

  // Tạo lớp mới
  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      alert('Vui lòng nhập tên lớp mới (Ví dụ: Lớp 12A2)');
      return;
    }
    const lines = studentText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newClass = {
      id: `class_${Date.now()}`,
      name: newClassName.trim(),
      students: lines.map((name, idx) => ({
        id: `ufo_std_${Date.now()}_${idx}`,
        name,
        avatar: null
      }))
    };

    onCreateNewClass?.(newClass);
    setSelectedClassId(newClass.id);
    setNewClassName('');
    soundFx.playCorrect();
  };

  // Xóa lớp đang chọn
  const handleDeleteClass = () => {
    if (classes.length <= 1) {
      alert('Không thể xóa vì cần giữ lại ít nhất 1 lớp học!');
      return;
    }
    const activeCls = classes.find(c => c.id === selectedClassId);
    if (window.confirm(`Thầy có chắc chắn muốn xóa "${activeCls?.name || 'lớp này'}" không?`)) {
      onDeleteClass?.(selectedClassId);
      soundFx.playClick();
    }
  };

  // Lưu thay đổi danh sách học sinh & cài đặt
  const handleSaveAll = () => {
    const lines = studentText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      alert('Danh sách học sinh không được để trống!');
      return;
    }

    // Lưu danh sách học sinh của lớp hiện tại
    const updatedStudents = lines.map((name, idx) => {
      const activeCls = classes.find(c => c.id === selectedClassId);
      const existing = activeCls?.students?.find(s => s.name === name);
      return {
        id: existing?.id || `ufo_std_${Date.now()}_${idx}`,
        name,
        avatar: existing?.avatar || null
      };
    });

    onSaveClass?.(selectedClassId, updatedStudents);

    // Lưu cấu hình nhạc nền
    onSaveSettings?.({
      ...settings,
      selectedMusic,
      customMusicName,
      customMusicData
    });

    soundFx.playCorrect();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl w-full max-w-2xl text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header (Chuẩn 100% ảnh Thầy gửi) */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🧠</span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
              Cài đặt & Danh sách học sinh
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* 1. Nhạc nền tùy chọn */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center space-x-2">
              <span>🎵</span>
              <span>Nhạc nền tùy chọn:</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedMusic}
                onChange={(e) => setSelectedMusic(e.target.value)}
                className="flex-1 bg-[#16203c] border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-cyan-500"
              >
                <option value="ufo_synth">Nhạc mặc định (UFO Synth)</option>
                {customMusicName && (
                  <option value="custom">Nhạc tùy chỉnh: {customMusicName}</option>
                )}
              </select>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tải nhạc lên</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg"
                className="hidden"
                onChange={handleMusicUpload}
              />
            </div>
            <p className="text-[11px] text-slate-400 italic">
              (Nhạc tải lên sẽ được lưu vào trình duyệt cho lần sau)
            </p>
          </div>

          {/* 2. Chọn lớp học đã lưu */}
          <div className="space-y-1.5 pt-1">
            <label className="text-slate-300 font-bold flex items-center space-x-2">
              <span>🗂️</span>
              <span>Chọn lớp học đã lưu:</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedClassId}
                onChange={handleClassChange}
                className="flex-1 bg-[#16203c] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-cyan-500"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.students?.length || 0} học sinh)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleDeleteClass}
                className="shrink-0 flex items-center space-x-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md active:scale-95"
              >
                <span>Xóa lớp</span>
              </button>
            </div>
          </div>

          {/* 3. Dán danh sách học sinh (mỗi dòng 1 tên) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold">
                Dán danh sách học sinh (mỗi dòng 1 tên):
              </label>
              {onOpenPhotoCrop && (
                <button
                  type="button"
                  onClick={onOpenPhotoCrop}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/50 hover:bg-purple-600/50 font-bold text-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Cắt ảnh từ ảnh tập thể</span>
                </button>
              )}
            </div>

            <textarea
              rows={8}
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Hoàng Long..."
              className="w-full bg-[#070d1e] border border-slate-700/80 rounded-xl p-3 font-mono text-sm text-slate-200 focus:outline-hidden focus:border-cyan-500 leading-relaxed resize-none shadow-inner"
            />
          </div>

          {/* 4. Tạo lớp mới */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Tên lớp (VD: Lớp 12A2)..."
              className="flex-1 bg-[#16203c] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-medium focus:outline-hidden focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleCreateClass}
              className="shrink-0 flex items-center space-x-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Lưu thành lớp mới</span>
            </button>
          </div>

        </div>

        {/* Modal Footer (Chuẩn 100% ảnh Thầy gửi) */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#090f22] flex items-center justify-between">
          {/* Nút Nạp 40 tên mẫu bên trái */}
          <button
            type="button"
            onClick={handleLoadSampleNames}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold transition-all border border-slate-700 shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Nạp 40 tên mẫu</span>
          </button>

          {/* Nhóm nút Đóng và Lưu thay đổi bên phải */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all border border-slate-700"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

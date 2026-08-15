import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { X, UserPlus, FileSpreadsheet, Download, Upload, CheckCircle2, Users, User, Sparkles } from 'lucide-react';

export const AddStudentModal = ({ isOpen, onClose, currentClass, onAddStudents }) => {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'bulk'

  // Manual Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('female');
  const [teamGroup, setTeamGroup] = useState(1);
  const [seatRow, setSeatRow] = useState(1);
  const [seatCol, setSeatCol] = useState(1);

  // Bulk Form State
  const [bulkText, setBulkText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    soundFx.playCorrect();

    const newStudent = {
      id: `st-${Date.now()}`,
      full_name: fullName.trim(),
      gender,
      team_group: Number(teamGroup),
      seat_row: Number(seatRow),
      seat_col: Number(seatCol),
      total_stars: 0,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName.trim() + Date.now())}`
    };

    onAddStudents([newStudent]);
    setFullName('');
    onClose();
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map(line => line.replace(/^\d+[\.\,-]\s*/, '').trim()) // remove leading numbers like 1. 2-
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      alert('Vui lòng dán danh sách tên học sinh hoặc chọn file!');
      return;
    }

    soundFx.playCorrect();

    const newStudents = lines.map((name, idx) => {
      // Auto assign seats 4x6 grid
      const r = Math.floor(idx / 6) + 1;
      const c = (idx % 6) + 1;
      const group = (idx % 4) + 1;

      return {
        id: `st-bulk-${Date.now()}-${idx}`,
        full_name: name,
        gender: idx % 2 === 0 ? 'female' : 'male',
        team_group: group,
        seat_row: r,
        seat_col: c,
        total_stars: 0,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name + idx)}`
      };
    });

    onAddStudents(newStudents);
    setBulkText('');
    setFileName('');
    onClose();
  };

  const handleDownloadTemplate = () => {
    soundFx.playClick();
    let csvContent = "\uFEFF";
    csvContent += "STT,Họ và tên Học sinh,Tổ thi đua\n";
    csvContent += "1,Nguyễn Văn An,Tổ 1\n";
    csvContent += "2,Trần Thị Mai,Tổ 1\n";
    csvContent += "3,Lê Hoàng Nam,Tổ 2\n";
    csvContent += "4,Phạm Thu Trang,Tổ 2\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Mau_Danh_Sach_Hoc_Sinh.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        // Parse CSV or lines
        const lines = text.split('\n').map(l => l.split(',')[1] || l.split('\t')[0] || l).filter(Boolean);
        const names = lines.filter(l => !l.includes('Họ và tên') && !l.includes('STT')).join('\n');
        setBulkText(names);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-black text-slate-800">Thêm Học Sinh Vào Lớp</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl my-4">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('manual');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'manual' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Nhập Thủ Công</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('bulk');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'bulk' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Tải File / Nhập Hàng Loạt</span>
          </button>
        </div>

        {/* TAB 1: MANUAL INPUT */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên Học sinh *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Trần Thị Mai Anh"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phân Tổ Thi Đưa:</label>
                <select
                  value={teamGroup}
                  onChange={(e) => setTeamGroup(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value={1}>Tổ 1</option>
                  <option value={2}>Tổ 2</option>
                  <option value={3}>Tổ 3</option>
                  <option value={4}>Tổ 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="female">Nữ</option>
                  <option value="male">Nam</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hàng bàn học (1 - 4):</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={seatRow}
                  onChange={(e) => setSeatRow(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cột bàn học (1 - 6):</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={seatCol}
                  onChange={(e) => setSeatCol(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>THÊM HỌC SINH</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BULK IMPORT */}
        {activeTab === 'bulk' && (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            
            {/* Upload File Button & Template Download */}
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Tải File Excel / CSV (.xlsx, .csv):</label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file Excel mẫu</span>
              </button>
            </div>

            <div className="relative border-2 border-dashed border-purple-200 rounded-2xl p-4 bg-purple-50/40 text-center">
              <input
                type="file"
                accept=".csv, .xlsx, .xls, .txt"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-purple-800 block">
                {fileName ? `Đã chọn: ${fileName}` : 'Bấm vào đây để chọn file Excel / CSV từ máy tính'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Hỗ trợ các định dạng .xlsx, .csv, .txt</span>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Hoặc Dán Danh Sách Tên Học Sinh (mỗi tên 1 dòng):
                </label>
                {bulkText && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                    {bulkText.split('\n').filter(l => l.trim()).length} Học sinh
                  </span>
                )}
              </div>
              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="1. Nguyễn Minh Anh&#10;2. Trần Bảo Nam&#10;3. Lê Hoàng Khánh&#10;4. Phạm Thu Trang..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-purple-glow flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>NHẬP HÀNG LOẠT</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, Check, School, BookOpen, AlertCircle, RefreshCw, Settings, Dices } from 'lucide-react';
import { generateEnglishQuestionsAi } from '../services/duckAiService';

export const DuckTeacherSettingsModal = ({
  isOpen,
  onClose,
  ducks = [],
  onSaveDucks,
  questions = [],
  onSaveQuestions,
  currentClass,
  lmsStudents = [],
  // Các cài đặt mới
  selectedMode = 'random_call',
  onSelectMode,
  roundDuration = 20,
  onSelectRoundDuration,
  noRepeat = true,
  onToggleNoRepeat,
  showDuckNames = false,
  onToggleShowDuckNames,
  enableTts = true,
  onToggleTts
}) => {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'ducks' | 'questions'
  const [duckList, setDuckList] = useState(ducks);
  const [questionList, setQuestionList] = useState(questions);

  // Thêm vịt mới
  const [newDuckName, setNewDuckName] = useState('');

  // AI tạo câu hỏi
  const [aiTopic, setAiTopic] = useState('Unit 2 - City Life - Grade 9');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

  if (!isOpen) return null;

  // Lấy học sinh từ lớp hiện tại trong LMS
  const handleImportFromLms = () => {
    if (!lmsStudents || lmsStudents.length === 0) {
      alert('Lớp hiện tại chưa có danh sách học sinh. Vui lòng thêm học sinh vào lớp trước!');
      return;
    }

    const imported = lmsStudents.map((s, idx) => ({
      id: s.id || `duck_${idx}`,
      name: s.name || s.full_name || `Học sinh ${idx + 1}`,
      avatar: s.avatar || s.avatar_url || null,
      speed: 1.0 + (idx % 3) * 0.2
    }));

    setDuckList(imported);
    onSaveDucks?.(imported);
    alert(`Đã nhập thành công ${imported.length} học sinh từ ${currentClass?.name || 'lớp'} vào đàn vịt!`);
  };

  // Thêm 1 vịt thủ công
  const handleAddDuck = () => {
    if (!newDuckName.trim()) return;
    const updated = [
      ...duckList,
      {
        id: `duck_${Date.now()}`,
        name: newDuckName.trim(),
        avatar: null,
        speed: 1.0
      }
    ];
    setDuckList(updated);
    onSaveDucks?.(updated);
    setNewDuckName('');
  };

  // Xóa 1 vịt
  const handleDeleteDuck = (id) => {
    const updated = duckList.filter(d => d.id !== id);
    setDuckList(updated);
    onSaveDucks?.(updated);
  };

  // AI Tạo câu hỏi
  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    setAiNotice(null);
    try {
      const res = await generateEnglishQuestionsAi({ topic: aiTopic, count: 5 });
      if (res && res.success && res.questions) {
        const merged = [...res.questions, ...questionList];
        setQuestionList(merged);
        onSaveQuestions?.(merged);
        setAiNotice(`🎉 AI đã tạo thành công ${res.questions.length} câu hỏi mới theo chủ đề "${aiTopic}"!`);
      }
    } catch (e) {
      setAiNotice('❌ Lỗi tạo câu hỏi AI, vui lòng thử lại.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-400 text-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Cài Đặt Trò Chơi Gọi Tên Bịt Mắt Bắt Vịt
            </h2>
            <p className="text-xs text-slate-500">
              {currentClass ? `Đang cấu hình cho: ${currentClass.name}` : 'Cấu hình toàn hệ thống'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>Quy Tắc Gọi Tên</span>
          </button>

          <button
            onClick={() => setActiveTab('ducks')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'ducks'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🦆 Danh Sách Vịt / Học Sinh ({duckList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'questions'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Câu Hỏi ({questionList.length})</span>
          </button>
        </div>

        {/* NỘI DUNG TỪNG TAB */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: CÀI ĐẶT QUY TẮC CHƠI */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Chế độ chơi */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs font-black text-amber-900 uppercase block mb-2">
                  CHẾ ĐỘ GAMEPLAY CHÍNH:
                </span>
                <div className="space-y-2">
                  {[
                    { id: 'random_call', name: '🎲 Gọi Tên Ngẫu Nhiên (Khuyên dùng - Chuẩn Version Gốc)', desc: 'Random chọn tên trước → Đàn vịt chạy toán loạn → Bắt vịt → Hiện tên học sinh' },
                    { id: 'target', name: '🎯 Gọi Tên → Bắt Đúng Người', desc: 'Hệ thống gọi tên trước, người chơi quan sát đàn vịt và bắt đúng chú vịt mang tên đó' },
                    { id: 'blind_catch', name: '🦆 Bắt Vịt → Công Bố Tên', desc: 'Đàn vịt chạy ẩn danh, tóm được con nào mới lật mở danh tính học sinh đó' }
                  ].map(m => (
                    <label
                      key={m.id}
                      onClick={() => onSelectMode?.(m.id)}
                      className={`flex items-start space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedMode === m.id
                          ? 'bg-white border-amber-500 shadow-sm'
                          : 'bg-white/60 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mode"
                        checked={selectedMode === m.id}
                        onChange={() => onSelectMode?.(m.id)}
                        className="mt-1 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <strong className="text-xs font-black text-slate-900 block">{m.name}</strong>
                        <span className="text-[11px] text-slate-500">{m.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tùy chọn lọc trùng học sinh */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <strong className="text-xs font-black text-slate-900 block">
                    Không lặp lại học sinh trong cùng buổi
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Mỗi bạn chỉ được gọi 1 lần cho đến khi gọi hết cả lớp, sau đó mới reset.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={noRepeat}
                  onChange={onToggleNoRepeat}
                  className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Tùy chọn đọc tên TTS */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <strong className="text-xs font-black text-slate-900 block">
                    Tự động đọc to tên học sinh (Text-to-Speech)
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Phát giọng đọc chúc mừng khi chọn tên và khi tóm được vịt.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableTts}
                  onChange={onToggleTts}
                  className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Hiển thị tên trên đầu vịt */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <strong className="text-xs font-black text-slate-900 block">
                    Hiển thị tên học sinh trên đầu vịt
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Tắt để ẩn hoàn toàn danh tính đàn vịt, tạo bất ngờ 100% khi bắt được!
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={showDuckNames}
                  onChange={onToggleShowDuckNames}
                  className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Thời gian vòng chơi */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-black text-slate-700 uppercase block mb-2">
                  Thời Gian Rượt Đuổi Mỗi Lượt:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map(sec => (
                    <button
                      key={sec}
                      onClick={() => onSelectRoundDuration?.(sec)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        roundDuration === sec
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {sec} Giây
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ VỊT / HỌC SINH */}
          {activeTab === 'ducks' && (
            <div className="space-y-4">
              {/* Nút nhập nhanh từ LMS */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <div>
                  <strong className="text-xs font-black text-purple-900 block">
                    Đồng bộ danh sách học sinh từ LMS
                  </strong>
                  <span className="text-[11px] text-purple-600">
                    {currentClass
                      ? `Lớp hiện tại (${currentClass.name}) có ${lmsStudents?.length || 0} học sinh`
                      : 'Chọn lớp để nhập tự động'}
                  </span>
                </div>
                <button
                  onClick={handleImportFromLms}
                  className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đồng Bộ Ngay</span>
                </button>
              </div>

              {/* Thêm vịt thủ công */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Nhập tên học sinh / tên vịt..."
                  value={newDuckName}
                  onChange={(e) => setNewDuckName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDuck()}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddDuck}
                  className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Lưới danh sách vịt */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {duckList.map((d, idx) => (
                  <div
                    key={d.id || idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-base">🦆</span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {d.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDuck(d.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUẢN LÝ CÂU HỎI TIẾNG ANH */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {/* AI Tạo câu hỏi */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-black text-amber-900 uppercase block mb-1">
                  AI TỰ ĐỘNG TẠO BỘ CÂU HỎI TIẾNG ANH:
                </span>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Chủ đề: e.g. Unit 3 - Teen Stress - Grade 9"
                    className="flex-1 px-3 py-2 rounded-xl border border-amber-300 text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
                  />
                  <button
                    onClick={handleGenerateAi}
                    disabled={isGeneratingAi}
                    className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-sm disabled:opacity-50 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAi ? 'Đang tạo...' : 'Tạo 5 Câu'}</span>
                  </button>
                </div>
                {aiNotice && (
                  <p className="text-[11px] font-bold text-emerald-700 mt-2">{aiNotice}</p>
                )}
              </div>

              {/* Danh sách câu hỏi */}
              <div className="space-y-2">
                {questionList.map((q, idx) => (
                  <div key={q.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-start justify-between">
                      <strong className="text-slate-800">
                        {idx + 1}. {q.question}
                      </strong>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] ml-2">
                        Đáp án: {q.correct_answer}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end shrink-0 mt-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all active:scale-95"
          >
            Lưu & Hoàn Tất
          </button>
        </div>

      </div>
    </div>
  );
};

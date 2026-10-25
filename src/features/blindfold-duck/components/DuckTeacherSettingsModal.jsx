import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, Check, School, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { generateEnglishQuestionsAi } from '../services/duckAiService';

export const DuckTeacherSettingsModal = ({
  isOpen,
  onClose,
  ducks = [],
  onSaveDucks,
  questions = [],
  onSaveQuestions,
  currentClass,
  lmsStudents = []
}) => {
  const [activeTab, setActiveTab] = useState('ducks'); // 'ducks' | 'questions'
  const [duckList, setDuckList] = useState(ducks);
  const [questionList, setQuestionList] = useState(questions);

  // Thêm vịt mới
  const [newDuckName, setNewDuckName] = useState('');

  // AI tạo câu hỏi
  const [aiTopic, setAiTopic] = useState('Unit 2 - City Life - Grade 9');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

  // Thêm câu hỏi thủ công
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    points: 10
  });

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

  // Lưu câu hỏi thủ công
  const handleSaveNewQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.option_a.trim() || !newQuestion.option_b.trim()) {
      alert('Vui lòng nhập đầy đủ nội dung câu hỏi và các đáp án!');
      return;
    }
    const qItem = {
      ...newQuestion,
      id: `q_${Date.now()}`
    };
    const updated = [qItem, ...questionList];
    setQuestionList(updated);
    onSaveQuestions?.(updated);
    setShowAddQuestionForm(false);
    setNewQuestion({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
      points: 10
    });
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (id) => {
    const updated = questionList.filter(q => q.id !== id);
    setQuestionList(updated);
    onSaveQuestions?.(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 max-h-[90vh] flex flex-col">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề & Chọn Tab */}
        <div className="pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2.5 mb-3">
            <span className="text-3xl">⚙️</span>
            <div>
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
                DÀNH CHO GIÁO VIÊN
              </span>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Quản Lý Đàn Vịt & Câu Hỏi Tiếng Anh
              </h3>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('ducks')}
              className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeTab === 'ducks'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🦆 Đàn Vịt Học Sinh ({duckList.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeTab === 'questions'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📚 Câu Hỏi Tiếng Anh ({questionList.length})
            </button>
          </div>
        </div>

        {/* Nội dung Tab 1: Quản lý Đàn Vịt */}
        {activeTab === 'ducks' && (
          <div className="my-4 overflow-y-auto flex-1 space-y-4 pr-1 custom-scrollbar">
            {/* Thanh công cụ thêm nhanh & đồng bộ từ lớp LMS */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong className="block text-xs font-black text-amber-900">
                  📍 Lớp hiện tại: {currentClass?.name || 'Chưa chọn lớp'}
                </strong>
                <span className="text-[11px] text-amber-700 font-medium">
                  {lmsStudents.length} học sinh có sẵn trong hệ thống LMS
                </span>
              </div>

              <button
                onClick={handleImportFromLms}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-200 active:scale-95 transition-all"
              >
                <School className="w-3.5 h-3.5" />
                <span>+ Lấy Từ Danh Sách Lớp ({lmsStudents.length} HS)</span>
              </button>
            </div>

            {/* Ô thêm vịt thủ công */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Nhập tên chú vịt / học sinh mới..."
                value={newDuckName}
                onChange={e => setNewDuckName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddDuck()}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={handleAddDuck}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all active:scale-95"
              >
                + Thêm Vịt
              </button>
            </div>

            {/* Danh sách các chú vịt */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {duckList.map((d, idx) => (
                <div
                  key={d.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span>🦆</span>
                    <span className="truncate">{d.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteDuck(d.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nội dung Tab 2: Quản lý Câu Hỏi & AI Tạo Câu Hỏi */}
        {activeTab === 'questions' && (
          <div className="my-4 overflow-y-auto flex-1 space-y-4 pr-1 custom-scrollbar">
            {/* Khung AI Tạo câu hỏi */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <div className="flex items-center space-x-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="font-black text-xs sm:text-sm text-purple-900">
                  ✨ Gemini AI Tự Động Tạo Bộ Câu Hỏi Tiếng Anh
                </h4>
              </div>
              <p className="text-[11px] text-purple-700 font-medium mb-3">
                Nhập chủ đề bài học tiếng Anh (Unit, chuyên đề ngữ pháp), AI sẽ đề xuất 5 câu hỏi trắc nghiệm kèm giải thích chi tiết.
              </p>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="Ví dụ: Unit 2 - City Life - Grade 9..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  disabled={isGeneratingAi}
                  onClick={handleGenerateAi}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md shadow-purple-200 active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Tạo Câu Hỏi</span>
                    </>
                  )}
                </button>
              </div>

              {aiNotice && (
                <div className="mt-2.5 p-2 rounded-xl bg-purple-100/80 text-[11px] font-bold text-purple-900 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{aiNotice}</span>
                </div>
              )}
            </div>

            {/* Nút bật form tạo thủ công */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                Danh Sách {questionList.length} Câu Hỏi:
              </span>
              <button
                onClick={() => setShowAddQuestionForm(!showAddQuestionForm)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs"
              >
                {showAddQuestionForm ? 'Đóng Form' : '+ Thêm Câu Hỏi Thủ Công'}
              </button>
            </div>

            {/* Form tạo câu hỏi thủ công */}
            {showAddQuestionForm && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Nội dung câu hỏi:</label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="Ví dụ: She decided ______ abroad."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block">Đáp án A:</label>
                    <input
                      type="text"
                      value={newQuestion.option_a}
                      onChange={e => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block">Đáp án B:</label>
                    <input
                      type="text"
                      value={newQuestion.option_b}
                      onChange={e => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block">Đáp án C:</label>
                    <input
                      type="text"
                      value={newQuestion.option_c}
                      onChange={e => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block">Đáp án D:</label>
                    <input
                      type="text"
                      value={newQuestion.option_d}
                      onChange={e => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block">Đáp án đúng:</label>
                    <select
                      value={newQuestion.correct_answer}
                      onChange={e => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-black text-amber-700"
                    >
                      <option value="A">Đáp án A</option>
                      <option value="B">Đáp án B</option>
                      <option value="C">Đáp án C</option>
                      <option value="D">Đáp án D</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block">Giải thích ngắn:</label>
                    <input
                      type="text"
                      value={newQuestion.explanation}
                      onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                      placeholder="Ví dụ: decide + to V"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveNewQuestion}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-200 active:scale-95"
                  >
                    Lưu Câu Hỏi
                  </button>
                </div>
              </div>
            )}

            {/* Danh sách câu hỏi hiện tại */}
            <div className="space-y-2">
              {questionList.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-extrabold text-slate-900 leading-snug">
                      <span className="text-amber-600 mr-1.5">Câu {idx + 1}:</span>
                      {q.question}
                    </p>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 ml-2 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 font-semibold pl-2">
                    <span className={q.correct_answer === 'A' ? 'text-emerald-700 font-black' : ''}>A. {q.option_a}</span>
                    <span className={q.correct_answer === 'B' ? 'text-emerald-700 font-black' : ''}>B. {q.option_b}</span>
                    <span className={q.correct_answer === 'C' ? 'text-emerald-700 font-black' : ''}>C. {q.option_c}</span>
                    <span className={q.correct_answer === 'D' ? 'text-emerald-700 font-black' : ''}>D. {q.option_d}</span>
                  </div>

                  {q.explanation && (
                    <span className="block text-[10.5px] text-slate-500 italic pl-2">
                      💡 {q.explanation}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nút hoàn tất */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md shadow-amber-200 active:scale-95 transition-all"
          >
            HOÀN TẤT & ĐÓNG CÀI ĐẶT
          </button>
        </div>
      </div>
    </div>
  );
};

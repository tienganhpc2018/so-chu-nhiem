import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Award, Star, RotateCcw, AlertCircle } from 'lucide-react';
import { duckAudio } from '../services/duckAudio';

export const DuckQuestionModal = ({
  question,
  duckName = 'học sinh',
  combo = 1,
  onAnswer,
  onNextRound,
  onCloseGame
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState(null);

  if (!question) return null;

  const handleSelect = (key) => {
    if (isSubmitted) return;
    setSelectedOption(key);
    setIsSubmitted(true);

    const isCorrect = key === question.correct_answer;
    if (isCorrect) {
      duckAudio.playCorrect();
    } else {
      duckAudio.playWrong();
    }
  };

  const handleScoreGrade = (gradeText, points) => {
    setTeacherFeedback(gradeText);
    duckAudio.playCorrect();
    setTimeout(() => {
      onAnswer?.({
        isCorrect: points > 0,
        points: points * combo,
        selectedAnswer: selectedOption || 'TEACHER_GRADE',
        questionId: question.id,
        teacherGrade: gradeText
      });
    }, 400);
  };

  const handleContinue = () => {
    const isCorrect = selectedOption === question.correct_answer;
    onAnswer?.({
      isCorrect,
      points: isCorrect ? (question.points || 10) * combo : 0,
      selectedAnswer: selectedOption,
      questionId: question.id
    });
  };

  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 overflow-hidden">
        {/* Banner đầu modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md shadow-amber-200">
              🦆
            </div>
            <div>
              <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest block animate-pulse">
                🎯 ĐÃ TÓM ĐƯỢC CHÚ VỊT MAY MẮN!
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {duckName}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Mời em đứng dậy / lên bảng trả bài cũ 📋
              </p>
            </div>
          </div>

          {/* Combo badge */}
          {combo > 1 && (
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xs shadow-md shadow-orange-200 animate-pulse flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>x{combo} COMBO!</span>
            </div>
          )}
        </div>

        {/* Nội dung câu hỏi trắc nghiệm tiếng Anh / kiểm tra bài */}
        <div className="my-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
          <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block mb-1">
            CÂU HỎI KIỂM TRA BÀI:
          </span>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Danh sách 4 lựa chọn A, B, C, D */}
        <div className="grid grid-cols-1 gap-2.5">
          {options.map(({ key, text }) => {
            const isCorrect = key === question.correct_answer;
            const isSelected = selectedOption === key;

            let btnStyle = 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 text-slate-800';
            if (isSubmitted) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200 font-black';
              } else if (isSelected) {
                btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200 font-black';
              } else {
                btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
              }
            }

            return (
              <button
                key={key}
                disabled={isSubmitted}
                onClick={() => handleSelect(key)}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all active:scale-98 text-left ${btnStyle}`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                      isSubmitted && isCorrect
                        ? 'bg-white text-emerald-600'
                        : isSubmitted && isSelected
                        ? 'bg-white text-rose-600'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {key}
                  </span>
                  <span>{text}</span>
                </div>

                {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Giải thích ngữ pháp khi đã chọn đáp án */}
        {isSubmitted && (
          <div className="mt-3.5 p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm animate-fade-in">
            <span className="font-black text-slate-800 block mb-0.5">
              {selectedOption === question.correct_answer ? '🎉 CHÍNH XÁC!' : '❌ CHƯA ĐÚNG!'}
            </span>
            <span className="text-slate-600 font-medium">{question.explanation}</span>
          </div>
        )}

        {/* Thanh công cụ chấm điểm trực tiếp cho Thầy */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleScoreGrade('10 Điểm (Tốt)', 10)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xs transition-all active:scale-95"
            >
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>10 Điểm (Tốt)</span>
            </button>
            <button
              onClick={() => handleScoreGrade('8 Điểm (Khá)', 8)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-black text-xs transition-all active:scale-95"
            >
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>8-9 Điểm</span>
            </button>
            <button
              onClick={() => handleScoreGrade('Chưa thuộc', 0)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs transition-all active:scale-95"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Chưa thuộc</span>
            </button>
          </div>

          <button
            onClick={handleContinue}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-200 hover:scale-105 active:scale-95 transition-all"
          >
            <span>BẮT BẠN TIẾP THEO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

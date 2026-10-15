import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Award
} from 'lucide-react';
import { DEFAULT_QUESTIONS } from '../../marble-race/data/defaultQuestions';
import { soundFx } from '../../../utils/soundEffects';

export const UfoQuickQuizModal = ({
  isOpen,
  onClose,
  student,
  questions = DEFAULT_QUESTIONS,
  onRewardStudent,
  onNextRound
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const questionBank = (questions && questions.length > 0) ? questions : DEFAULT_QUESTIONS;
  const currentQ = questionBank[qIndex % questionBank.length];
  const correctIdx = currentQ?.correct ?? currentQ?.correctIndex ?? 0;

  // Đếm ngược 30 giây hồi hộp
  useEffect(() => {
    if (!isOpen || isAnswered || isTimeUp) return;

    setTimeLeft(30);
    setIsTimeUp(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setRewardClaimed(false);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          setIsAnswered(true);
          soundFx.playDeduct?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, qIndex]);

  if (!isOpen || !student) return null;

  const handleSelectOption = (idx) => {
    if (isAnswered || isTimeUp) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === correctIdx) {
      soundFx.playCorrect?.();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } else {
      soundFx.playDeduct?.();
    }
  };

  const handleClaimReward = () => {
    if (rewardClaimed) return;
    setRewardClaimed(true);
    soundFx.playCorrect?.();
    onRewardStudent?.(student.id || student.studentId, 1);
  };

  const handleNextQuestion = () => {
    soundFx.playClick?.();
    setQIndex(prev => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsTimeUp(false);
    setTimeLeft(30);
    setRewardClaimed(false);
  };

  const displayName = student.shortName || student.name || student.full_name || 'Học sinh';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0b1329] border-2 border-emerald-500/80 rounded-3xl w-full max-w-2xl text-white shadow-[0_0_60px_rgba(16,185,129,0.5)] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header với thông tin học sinh & đồng hồ 30s */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar học sinh */}
            <div className="relative w-11 h-11 rounded-full border-2 border-yellow-300 overflow-hidden bg-white shrink-0">
              {student.avatar || student.avatar_url ? (
                <img src={student.avatar || student.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-amber-500 text-white font-black flex items-center justify-center text-lg">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-base sm:text-lg text-white tracking-wide">
                  {displayName}
                </span>
                <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  TRẢ BÀI 30S
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Đĩa bay UFO đã bắt lên bục • Trả lời nhanh để nhận Sao! ⭐
              </p>
            </div>
          </div>

          {/* Đồng hồ đếm ngược 30s */}
          <div className="flex items-center space-x-2 bg-black/40 px-3.5 py-1.5 rounded-2xl border border-white/20">
            <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-400 animate-spin' : 'text-amber-300'}`} />
            <span className={`font-mono font-black text-xl tracking-wider ${
              timeLeft <= 5 ? 'text-rose-400 animate-pulse' :
              timeLeft <= 10 ? 'text-amber-300' : 'text-emerald-300'
            }`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Thanh tiến trình thời gian co dần */}
        <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 5 ? 'bg-rose-500' :
              timeLeft <= 10 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>

        {/* Nội dung câu hỏi */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* Câu hỏi */}
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl shadow-inner">
            <div className="flex items-start space-x-2.5">
              <span className="shrink-0 w-6 h-6 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center mt-0.5">
                ?
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                {currentQ.question}
              </p>
            </div>
          </div>

          {/* 4 Lựa chọn trắc nghiệm A, B, C, D */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === idx;
              const isCorrect = idx === correctIdx;

              let btnStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg shadow-emerald-900/40 font-black';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-600/90 border-rose-400 text-white font-black';
                } else {
                  btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-3 rounded-xl border-2 text-left text-xs sm:text-sm font-semibold transition-all flex items-center space-x-3 active:scale-98 ${btnStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                    isAnswered && isCorrect ? 'bg-white text-emerald-700' :
                    isAnswered && isSelected ? 'bg-white text-rose-700' :
                    'bg-slate-700 text-slate-200'
                  }`}>
                    {letter}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Lời giải thích khi đã trả lời hoặc hết giờ */}
          {isAnswered && (
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-fade-in ${
              selectedOption === correctIdx
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            }`}>
              <div className="flex items-center space-x-1.5 font-black mb-1">
                {selectedOption === correctIdx ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>CHÍNH XÁC! XUẤT SẮC! 🎉</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>{isTimeUp ? 'HẾT GIỜ 30 GIÂY!' : 'CHƯA CHÍNH XÁC!'}</span>
                  </>
                )}
              </div>
              {currentQ.explanation && (
                <p className="text-slate-300 mt-1 italic">
                  💡 {currentQ.explanation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer điều khiển */}
        <div className="px-5 py-3.5 bg-[#080d1d] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleNextQuestion}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đổi câu khác</span>
          </button>

          <div className="flex items-center space-x-2">
            {isAnswered && selectedOption === correctIdx && (
              <button
                onClick={handleClaimReward}
                disabled={rewardClaimed}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                  rewardClaimed
                    ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:scale-105 active:scale-95 shadow-md shadow-amber-500/30'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{rewardClaimed ? 'Đã tặng +1 Sao ⭐' : 'Tặng +1 Sao ⭐'}</span>
              </button>
            )}

            <button
              onClick={onNextRound}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all active:scale-95 shadow-md shadow-emerald-900/40"
            >
              <span>Bắt lượt sau</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

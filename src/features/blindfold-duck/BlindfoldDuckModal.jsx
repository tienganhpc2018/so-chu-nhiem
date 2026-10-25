import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize, Minimize, Volume2, VolumeX, Pause, Play, Trophy, Settings, RotateCcw } from 'lucide-react';
import { DuckLobbyScreen } from './components/DuckLobbyScreen';
import { DuckArena } from './components/DuckArena';
import { DuckQuestionModal } from './components/DuckQuestionModal';
import { DuckVictoryModal } from './components/DuckVictoryModal';
import { DuckRulesModal } from './components/DuckRulesModal';
import { DuckLeaderboardModal } from './components/DuckLeaderboardModal';
import { DuckTeacherSettingsModal } from './components/DuckTeacherSettingsModal';
import { DuckVirtualControls } from './components/DuckVirtualControls';
import { getLocalDucks, saveLocalDucks, getGameQuestions, saveGameQuestions, saveGameSession } from './services/duckStorage';
import { duckAudio } from './services/duckAudio';

export const BlindfoldDuckModal = ({
  isOpen,
  onClose,
  currentClass,
  students: lmsStudents = []
}) => {
  const containerRef = useRef(null);

  // Màn hình game: 'lobby' | 'playing'
  const [gameStage, setGameStage] = useState('lobby');

  // Cấu hình
  const [selectedMode, setSelectedMode] = useState('quiz');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [roundDuration, setRoundDuration] = useState(20); // Mặc định 20 giây (hoặc 30 giây)
  const [ducks, setDucks] = useState(() => getLocalDucks(lmsStudents));
  const [questions, setQuestions] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Tiến trình thi đấu
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [comboMax, setComboMax] = useState(1);
  const [ducksCaughtCount, setDucksCaughtCount] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [targetDuck, setTargetDuck] = useState(null);

  // Modal phụ
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTeacherSettings, setShowTeacherSettings] = useState(false);
  const [victoryData, setVictoryData] = useState(null);

  // Nạp danh sách vịt & câu hỏi khi mở modal
  useEffect(() => {
    if (isOpen) {
      const loadedDucks = getLocalDucks(lmsStudents);
      setDucks(loadedDucks);
      getGameQuestions().then(qs => setQuestions(qs));
      setGameStage('lobby');
      setVictoryData(null);
      setIsPaused(false);
      setTimeLeft(roundDuration);
    } else {
      duckAudio.destroy();
    }
  }, [isOpen, lmsStudents]);

  // Quản lý âm nhạc & âm thanh
  useEffect(() => {
    duckAudio.setMuted(isMuted);
    if (gameStage === 'playing' && !isMuted && !isPaused) {
      duckAudio.playBgm();
    } else {
      duckAudio.stopBgm();
    }
  }, [gameStage, isMuted, isPaused]);

  // Bộ đếm ngược thời gian vòng chơi (20s hoặc 30s)
  useEffect(() => {
    if (gameStage !== 'playing' || isPaused || activeQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0; // Hết giờ -> DuckArena sẽ tự động tóm 1 vịt để học sinh trả bài
        }
        if (prev <= 6) {
          // Âm thanh tích tắc hồi hộp trong những giây cuối
          duckAudio.playTickTock(prev <= 3);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStage, isPaused, activeQuestion]);

  // Bắt đầu chơi
  const handleStartGame = () => {
    setScore(0);
    setCombo(1);
    setComboMax(1);
    setDucksCaughtCount(0);
    setCorrectAnswersCount(0);
    setTimeLeft(roundDuration);
    setActiveQuestion(null);
    setVictoryData(null);

    // Nếu ở chế độ Target: chọn ngẫu nhiên 1 bạn làm mục tiêu
    if (selectedMode === 'target' && ducks.length > 0) {
      const randIdx = Math.floor(Math.random() * ducks.length);
      setTargetDuck(ducks[randIdx]);
    } else {
      setTargetDuck(null);
    }

    setGameStage('playing');
    duckAudio.playCountdown();
  };

  // Xử lý khi bắt được vịt (tự bắt hoặc hết giờ tự tóm)
  const handleCatchDuck = (duck) => {
    setDucksCaughtCount(prev => prev + 1);

    // Chế độ 3: Tìm đúng học sinh
    if (selectedMode === 'target') {
      if (targetDuck && duck.id === targetDuck.id) {
        setScore(s => s + 30);
        const remaining = ducks.filter(d => d.id !== duck.id);
        if (remaining.length > 0) {
          setTargetDuck(remaining[Math.floor(Math.random() * remaining.length)]);
        }
      } else {
        setScore(s => Math.max(0, s - 5));
        return;
      }
    }

    // Luôn mở câu hỏi trả bài cho học sinh bị bắt
    let currentQ = questions.length > 0
      ? questions[Math.floor(Math.random() * questions.length)]
      : {
          id: 'q_default',
          question: `Mời bạn ${duck.name} trả lời câu hỏi bài cũ của Thầy trên lớp:`,
          option_a: 'Đã thuộc bài và chuẩn bị chu đáo',
          option_b: 'Cần ôn tập thêm một chút',
          option_c: 'Trả lời đúng 1 phần',
          option_d: 'Xung phong giải bài tập khó',
          correct_answer: 'A',
          explanation: 'Thầy đánh giá phần trả bài của học sinh và ghi nhận điểm số.',
          points: 10
        };

    setActiveQuestion({ question: currentQ, duckName: duck.name });
  };

  // Xử lý khi hoàn tất trả bài
  const handleAnswerQuestion = ({ isCorrect, points }) => {
    if (isCorrect) {
      setScore(s => s + (points || 10));
      setCorrectAnswersCount(c => c + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > comboMax) setComboMax(nextCombo);
    } else {
      setCombo(1);
    }
    setActiveQuestion(null);
    // Bắt đầu vòng 20s/30s tiếp theo cho bạn khác
    setTimeLeft(roundDuration);
  };

  // Kết thúc lượt chơi
  const handleFinishGame = async () => {
    const sessionItem = {
      playerName: currentClass ? `HS ${currentClass.name}` : 'Học sinh',
      classId: currentClass?.id,
      className: currentClass?.name,
      mode: selectedMode,
      score,
      ducksCaught: ducksCaughtCount,
      correctAnswers: correctAnswersCount,
      totalQuestions: ducksCaughtCount,
      comboMax,
      durationSeconds: roundDuration
    };

    await saveGameSession(sessionItem);
    setVictoryData(sessionItem);
    setGameStage('lobby');
  };

  // Toàn màn hình
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-[1400px] max-h-[920px] bg-slate-950 flex flex-col overflow-hidden shadow-2xl border sm:border-2 border-amber-500/40 sm:rounded-3xl"
      >
        {/* THANH ĐIỀU KHIỂN TRÊN CÙNG KHI ĐANG CHƠI */}
        {gameStage === 'playing' && (
          <div className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/30 px-4 sm:px-6 flex items-center justify-between z-40 shrink-0 text-white select-none">
            {/* Điểm & Combo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40">
                <span className="text-sm">⭐</span>
                <span className="font-black text-sm text-amber-300">{score}</span>
                <span className="text-[10px] text-amber-200 uppercase font-bold">điểm</span>
              </div>

              {combo > 1 && (
                <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xs shadow-md shadow-orange-300/30 animate-pulse">
                  x{combo} COMBO!
                </div>
              )}

              {targetDuck && (
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-red-600/30 border border-red-500/50 text-red-300 font-bold text-xs">
                  <span>🎯 Tìm:</span>
                  <span className="font-black text-white">{targetDuck.name}</span>
                </div>
              )}
            </div>

            {/* ĐỒNG HỒ ĐẾM NGƯỢC (20S HOẶC 30S) & SỐ VỊT BẮT */}
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-xl border text-xs sm:text-sm font-black transition-all ${
                  timeLeft <= 5
                    ? 'bg-red-600/90 border-yellow-300 text-yellow-200 shadow-lg shadow-red-500/50 animate-pulse scale-105'
                    : 'bg-black/50 border-amber-400/50 text-amber-200'
                }`}
                title="Thời gian rượt đuổi bắt vịt trả bài"
              >
                <span className="text-base">⏱️</span>
                <span>{timeLeft}s</span>
              </div>

              {/* Nút đổi nhanh 20s / 30s ngay trên thanh trạng thái */}
              <button
                onClick={() => {
                  const nextTime = roundDuration === 20 ? 30 : 20;
                  setRoundDuration(nextTime);
                  setTimeLeft(nextTime);
                }}
                className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-black text-amber-300 transition-all active:scale-95"
                title="Chuyển đổi thời gian vòng chơi"
              >
                <span>Chế độ: {roundDuration}s</span>
                <RotateCcw className="w-3 h-3 ml-0.5" />
              </button>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-black">
                <span>🦆</span>
                <span>{ducksCaughtCount} vịt</span>
              </div>
            </div>

            {/* Nút điều khiển âm thanh, tạm dừng, toàn màn hình, kết thúc */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
                title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all hidden sm:block"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              <button
                onClick={handleFinishGame}
                className="px-3 py-1 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-extrabold text-xs transition-all active:scale-95"
              >
                Kết Thúc
              </button>
            </div>
          </div>
        )}

        {/* NÚT ĐÓNG MODAL KHI Ở LOBBY */}
        {gameStage === 'lobby' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
            title="Đóng trò chơi (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* MÀN HÌNH CHÍNH */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {gameStage === 'lobby' ? (
            <DuckLobbyScreen
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              roundDuration={roundDuration}
              onSelectRoundDuration={(d) => {
                setRoundDuration(d);
                setTimeLeft(d);
              }}
              onStartGame={handleStartGame}
              onOpenRules={() => setShowRules(true)}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenSettings={() => setShowTeacherSettings(true)}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              duckCount={ducks.length}
              currentClass={currentClass}
            />
          ) : (
            <>
              <DuckArena
                ducks={ducks}
                mode={selectedMode}
                difficulty={selectedDifficulty}
                targetDuckId={targetDuck?.id}
                timeLeft={timeLeft}
                roundDuration={roundDuration}
                onCatchDuck={handleCatchDuck}
                onMissCatch={() => {}}
                isPaused={isPaused}
              />
              <DuckVirtualControls
                onCatch={() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
                }}
              />
            </>
          )}
        </div>

        {/* CÁC SUB-MODALS */}
        {activeQuestion && (
          <DuckQuestionModal
            question={activeQuestion.question}
            duckName={activeQuestion.duckName}
            combo={combo}
            onAnswer={handleAnswerQuestion}
          />
        )}

        {victoryData && (
          <DuckVictoryModal
            sessionData={victoryData}
            onRestart={handleStartGame}
            onViewLeaderboard={() => {
              setVictoryData(null);
              setShowLeaderboard(true);
            }}
            onClose={() => {
              setVictoryData(null);
              setGameStage('lobby');
            }}
          />
        )}

        <DuckRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

        <DuckLeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />

        <DuckTeacherSettingsModal
          isOpen={showTeacherSettings}
          onClose={() => setShowTeacherSettings(false)}
          ducks={ducks}
          onSaveDucks={(d) => {
            setDucks(d);
            saveLocalDucks(d);
          }}
          questions={questions}
          onSaveQuestions={(q) => {
            setQuestions(q);
            saveGameQuestions(q);
          }}
          currentClass={currentClass}
          lmsStudents={lmsStudents}
        />
      </div>
    </div>
  );
};

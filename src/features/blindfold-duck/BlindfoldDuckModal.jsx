import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize, Minimize, Volume2, VolumeX, Pause, Play, Trophy, Settings, RotateCcw, Users, Dices, Award } from 'lucide-react';
import { DuckLobbyScreen } from './components/DuckLobbyScreen';
import { DuckArena } from './components/DuckArena';
import { DuckRandomNamePicker } from './components/DuckRandomNamePicker';
import { DuckCaughtResultModal } from './components/DuckCaughtResultModal';
import { DuckRulesModal } from './components/DuckRulesModal';
import { DuckLeaderboardModal } from './components/DuckLeaderboardModal';
import { DuckTeacherSettingsModal } from './components/DuckTeacherSettingsModal';
import { DuckVictoryModal } from './components/DuckVictoryModal';
import { getLocalDucks, saveLocalDucks, getGameQuestions, saveGameQuestions, saveGameSession, saveGameRound } from './services/duckStorage';
import { duckAudio } from './services/duckAudio';

/**
 * NÂNG CẤP GAME "BỊT MẮT BẮT VỊT" - TÁI TẠO ĐÚNG CƠ CHẾ VERSION GỐC:
 * 
 * Flow chuẩn 100% theo video tham chiếu:
 * 1. MÀN HÌNH LOBBY → BẤM "BẮT ĐẦU BẮT VỊT"
 * 2. PHASE 2: RANDOM TÊN (RandomNamePicker) → "🎯 AI SẼ GỌI AI?" → Khóa tên: 🔔 "LÝ HỒNG THƯƠNG!"
 * 3. PHASE 3 & 4: ĐÀN VỊT 3D CHẠY TÁN LOẠN TRONG SÂN → NGƯỜI CHƠI BỊT MẮT RƯỢT ĐUỔI → VỊT NÉ TRÁNH HOẢNG LOẠN
 * 4. BẮT ĐƯỢC RỒI! → CAMERA ZOOM FOCUS VÀO VỊT + SPOTLIGHT + CONFETTI
 * 5. PHASE 5: HIỆN ẢNH AVATAR + TÊN HỌC SINH CỠ LỚN (DuckCaughtResultModal) → GỌI BẠN TIẾP THEO
 */
export const BlindfoldDuckModal = ({
  isOpen,
  onClose,
  currentClass,
  students: lmsStudents = [],
  onAwardPointsToStudent
}) => {
  const containerRef = useRef(null);

  // Màn hình game: 'lobby' | 'picking' | 'playing' | 'result'
  const [gameStage, setGameStage] = useState('lobby');

  // Cấu hình gameplay
  const [selectedMode, setSelectedMode] = useState('random_call'); // 'random_call' | 'target' | 'blind_catch'
  const [roundDuration, setRoundDuration] = useState(20); // 10s, 15s, 20s, 30s
  const [noRepeat, setNoRepeat] = useState(true); // Không lặp học sinh trong cùng buổi
  const [showDuckNames, setShowDuckNames] = useState(false); // Mặc định ẩn tên vịt trong sân để hồi hộp
  const [enableTts, setEnableTts] = useState(true); // Đọc to tên học sinh bằng giọng nói

  // Danh sách học sinh / vịt
  const [ducks, setDucks] = useState(() => getLocalDucks(lmsStudents));
  const [questions, setQuestions] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Học sinh đang được chọn trong lượt hiện tại
  const [targetStudent, setTargetStudent] = useState(null);
  const [caughtStudent, setCaughtStudent] = useState(null);
  const [calledStudentIds, setCalledStudentIds] = useState([]);

  // Điểm số & số lượt
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);

  // Modals phụ
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTeacherSettings, setShowTeacherSettings] = useState(false);
  const [victoryData, setVictoryData] = useState(null);

  // Nạp danh sách học sinh từ LMS khi mở modal
  useEffect(() => {
    if (isOpen) {
      const loadedDucks = getLocalDucks(lmsStudents);
      setDucks(loadedDucks);
      getGameQuestions().then(qs => setQuestions(qs));
      setGameStage('lobby');
      setVictoryData(null);
      setIsPaused(false);
      setTimeLeft(roundDuration);
      setCalledStudentIds([]);
      setTargetStudent(null);
      setCaughtStudent(null);
      setRoundsPlayed(0);
      setScore(0);
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

  // Bộ đếm ngược thời gian rượt đuổi trong sân chơi
  useEffect(() => {
    if (gameStage !== 'playing' || isPaused || caughtStudent) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0; // Hết giờ -> DuckArena tự động tóm vịt
        }
        if (prev <= 5) {
          duckAudio.playTickTock(prev <= 3);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStage, isPaused, caughtStudent]);

  // BẮT ĐẦU VÒNG CHƠI MỚI (WORKFLOW GỐC)
  const handleStartRound = () => {
    setTimeLeft(roundDuration);
    setCaughtStudent(null);

    // Ở chế độ "random_call" hoặc "target": chuyển sang màn hình quay tên trước
    if (selectedMode === 'random_call' || selectedMode === 'target') {
      setGameStage('picking');
    } else {
      // Chế độ "blind_catch": vào thẳng sân đàn vịt chạy, bắt xong mới lật mở tên
      setTargetStudent(null);
      setGameStage('playing');
    }
  };

  // KHI QUAY TÊN XONG: CHUYỂN VÀO SÂN ĐÀN VỊT RƯỢT ĐUỔI
  const handleNameSelected = (selected) => {
    setTargetStudent(selected);
    setGameStage('playing');
    setTimeLeft(roundDuration);
  };

  // KHI BẮT ĐƯỢC CHÚ VỊT TRONG SÂN
  const handleCatchDuck = (caughtDuck) => {
    const finalStudent = targetStudent || caughtDuck;
    setCaughtStudent(finalStudent);
    setRoundsPlayed(r => r + 1);
    setScore(s => s + 10);

    // Ghi nhận học sinh đã được gọi trong buổi
    if (finalStudent && finalStudent.id) {
      setCalledStudentIds(prev => {
        if (!prev.includes(finalStudent.id)) {
          return [...prev, finalStudent.id];
        }
        return prev;
      });
    }

    // Tự động lưu lượt chơi vào Supabase game_rounds / LocalStorage
    saveGameRound({
      targetStudentId: targetStudent?.id,
      targetStudentName: targetStudent?.name || targetStudent?.full_name,
      caughtStudentId: finalStudent?.id,
      caughtStudentName: finalStudent?.name || finalStudent?.full_name,
      isCorrect: !targetStudent || targetStudent.id === finalStudent?.id,
      score: 10
    });

    // Hiển thị Card kết quả vinh danh to ở giữa màn hình
    setGameStage('result');
  };

  // GỌI BẠN TIẾP THEO (VÒNG LẶP LIÊN TỤC TRONG TIẾT HỌC)
  const handleNextRound = () => {
    setCaughtStudent(null);
    setTargetStudent(null);

    // Kiểm tra nếu bật "Không lặp" và đã gọi hết cả lớp
    if (noRepeat && calledStudentIds.length >= ducks.length && ducks.length > 0) {
      alert(`🎉 Cả lớp (${ducks.length} học sinh) đã được gọi hết lượt! Vòng quay sẽ tự động làm mới lại từ đầu.`);
      setCalledStudentIds([]);
    }

    handleStartRound();
  };

  // KẾT THÚC BUỔI CHƠI & LƯU LỊCH SỬ VÀO DATABASE / SUPABASE
  const handleFinishSession = async () => {
    const sessionItem = {
      playerName: currentClass ? `Lớp ${currentClass.name}` : 'Cả lớp',
      classId: currentClass?.id,
      className: currentClass?.name,
      mode: selectedMode,
      score,
      ducksCaught: roundsPlayed,
      correctAnswers: roundsPlayed,
      totalQuestions: roundsPlayed,
      comboMax: 1,
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
        {/* THANH ĐIỀU KHIỂN TRÊN CÙNG KHI ĐANG TRONG TRẬN ĐẤU */}
        {gameStage === 'playing' && (
          <div className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/30 px-4 sm:px-6 flex items-center justify-between z-40 shrink-0 text-white select-none">
            
            {/* Lớp học & Số học sinh đã gọi */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40">
                <span className="text-sm">⭐</span>
                <span className="font-black text-sm text-amber-300">{score}</span>
                <span className="text-[10px] text-amber-200 uppercase font-bold">điểm</span>
              </div>

              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-amber-200">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Đã gọi: {calledStudentIds.length}/{ducks.length}
                </span>
              </div>

              {targetStudent && selectedMode !== 'blind_catch' && (
                <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-red-600/30 border border-red-500/50 text-xs font-black text-red-200 animate-pulse">
                  <span>🎯 Mục tiêu:</span>
                  <span className="text-yellow-300 font-extrabold uppercase">
                    {targetStudent.name || targetStudent.full_name}
                  </span>
                </div>
              )}
            </div>

            {/* ĐỒNG HỒ ĐẾM NGƯỢC (20S) */}
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

              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-black">
                <span>🦆</span>
                <span>Lượt {roundsPlayed + 1}</span>
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
                onClick={handleFinishSession}
                className="px-3 py-1 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-extrabold text-xs transition-all active:scale-95"
              >
                Kết Thúc
              </button>
            </div>
          </div>
        )}

        {/* NÚT ĐÓNG KHI Ở LOBBY */}
        {gameStage === 'lobby' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
            title="Đóng trò chơi (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* KHU VỰC NỘI DUNG CHÍNH THEO CÁC PHASE */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          
          {/* 1. MÀN HÌNH LOBBY */}
          {gameStage === 'lobby' && (
            <DuckLobbyScreen
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              roundDuration={roundDuration}
              onSelectRoundDuration={setRoundDuration}
              noRepeat={noRepeat}
              onToggleNoRepeat={() => setNoRepeat(!noRepeat)}
              showDuckNames={showDuckNames}
              onToggleShowDuckNames={() => setShowDuckNames(!showDuckNames)}
              enableTts={enableTts}
              onToggleTts={() => setEnableTts(!enableTts)}
              onStartGame={handleStartRound}
              onOpenRules={() => setShowRules(true)}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenSettings={() => setShowTeacherSettings(true)}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              duckCount={ducks.length}
              calledCount={calledStudentIds.length}
              currentClass={currentClass}
            />
          )}

          {/* 2. PHASE 2: QUAY TÊN NGẪU NHIÊN (RandomNamePicker) */}
          {gameStage === 'picking' && (
            <DuckRandomNamePicker
              students={ducks}
              calledIds={calledStudentIds}
              noRepeat={noRepeat}
              enableTts={enableTts}
              onNameSelected={handleNameSelected}
              onCancel={() => setGameStage('lobby')}
            />
          )}

          {/* 3. PHASE 3 & 4: ĐÀN VỊT CHẠY TRONG SÂN 3D & BẮT VỊT */}
          {gameStage === 'playing' && (
            <DuckArena
              ducks={ducks}
              mode={selectedMode}
              targetDuckId={targetStudent?.id}
              timeLeft={timeLeft}
              roundDuration={roundDuration}
              showDuckNames={showDuckNames}
              onCatchDuck={handleCatchDuck}
              onMissCatch={() => {}}
              isPaused={isPaused}
            />
          )}

          {/* 4. PHASE 5: HIỆN ẢNH AVATAR + TÊN HỌC SINH ĐƯỢC BẮT */}
          {gameStage === 'result' && (
            <DuckCaughtResultModal
              caughtStudent={caughtStudent}
              mode={selectedMode}
              isTargetMatch={!targetStudent || targetStudent.id === caughtStudent?.id}
              enableTts={enableTts}
              onNextRound={handleNextRound}
              onClose={() => setGameStage('lobby')}
              onAwardPoints={(studentId, pts, reason) => {
                onAwardPointsToStudent?.(studentId, pts, reason);
                alert(`Đã cộng +${pts} điểm (${reason}) cho bạn ${caughtStudent?.name || 'học sinh'}!`);
              }}
            />
          )}

        </div>

        {/* CÁC MODALS PHỤ */}
        {victoryData && (
          <DuckVictoryModal
            sessionData={victoryData}
            onRestart={handleStartRound}
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
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          roundDuration={roundDuration}
          onSelectRoundDuration={setRoundDuration}
          noRepeat={noRepeat}
          onToggleNoRepeat={() => setNoRepeat(!noRepeat)}
          showDuckNames={showDuckNames}
          onToggleShowDuckNames={() => setShowDuckNames(!showDuckNames)}
          enableTts={enableTts}
          onToggleTts={() => setEnableTts(!enableTts)}
        />

      </div>
    </div>
  );
};

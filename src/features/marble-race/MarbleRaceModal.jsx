import React, { useState } from 'react';
import { RaceSetupView } from './components/RaceSetupView';
import { MarbleCanvas } from './components/MarbleCanvas';
import { RaceResultModal } from './components/RaceResultModal';
import { RaceQuestionModal } from './components/RaceQuestionModal';
import { PhotoCropModal } from './components/PhotoCropModal';
import { soundFx } from '../../utils/soundEffects';

export const MarbleRaceModal = ({
  isOpen,
  onClose,
  currentClass,
  students = [],
  calledStudentIds = [],
  onConfirmCallStudent,
  onUpdateStudentsList
}) => {
  // State Machine: 'SETUP' | 'RACING' | 'RESULT'
  const [gameState, setGameState] = useState('SETUP');
  
  // Race parameters
  const [raceParams, setRaceParams] = useState({
    trackLength: 'medium',
    useStudentPhotos: true,
    enableQuestions: true,
    participants: []
  });

  // Result state
  const [raceResult, setRaceResult] = useState({
    winner: null,
    leaderboard: [],
    raceTime: 0
  });

  // Modal con
  const [showCropModal, setShowCropModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  if (!isOpen) return null;

  // 1. Bắt đầu cuộc đua
  const handleStartRace = (params) => {
    setRaceParams(params);
    setGameState('RACING');
  };

  // 2. Kết thúc cuộc đua
  const handleFinishRace = ({ winner, leaderboard, raceTime }) => {
    setRaceResult({ winner, leaderboard, raceTime });
    setGameState('RESULT');

    // Ghi nhận học sinh đã được gọi
    if (winner?.studentId) {
      onConfirmCallStudent?.(winner.studentId);
    }
  };

  // 3. Đua lại ngay với cấu hình hiện tại
  const handleRestartRace = () => {
    soundFx.playCorrect();
    setGameState('RACING');
  };

  // 4. Quay lại màn hình thiết lập
  const handleBackToSetup = () => {
    soundFx.playClick();
    setGameState('SETUP');
  };

  // 5. Gán ảnh đại diện cho học sinh sau khi cắt
  const handleAssignAvatar = (studentId, avatarDataUrl) => {
    const updated = students.map(s => s.id === studentId ? { ...s, avatar: avatarDataUrl, avatar_url: avatarDataUrl } : s);
    onUpdateStudentsList?.(updated);
  };

  return (
    <>
      {/* 1. Màn hình Cài Đặt (Chuẩn Ảnh 1 & Ảnh 3) */}
      {gameState === 'SETUP' && (
        <RaceSetupView
          currentClass={currentClass}
          students={students}
          calledStudentIds={calledStudentIds}
          onStartRace={handleStartRace}
          onOpenCropModal={() => setShowCropModal(true)}
          onClose={onClose}
          onUpdateStudentsList={onUpdateStudentsList}
        />
      )}

      {/* 2. Màn hình Đua Trực Tiếp (Chuẩn Ảnh 4 & Ảnh 5) */}
      {gameState === 'RACING' && (
        <MarbleCanvas
          trackLength={raceParams.trackLength}
          useStudentPhotos={raceParams.useStudentPhotos}
          participants={raceParams.participants.length > 0 ? raceParams.participants : students}
          onFinishRace={handleFinishRace}
          onCancelRace={handleBackToSetup}
        />
      )}

      {/* 3. Màn hình Kết Quả Bảng Vàng Podium */}
      {gameState === 'RESULT' && (
        <RaceResultModal
          isOpen={true}
          onClose={onClose}
          winner={raceResult.winner}
          leaderboard={raceResult.leaderboard}
          raceTime={raceResult.raceTime}
          enableQuestions={raceParams.enableQuestions}
          onRestartRace={handleRestartRace}
          onOpenSettings={handleBackToSetup}
          onOpenQuestionModal={() => setShowQuestionModal(true)}
          onRewardStudent={(stId, pts, reason) => {
            soundFx.playCorrect();
          }}
        />
      )}

      {/* 4. Modal Cắt Ảnh Từng Học Sinh Từ Ảnh Tập Thể (Chuẩn Ảnh 2) */}
      <PhotoCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        students={students}
        classPhotoUrl={currentClass?.photo_url || null}
        onAssignStudentAvatar={handleAssignAvatar}
      />

      {/* 5. Modal Câu Hỏi Trắc Nghiệm Tiếng Anh */}
      <RaceQuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        winner={raceResult.winner}
        onRewardStudent={(stId, pts, reason) => {
          soundFx.playCorrect();
        }}
      />
    </>
  );
};

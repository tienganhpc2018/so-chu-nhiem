import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Volume2, VolumeX, Maximize, Minimize, Settings as SettingsIcon } from 'lucide-react';
import { UfoArena } from './components/UfoArena';
import { UfoBottomBar } from './components/UfoBottomBar';
import { UfoSettingsModal } from './components/UfoSettingsModal';
import { UfoAbductedModal } from './components/UfoAbductedModal';
import { PhotoCropModal } from '../marble-race/components/PhotoCropModal';
import { getInitialUfoClasses, saveUfoClasses, getUfoSettings, saveUfoSettings } from './utils/ufoStorage';
import { ufoAudio } from './utils/ufoAudio';

export const UfoRaceModal = ({
  isOpen,
  onClose,
  currentClass,
  students: lmsStudents = [],
  calledStudentIds: lmsCalledIds = [],
  onConfirmCallStudent
}) => {
  const modalContainerRef = useRef(null);

  // Danh sách lớp & cấu hình
  const [classes, setClasses] = useState(getInitialUfoClasses);
  const [currentClassId, setCurrentClassId] = useState('class_12a1');
  const [settings, setSettings] = useState(getUfoSettings);

  // Gameplay state
  const [pickCount, setPickCount] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [abductedStudents, setAbductedStudents] = useState([]);
  const [calledIds, setCalledIds] = useState(lmsCalledIds);

  // Sub-modals
  const [showSettings, setShowSettings] = useState(false);
  const [showAbductedModal, setShowAbductedModal] = useState(false);
  const [showPhotoCrop, setShowPhotoCrop] = useState(false);

  // Đồng bộ lớp học LMS hiện tại vào game nếu có
  useEffect(() => {
    if (currentClass && lmsStudents && lmsStudents.length > 0) {
      setClasses(prev => {
        const existingIdx = prev.findIndex(c => c.id === currentClass.id);
        const lmsClassItem = {
          id: currentClass.id,
          name: currentClass.name || 'Lớp hiện tại',
          students: lmsStudents.map(s => ({
            id: s.id,
            name: s.name || s.full_name || 'Học sinh',
            avatar: s.avatar || s.avatar_url || null
          }))
        };

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = lmsClassItem;
          saveUfoClasses(updated);
          return updated;
        } else {
          const updated = [lmsClassItem, ...prev];
          saveUfoClasses(updated);
          return updated;
        }
      });
      setCurrentClassId(currentClass.id);
    }
  }, [currentClass, lmsStudents]);

  // Quản lý phát nhạc nền & dọn dẹp âm thanh
  useEffect(() => {
    if (isOpen && !isMuted) {
      if (settings.selectedMusic === 'custom' && settings.customMusicData) {
        ufoAudio.playBgm(settings.customMusicData);
      } else {
        ufoAudio.playBgm();
      }
    } else {
      ufoAudio.stopBgm();
    }

    return () => {
      ufoAudio.stopBgm();
    };
  }, [isOpen, isMuted, settings.selectedMusic, settings.customMusicData]);

  // Lắng nghe phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showAbductedModal) setShowAbductedModal(false);
        else if (showSettings) setShowSettings(false);
        else if (showPhotoCrop) setShowPhotoCrop(false);
        else onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showAbductedModal, showSettings, showPhotoCrop, onClose]);

  if (!isOpen) return null;

  // Lấy dữ liệu lớp đang chọn
  const activeClass = classes.find(c => c.id === currentClassId) || classes[0] || {
    id: 'class_12a1',
    name: 'Lớp 12A1',
    students: []
  };

  const activeStudents = activeClass.students || [];

  // Bật/tắt chạy bắt học sinh
  const handleToggleStart = () => {
    if (activeStudents.length === 0) {
      alert('Lớp học chưa có học sinh nào. Thầy vui lòng vào "Cài đặt" để dán danh sách nhé!');
      setShowSettings(true);
      return;
    }
    setIsRunning(prev => !prev);
  };

  // Khi hoàn thành bắt đủ số học sinh
  const handleCompleteCapture = (captured) => {
    setIsRunning(false);
    setAbductedStudents(captured);
    setShowAbductedModal(true);

    // Ghi nhận học sinh đã được gọi
    const newCalledIds = [...calledIds, ...captured.map(c => c.id)];
    setCalledIds(newCalledIds);
    captured.forEach(c => onConfirmCallStudent?.(c.id));
  };

  // Bắt lượt tiếp theo
  const handlePickNextRound = () => {
    setShowAbductedModal(false);
    setIsRunning(true);
  };

  // Thả về và bắt lại
  const handleRestartCurrentRound = () => {
    setShowAbductedModal(false);
    // Bỏ các ID vừa bắt khỏi danh sách calledIds
    const currentCapturedIds = abductedStudents.map(s => s.id);
    setCalledIds(prev => prev.filter(id => !currentCapturedIds.includes(id)));
    setIsRunning(true);
  };

  // Chuyển đổi âm thanh
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    ufoAudio.setMuted(nextMuted);
  };

  // Toàn màn hình
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Lưu lớp học
  const handleSaveClass = (classId, updatedStudents) => {
    const updated = classes.map(c =>
      c.id === classId ? { ...c, students: updatedStudents } : c
    );
    setClasses(updated);
    saveUfoClasses(updated);
  };

  // Tạo lớp mới
  const handleCreateNewClass = (newClass) => {
    const updated = [...classes, newClass];
    setClasses(updated);
    setCurrentClassId(newClass.id);
    saveUfoClasses(updated);
  };

  // Xóa lớp
  const handleDeleteClass = (classId) => {
    const updated = classes.filter(c => c.id !== classId);
    setClasses(updated);
    if (currentClassId === classId && updated.length > 0) {
      setCurrentClassId(updated[0].id);
    }
    saveUfoClasses(updated);
  };

  // Gán avatar cắt cho học sinh
  const handleAssignAvatar = (studentId, avatarDataUrl) => {
    const updated = classes.map(c => {
      if (c.id === currentClassId) {
        return {
          ...c,
          students: c.students.map(s =>
            s.id === studentId ? { ...s, avatar: avatarDataUrl } : s
          )
        };
      }
      return c;
    });
    setClasses(updated);
    saveUfoClasses(updated);
  };

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#070c1b] select-none text-white animate-fade-in"
    >
      {/* Top Header Bar mỏng nhẹ có nút Đóng */}
      <div className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        {/* Logo / Badge tiêu đề Game */}
        <div className="pointer-events-auto flex items-center space-x-2.5 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/70 shadow-lg">
          <span className="text-xl">🛸</span>
          <span className="font-black text-sm tracking-wide bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            ĐƯỜNG ĐUA UFO
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
            PRO 4.0
          </span>
        </div>

        {/* Nút thoát */}
        <button
          onClick={onClose}
          className="pointer-events-auto p-2 rounded-full bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition-all shadow-lg active:scale-95"
          title="Đóng trò chơi (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sân chơi chính: Thành phố & Đĩa bay & Học sinh */}
      <div className="relative flex-1 w-full h-full">
        <UfoArena
          students={activeStudents}
          pickCount={pickCount}
          isRunning={isRunning}
          onCompleteCapture={handleCompleteCapture}
          calledStudentIds={calledIds}
        />
      </div>

      {/* Thanh điều khiển dưới đáy */}
      <UfoBottomBar
        isRunning={isRunning}
        onToggleStart={handleToggleStart}
        pickCount={pickCount}
        onSelectPickCount={setPickCount}
        currentClassName={activeClass.name}
        studentCount={activeStudents.length}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Modal Cài đặt & Danh sách học sinh */}
      <UfoSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        classes={classes}
        currentClassId={currentClassId}
        onSelectClass={setCurrentClassId}
        onSaveClass={handleSaveClass}
        onDeleteClass={handleDeleteClass}
        onCreateNewClass={handleCreateNewClass}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveUfoSettings(newSettings);
        }}
        onOpenPhotoCrop={() => {
          setShowSettings(false);
          setShowPhotoCrop(true);
        }}
      />

      {/* Modal Công bố học sinh bị đĩa bay bắt */}
      <UfoAbductedModal
        isOpen={showAbductedModal}
        abductedStudents={abductedStudents}
        onClose={() => setShowAbductedModal(false)}
        onPickNextRound={handlePickNextRound}
        onRestartCurrentRound={handleRestartCurrentRound}
      />

      {/* Modal Cắt ảnh tập thể */}
      <PhotoCropModal
        isOpen={showPhotoCrop}
        onClose={() => setShowPhotoCrop(false)}
        students={activeStudents}
        onAssignStudentAvatar={handleAssignAvatar}
      />
    </div>
  );
};

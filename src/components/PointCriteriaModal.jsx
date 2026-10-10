import React from 'react';
import { PointModal } from '../features/behavior/components/PointModal';

export const PointCriteriaModal = ({
  isOpen,
  onClose,
  student,
  allStudents = [],
  onConfirmPointChange,
  onUpdateAvatar,
  onToggleGender
}) => {
  if (!isOpen || !student) return null;

  const handleApplyPointChange = (stId, pts, type, reason) => {
    onConfirmPointChange?.(student, pts, reason, type === 'plus' ? 'add' : 'deduct');
  };

  const handleDirectAdjustPoint = (stId, type, delta) => {
    const pts = Math.abs(delta);
    const action = delta > 0 ? (type === 'plus' ? 'add' : 'deduct') : (type === 'plus' ? 'deduct' : 'add');
    onConfirmPointChange?.(student, pts, 'Điều chỉnh điểm trực tiếp', action);
  };

  return (
    <PointModal
      isOpen={isOpen}
      onClose={onClose}
      student={student}
      allStudents={allStudents.length > 0 ? allStudents : [student]}
      onApplyPointChange={handleApplyPointChange}
      onDirectAdjustPoint={handleDirectAdjustPoint}
      onResetPoints={() => {
        onConfirmPointChange?.(student, student.total_stars || 0, 'Reset điểm về 0', 'deduct');
      }}
      onConvertReward={(stId, type, pts) => {
        onConfirmPointChange?.(student, pts, `Quy đổi ${type === 'kttx' ? 'KTTX' : 'Sao'}`, 'deduct');
      }}
      onToggleGender={onToggleGender}
      onUpdateAvatar={onUpdateAvatar}
    />
  );
};

import React, { useState } from 'react';
import { StudentCard } from './StudentCard';
import { soundFx } from '../utils/soundEffects';
import { Grid, Monitor, Layers } from 'lucide-react';

export const SeatingGrid = ({
  students = [],
  onMoveStudentSeat,
  onAddPoints,
  onDeductPoints,
  onOpenRewardShop,
  onSelectStudent,
  onOpenAvatarModal
}) => {
  const [dragOverCell, setDragOverCell] = useState(null);

  // Classroom Grid Layout: 4 Hàng, 6 Cột bàn học THCS
  const rows = [1, 2, 3, 4];
  const cols = [1, 2, 3, 4, 5, 6];

  const handleDragOver = (e, row, col) => {
    e.preventDefault();
    setDragOverCell(`${row}-${col}`);
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
    setDragOverCell(null);
    const studentId = e.dataTransfer.getData('text/plain');
    if (!studentId) return;

    soundFx.playClick();
    onMoveStudentSeat(studentId, targetRow, targetCol);
  };

  // Map student position
  const getStudentAtSeat = (row, col) => {
    return students.find(s => Number(s.seat_row) === row && Number(s.seat_col) === col);
  };

  // Unseated students
  const unseatedStudents = students.filter(
    s => !s.seat_row || !s.seat_col || s.seat_row > 4 || s.seat_col > 6
  );

  return (
    <div className="space-y-6">
      
      {/* Teacher Podium Indicator (Bảng đen / Bàn Giáo viên) */}
      <div className="w-full max-w-2xl mx-auto bg-gradient-to-r from-mint-600 via-mint-500 to-mint-600 text-white py-2.5 rounded-2xl shadow-mint-glow text-center flex items-center justify-center space-x-2 font-bold text-sm tracking-wide">
        <Monitor className="w-4 h-4 text-mint-200" />
        <span>BẢNG ĐEN / BÀN GIÁO VIÊN CHỦ NHIỆM (ĐẦU LỚP)</span>
      </div>

      {/* Classroom Desk Grid */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-mint-100 shadow-soft overflow-x-auto">
        <div className="min-w-[700px] grid grid-cols-6 gap-4">
          {rows.map(r => (
            <React.Fragment key={`row-${r}`}>
              {cols.map(c => {
                const cellKey = `${r}-${c}`;
                const student = getStudentAtSeat(r, c);
                const isOver = dragOverCell === cellKey;

                return (
                  <div
                    key={cellKey}
                    onDragOver={(e) => handleDragOver(e, r, c)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, r, c)}
                    className={`min-h-[160px] rounded-2xl p-1.5 transition-all flex flex-col justify-center ${
                      student
                        ? 'bg-transparent'
                        : isOver
                        ? 'bg-mint-100 border-2 border-dashed border-mint-500 scale-105'
                        : 'bg-mint-50/40 border-2 border-dashed border-mint-200/80 hover:bg-mint-50/80'
                    }`}
                  >
                    {student ? (
                      <StudentCard
                        student={student}
                        onAddPoints={onAddPoints}
                        onDeductPoints={onDeductPoints}
                        onOpenRewardShop={onOpenRewardShop}
                        onSelectStudent={onSelectStudent}
                        onOpenAvatarModal={onOpenAvatarModal}
                        isDragOver={isOver}
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-300">
                        <Grid className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-[11px] font-semibold block text-slate-400">
                          Bàn H{r}-C{c}
                        </span>
                        <span className="text-[10px] text-slate-300">Kéo HS vào đây</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Unseated Students Tray */}
      {unseatedStudents.length > 0 && (
        <div className="bg-coral-50/50 rounded-3xl p-5 border border-coral-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-coral-800 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-coral-500" />
              <span>Học sinh chưa xếp chỗ ({unseatedStudents.length})</span>
            </h4>
            <span className="text-xs text-coral-600">Kéo thả vào ô bàn học ở sơ đồ trên</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {unseatedStudents.map(st => (
              <StudentCard
                key={st.id}
                student={st}
                onAddPoints={onAddPoints}
                onDeductPoints={onDeductPoints}
                onOpenRewardShop={onOpenRewardShop}
                onSelectStudent={onSelectStudent}
                onOpenAvatarModal={onOpenAvatarModal}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

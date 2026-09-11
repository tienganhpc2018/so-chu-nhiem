import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { soundFx } from '../../utils/soundEffects';
import { AssessmentHeader } from './components/AssessmentHeader';
import { AssessmentTable } from './components/AssessmentTable';
import { AiCommentModal } from './components/AiCommentModal';
import { ConfigAssessmentModal } from './components/ConfigAssessmentModal';
import { ImportGradesModal } from './components/ImportGradesModal';
import { calculateTBM, classifyPerformance } from './utils/gradeCalculations';
import { generateStudentComment } from './utils/aiCommentGenerator';

export const AssessmentPage = ({
  currentClass,
  classes = [],
  students = [],
  onSelectClass,
  onOpenQuickAddStudents
}) => {
  const [currentSubject, setCurrentSubject] = useState('Tiếng Anh');
  const [semester, setSemester] = useState('HKI');
  const [schoolName, setSchoolName] = useState(() => {
    return localStorage.getItem('assessment_school_name') || 'TRƯỜNG THCS ĐỀ GI';
  });
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [numTxCols, setNumTxCols] = useState(4);
  const [isCompact, setIsCompact] = useState(false);
  const [gradesData, setGradesData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Modals state
  const [modalState, setModalState] = useState({
    config: false,
    aiComment: false,
    importGrades: false
  });

  const openModal = (name) => setModalState(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModalState(prev => ({ ...prev, [name]: false }));

  // Storage key helper
  const getStorageKey = () => {
    const cid = currentClass?.id || 'default_class';
    return `subject_evaluations_${cid}_${encodeURIComponent(currentSubject)}_${semester}`;
  };

  // Load grades on class / subject / semester change
  useEffect(() => {
    if (!currentClass) {
      setGradesData({});
      return;
    }

    const key = getStorageKey();
    let loaded = {};

    // 1. Check LocalStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored) loaded = JSON.parse(stored);
    } catch (e) {}

    // 2. Query Supabase (if table exists)
    (async () => {
      try {
        const { data, error } = await supabase
          .from('subject_evaluations')
          .select('*')
          .eq('class_id', currentClass.id)
          .eq('subject', currentSubject)
          .eq('semester', semester);

        if (data && data.length > 0) {
          const dbMap = {};
          data.forEach(row => {
            dbMap[row.student_id] = {
              tx1: row.tx1,
              tx2: row.tx2,
              tx3: row.tx3,
              tx4: row.tx4,
              gk: row.gk,
              ck: row.ck,
              comment: row.comment
            };
          });
          loaded = { ...loaded, ...dbMap };
        }
      } catch (err) {}

      setGradesData(loaded);
    })();
  }, [currentClass, currentSubject, semester]);

  // Update a single score or comment
  const handleUpdateGrade = (studentId, field, value) => {
    setGradesData(prev => {
      const prevRow = prev[studentId] || {};
      const updated = {
        ...prev,
        [studentId]: {
          ...prevRow,
          [field]: value
        }
      };

      // Auto-save to LocalStorage
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      } catch (e) {}

      return updated;
    });
  };

  // Instant AI comment for single student
  const handleQuickAiCommentStudent = (student, scoresWithTbm) => {
    const comment = generateStudentComment(student, scoresWithTbm, currentSubject, 'standard');
    handleUpdateGrade(student.id, 'comment', comment);
  };

  // Batch AI comments for whole class
  const handleApplyAiComments = ({ scope, style }) => {
    setGradesData(prev => {
      const updated = { ...prev };

      students.forEach(st => {
        const currentScore = updated[st.id] || {};
        if (scope === 'empty_only' && currentScore.comment && currentScore.comment.trim().length > 0) {
          return;
        }

        const txValues = Array.from({ length: numTxCols }, (_, i) => currentScore[`tx${i + 1}`]);
        const tbm = calculateTBM(txValues, currentScore.gk, currentScore.ck);

        const comment = generateStudentComment(st, { ...currentScore, tbm }, currentSubject, style);
        updated[st.id] = {
          ...currentScore,
          comment
        };
      });

      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      } catch (e) {}

      return updated;
    });
  };

  // Bulk import from Excel modal
  const handleImportGrades = (importedMap) => {
    setGradesData(prev => {
      const updated = { ...prev, ...importedMap };
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Save to DB and LocalStorage
  const handleSave = async () => {
    soundFx.playClick();
    setIsSaving(true);

    try {
      // 1. Save to LocalStorage
      localStorage.setItem(getStorageKey(), JSON.stringify(gradesData));

      // 2. Save to Supabase (if online)
      if (currentClass?.id) {
        const payload = Object.keys(gradesData).map(studentId => {
          const row = gradesData[studentId];
          const txValues = Array.from({ length: numTxCols }, (_, i) => row[`tx${i + 1}`]);
          const tbm = calculateTBM(txValues, row.gk, row.ck);

          return {
            student_id: studentId,
            class_id: currentClass.id,
            subject: currentSubject,
            semester: semester,
            tx1: row.tx1 !== '' && !isNaN(Number(row.tx1)) ? Number(row.tx1) : null,
            tx2: row.tx2 !== '' && !isNaN(Number(row.tx2)) ? Number(row.tx2) : null,
            tx3: row.tx3 !== '' && !isNaN(Number(row.tx3)) ? Number(row.tx3) : null,
            tx4: row.tx4 !== '' && !isNaN(Number(row.tx4)) ? Number(row.tx4) : null,
            gk: row.gk !== '' && !isNaN(Number(row.gk)) ? Number(row.gk) : null,
            ck: row.ck !== '' && !isNaN(Number(row.ck)) ? Number(row.ck) : null,
            tbm: tbm,
            comment: row.comment || ''
          };
        });

        if (payload.length > 0) {
          try {
            await supabase.from('subject_evaluations').upsert(payload);
          } catch (e) {}
        }
      }

      soundFx.playCorrect();
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Export to standard CSV/Excel format
  const handleExportExcel = () => {
    soundFx.playClick();
    if (!currentClass || students.length === 0) {
      alert('Chưa có học sinh trong lớp để xuất bảng điểm.');
      return;
    }

    let csv = `\uFEFF${schoolName}\n`;
    csv += `SỔ ĐÁNH GIÁ MÔN HỌC - MÔN: ${currentSubject.toUpperCase()} - HỌC KỲ: ${semester} - NĂM HỌC: ${academicYear}\n`;
    csv += `Lớp: ${currentClass.name} - Sĩ số: ${students.length} học sinh\n\n`;

    const txHeaders = Array.from({ length: numTxCols }, (_, i) => `ĐĐG TX ${i + 1}`).join(',');
    csv += `STT,Họ và tên,Ngày sinh,Mã học sinh,${txHeaders},ĐĐG GK,ĐĐG CK,TBM ${semester},Xếp loại,Nhận xét ${semester}\n`;

    students.forEach((st, idx) => {
      const row = gradesData[st.id] || {};
      const txValues = Array.from({ length: numTxCols }, (_, i) => row[`tx${i + 1}`]);
      const tbm = calculateTBM(txValues, row.gk, row.ck);
      const perf = classifyPerformance(tbm);

      const dob = st.birth_date || '2014';
      const code = st.code || `HS${String(idx + 1).padStart(2, '0')}`;
      const txColsStr = txValues.map(v => (v !== undefined && v !== null ? v : '')).join(',');
      const gk = row.gk !== undefined && row.gk !== null ? row.gk : '';
      const ck = row.ck !== undefined && row.ck !== null ? row.ck : '';
      const tbmStr = tbm !== null ? tbm.toFixed(1) : '';
      const commentSafe = `"${(row.comment || '').replace(/"/g, '""')}"`;

      csv += `${idx + 1},"${st.full_name}",${dob},${code},${txColsStr},${gk},${ck},${tbmStr},"${perf.label}",${commentSafe}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `BangDiem_${currentSubject}_Lop_${currentClass.name}_${semester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundFx.playCorrect();
  };

  return (
    <div className="space-y-4 pb-16 animate-in fade-in">
      
      {/* 1. Header Toolbar matching user photo */}
      <AssessmentHeader
        schoolName={schoolName}
        academicYear={academicYear}
        classes={classes}
        currentClass={currentClass}
        onSelectClass={onSelectClass}
        currentSubject={currentSubject}
        onSelectSubject={setCurrentSubject}
        semester={semester}
        onSelectSemester={setSemester}
        isCompact={isCompact}
        onToggleCompact={() => setIsCompact(!isCompact)}
        onOpenConfig={() => openModal('config')}
        onOpenAiComment={() => openModal('aiComment')}
        onOpenImport={() => openModal('importGrades')}
        onExportExcel={handleExportExcel}
        onSave={handleSave}
        isSaving={isSaving}
        lastSavedTime={lastSavedTime}
      />

      {/* 2. Main Assessment Table */}
      <AssessmentTable
        students={students}
        gradesData={gradesData}
        numTxCols={numTxCols}
        onUpdateGrade={handleUpdateGrade}
        onQuickAiCommentStudent={handleQuickAiCommentStudent}
        onOpenQuickAddStudents={onOpenQuickAddStudents}
        semester={semester}
      />

      {/* 3. MODALS */}

      {/* AI Comment Modal */}
      <AiCommentModal
        isOpen={modalState.aiComment}
        onClose={() => closeModal('aiComment')}
        currentSubject={currentSubject}
        totalStudents={students.length}
        onApplyAiComments={handleApplyAiComments}
      />

      {/* Config Modal */}
      <ConfigAssessmentModal
        isOpen={modalState.config}
        onClose={() => closeModal('config')}
        schoolName={schoolName}
        numTxCols={numTxCols}
        academicYear={academicYear}
        onSaveConfig={({ schoolName: newName, numTxCols: newCols, academicYear: newYear }) => {
          setSchoolName(newName);
          setNumTxCols(newCols);
          setAcademicYear(newYear);
          localStorage.setItem('assessment_school_name', newName);
        }}
      />

      {/* Import Modal */}
      <ImportGradesModal
        isOpen={modalState.importGrades}
        onClose={() => closeModal('importGrades')}
        students={students}
        numTxCols={numTxCols}
        onImportGrades={handleImportGrades}
      />

    </div>
  );
};

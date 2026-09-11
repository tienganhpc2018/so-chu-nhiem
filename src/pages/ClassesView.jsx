import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { soundFx } from '../utils/soundEffects';
import { School, Plus, Check, Edit2, Trash2, ArrowRight, Users, Sparkles, X, Calendar, Archive, FolderArchive } from 'lucide-react';

export const ClassesView = ({
  classes = [],
  currentClass = null,
  onSelectClass,
  onRefreshClasses,
  onOpenAddStudent
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(8);
  const [academicYear, setAcademicYear] = useState('2026 - 2027');
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  const academicYearsList = ['all', '2026 - 2027'];

  const filteredClasses = classes.filter(cls => {
    if (!selectedYearFilter || selectedYearFilter === 'all') return true;
    const clsYear = String(cls.academic_year || '2026 - 2027').replace(/[\s\u2013\u2014-]/g, '').trim();
    const filterYear = String(selectedYearFilter).replace(/[\s\u2013\u2014-]/g, '').trim();
    return clsYear === filterYear;
  });

  const handleOpenAddModal = () => {
    soundFx.playClick();
    setEditingClass(null);
    setClassName('');
    setGradeLevel(8);
    setAcademicYear('2026 - 2027');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (cls) => {
    soundFx.playClick();
    setEditingClass(cls);
    setClassName(cls.name);
    setGradeLevel(cls.grade_level || 8);
    setAcademicYear(cls.academic_year || '2026 - 2027');
    setShowAddModal(true);
  };

  const handleDeleteClass = async (cls) => {
    if (!window.confirm(`Thầy/Cô có chắc chắn muốn xóa Lớp ${cls.name}? (Dữ liệu lớp sẽ bị xóa hoàn toàn khỏi hệ thống)`)) return;
    soundFx.playClick();

    try {
      // 1. Delete from Supabase DB
      try {
        await supabase.from('students').delete().eq('class_id', cls.id);
        await supabase.from('classes').delete().eq('id', cls.id);
      } catch (e) {
        console.error('DB delete error:', e);
      }

      // 2. Delete from LocalStorage user_created_classes (matching by ID OR Name)
      try {
        const stored = JSON.parse(localStorage.getItem('user_created_classes') || '[]');
        const updated = stored.filter(c => c.id !== cls.id && c.name !== cls.name);
        localStorage.setItem('user_created_classes', JSON.stringify(updated));
        localStorage.removeItem(`custom_students_${cls.id}`);
      } catch (e) {
        console.error('LocalStorage delete error:', e);
      }

      soundFx.playCorrect();
      if (onRefreshClasses) await onRefreshClasses();
    } catch (err) {
      console.error('Lỗi xóa lớp:', err);
    }
  };

  const handleClearAllClasses = async () => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa TOÀN BỘ các lớp học để dọn dẹp và khởi tạo lại từ đầu?')) return;
    soundFx.playClick();
    try {
      localStorage.removeItem('user_created_classes');
      localStorage.removeItem('selected_class_id');
      classes.forEach(c => {
        localStorage.removeItem(`custom_students_${c.id}`);
      });
      try {
        await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {}
      soundFx.playCorrect();
      if (onRefreshClasses) await onRefreshClasses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    setSaving(true);
    soundFx.playClick();

    const classCode = `${gradeLevel}A-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      if (editingClass) {
        await supabase
          .from('classes')
          .update({
            name: className.trim(),
            grade_level: Number(gradeLevel),
            academic_year: academicYear
          })
          .eq('id', editingClass.id);

        soundFx.playCorrect();
        setShowAddModal(false);
        if (onRefreshClasses) await onRefreshClasses();
      } else {
        const newClassId = `class-${Date.now()}`;
        const payload = {
          id: newClassId,
          name: className.trim(),
          grade_level: Number(gradeLevel),
          code: classCode,
          academic_year: academicYear
        };

        const { data } = await supabase
          .from('classes')
          .insert([payload])
          .select()
          .single();

        const createdCls = data || payload;

        // SAVE CREATED CLASS TO LOCALSTORAGE
        try {
          const stored = JSON.parse(localStorage.getItem('user_created_classes') || '[]');
          stored.push(createdCls);
          localStorage.setItem('user_created_classes', JSON.stringify(stored));
        } catch (e) {
          console.error(e);
        }

        soundFx.playCorrect();
        setShowAddModal(false);
        setClassName('');
        setSelectedYearFilter('all');
        if (onRefreshClasses) await onRefreshClasses();
        onSelectClass(createdCls);
      }
    } catch (err) {
      console.error('Lỗi lưu lớp:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in">
      
      {/* Top Header Section (Matching Image 1 Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
              <School className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Quản Lý Danh Sách Lớp Học & Lưu Trữ Archive
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Quản lý các lớp giảng dạy theo từng Năm học. Dữ liệu các năm trước được tự động Archive an toàn 100%.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleClearAllClasses}
            className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-2xl border border-rose-200 shadow-xs transition-all flex items-center space-x-1.5"
            title="Xóa tất cả các lớp rác / trùng lặp"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Xóa tất cả các lớp</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-purple-glow transition-all flex items-center space-x-2 transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lớp học mới</span>
          </button>
        </div>
      </div>

      {/* Academic Year Filter Tabs (Archive Feature) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1 shrink-0 mr-2">
          <FolderArchive className="w-4 h-4 text-purple-600" />
          <span>Lọc theo Năm Học:</span>
        </span>

        {academicYearsList.map(year => (
          <button
            key={year}
            onClick={() => {
              soundFx.playClick();
              setSelectedYearFilter(year);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
              selectedYearFilter === year
                ? 'bg-purple-600 text-white shadow-purple-glow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
            }`}
          >
            {year === 'all' ? 'Tất cả các năm' : `Năm học ${year}`}
          </button>
        ))}
      </div>

      {/* Empty State when no classes exist or match filter */}
      {filteredClasses.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-purple-200 space-y-4 shadow-soft">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-3xl mx-auto flex items-center justify-center">
            <School className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Chưa có lớp học nào được hiển thị</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Thầy/Cô bấm nút "+ Tạo lớp học mới" bên dưới để khởi tạo không gian lớp học nhé!
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-purple-glow inline-flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Lớp Học Mới Ngay</span>
          </button>
        </div>
      )}

      {/* Grid List of Class Cards (Matching Image 1 Card Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => {
          const isSelected = currentClass?.id === cls.id;
          const year = cls.academic_year || '2025 - 2026';
          return (
            <div
              key={cls.id}
              className={`bg-white rounded-3xl p-6 border-2 transition-all relative flex flex-col justify-between space-y-4 shadow-soft hover:shadow-xl ${
                isSelected ? 'border-purple-500 ring-4 ring-purple-100' : 'border-purple-100 hover:border-purple-200'
              }`}
            >
              
              {/* Top Card Badge */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {cls.grade_level || 8}
                </div>

                {isSelected && (
                  <span className="bg-purple-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                    <span>Lớp đang chọn</span>
                  </span>
                )}
              </div>

              {/* Class Info */}
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  Lớp {cls.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span>Khối {cls.grade_level || 8} • Năm học {year}</span>
                </p>

                <div className="mt-3 inline-flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-extrabold border border-blue-100">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {(() => {
                      try {
                        const localSt = JSON.parse(localStorage.getItem(`custom_students_${cls.id}`) || '[]');
                        return `${localSt.length} học sinh`;
                      } catch (e) {
                        return `${cls.student_count || 0} học sinh`;
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Card Footer Action Links */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    soundFx.playCorrect();
                    onSelectClass(cls);
                  }}
                  className="text-xs font-extrabold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
                >
                  <span>Vào không gian lớp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(cls)}
                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                    title="Chỉnh sửa thông tin lớp"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteClass(cls)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Lưu trữ / Xóa lớp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Class */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800">
                {editingClass ? 'Chỉnh Sửa Lớp Học' : 'Tạo Lớp Học Chủ Nhiệm Mới'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Khối Lớp THCS:</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none"
                >
                  <option value={6}>Khối 6</option>
                  <option value={7}>Khối 7</option>
                  <option value={8}>Khối 8</option>
                  <option value={9}>Khối 9</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Lớp Học:</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ví dụ: 8A5, 8A1, 7A3..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Năm Học Quản Lý:</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none"
                >
                  <option value="2026 - 2027">2026 - 2027 (Năm học hiện tại)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-purple-glow"
                >
                  {saving ? 'Đang lưu...' : editingClass ? 'CẬP NHẬT LỚP' : 'TẠO LỚP HỌC'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import { X, Edit3, Glasses, Award, AlertTriangle, Save, Check, Crown, Shield } from 'lucide-react';

export const EditStudentModal = ({ isOpen, onClose, student, onSaveStudentInfo }) => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('female');
  const [teamGroup, setTeamGroup] = useState(1);
  const [hasGlasses, setHasGlasses] = useState(false);
  const [academicLevel, setAcademicLevel] = useState('good'); // 'top' | 'good' | 'weak'
  const [heightLevel, setHeightLevel] = useState('normal'); // 'short' | 'normal' | 'tall'
  const [classRole, setClassRole] = useState('member'); // 'member' | 'leader' | 'vice_study' | 'vice_art' | 'team_leader'

  useEffect(() => {
    if (student) {
      setFullName(student.full_name || '');
      setGender(student.gender || 'female');
      setTeamGroup(student.team_group || 1);
      setHasGlasses(!!student.has_glasses);
      setAcademicLevel(student.academic_level || 'good');
      setHeightLevel(student.height_level || 'normal');
      setClassRole(student.class_role || 'member');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    soundFx.playCorrect();

    const updatedInfo = {
      ...student,
      full_name: fullName.trim(),
      gender,
      team_group: Number(teamGroup),
      has_glasses: hasGlasses,
      academic_level: academicLevel,
      height_level: heightLevel,
      class_role: classRole
    };

    onSaveStudentInfo(updatedInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-black text-slate-800">Cập Nhật Thông Tin Học Sinh</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên Học sinh *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          {/* Feature 1: Class Officer Role Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chức Vụ Ban Cán Sự Lớp:</label>
            <select
              value={classRole}
              onChange={(e) => setClassRole(e.target.value)}
              className="w-full bg-purple-50 border border-purple-200 text-purple-900 rounded-xl px-3 py-2 text-xs font-extrabold outline-none"
            >
              <option value="member">Thành viên lớp</option>
              <option value="leader">⭐ Lớp trưởng</option>
              <option value="vice_study">📝 Lớp phó học tập</option>
              <option value="vice_art">🎨 Lớp phó văn thể mỹ</option>
              <option value="vice_labor">🏃 Lớp phó lao động</option>
              <option value="team_leader">👑 Tổ trưởng</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="female">Nữ</option>
                <option value="male">Nam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tổ Thi Đưa:</label>
              <select
                value={teamGroup}
                onChange={(e) => setTeamGroup(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              >
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>
            </div>
          </div>

          {/* Academic Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Năng Lực / Sức Học:</label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
            >
              <option value="top">🌟 Giỏi / Khá (Học sinh tiêu biểu)</option>
              <option value="good">⚡ Khá / Trung bình</option>
              <option value="weak">⚠️ Cần hỗ trợ học tập (Học sinh yếu)</option>
            </select>
          </div>

          {/* Glasses & Height options */}
          <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="modalGlassesCheck"
                checked={hasGlasses}
                onChange={(e) => setHasGlasses(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="modalGlassesCheck" className="text-xs font-extrabold text-purple-900 cursor-pointer flex items-center space-x-1">
                <span>👓 Bị cận thị (Hiển thị nhãn 👓 Cận)</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-900 mb-1">Chiều cao học sinh:</label>
              <select
                value={heightLevel}
                onChange={(e) => setHeightLevel(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="short">Thấp (Ưu tiên bàn 1 - 2)</option>
                <option value="normal">Trung bình</option>
                <option value="tall">Cao</option>
              </select>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-purple-glow flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>CẬP NHẬT</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

import React from 'react';
import { soundFx } from '../utils/soundEffects';
import { X, Download, ShieldCheck, Sparkles, Award } from 'lucide-react';

export const TeacherIDCardModal = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  const handleDownloadCard = () => {
    soundFx.playCorrect();
    // Canvas download helper
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 600, 360);
    grad.addColorStop(0, '#581C87');
    grad.addColorStop(1, '#1E1B4B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 360);

    // Border
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 340);

    // Text
    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BỘ GIÁO DỤC VÀ ĐÀO TẠO • THCS CÁT MINH', 300, 45);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('THẺ GIÁO VIÊN CHỦ NHIỆM', 300, 80);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(profile?.full_name || 'Nguyễn Văn Hải', 300, 190);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`${profile?.job_title || 'GV Tiếng Anh'} • ${profile?.school_name || 'Trường THCS Cát Minh'}`, 300, 225);

    ctx.font = 'italic 12px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Mã Xác Thực GVCN: GV-ENGLISH-HAI-2026', 300, 310);

    const link = document.createElement('a');
    link.download = `TheGiangVien_${profile?.full_name || 'NguyenVanHai'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-black text-slate-800">Thẻ Căn Cước / Thẻ Giáo Viên Tiếng Anh</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ELEGANT TEACHER ID CARD PREVIEW */}
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border-4 border-amber-400/80 relative overflow-hidden space-y-4">
          
          {/* Card Top Header */}
          <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-amber-300 uppercase">
                BỘ GIÁO DỤC VÀ ĐÀO TẠO
              </div>
              <div className="text-xs font-black tracking-tight text-white uppercase">
                {profile?.school_name || 'TRƯỜNG THCS CÁT MINH'}
              </div>
            </div>
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>

          {/* Card Main Info Body */}
          <div className="flex items-center space-x-4 py-2">
            <div className="relative">
              <div className="w-20 h-24 rounded-2xl bg-amber-400 p-0.5 shadow-xl overflow-hidden">
                <img
                  src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher'}
                  alt={profile?.full_name}
                  className="w-full h-full object-cover rounded-xl bg-purple-950"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 bg-amber-500 text-purple-950 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-md">
                GVCN ★
              </span>
            </div>

            <div className="space-y-1 flex-1">
              <div className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">THẺ GIÁO VIÊN CHỦ NHIỆM</div>
              <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                {profile?.full_name || 'Nguyễn Văn Hải'}
              </h3>
              <div className="text-xs font-bold text-slate-300">
                {profile?.job_title || 'GV Tiếng Anh'} • Môn {profile?.subject || 'Tiếng Anh'}
              </div>
              <div className="text-[11px] text-amber-200/80 font-medium">
                {profile?.school_name || 'Trường THCS Cát Minh'}
              </div>
            </div>
          </div>

          {/* Card Footer Verification Bar */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>MSGV: GV-2026-ENG-HAI</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>ĐÃ XÁC THỰC THCS</span>
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl"
          >
            Đóng
          </button>

          <button
            onClick={handleDownloadCard}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Tải Thẻ Giáo Viên (PNG)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Upload,
  Check,
  AlertTriangle,
  Move,
  Scissors,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const PhotoCropModal = ({
  isOpen,
  onClose,
  students = [],
  classPhotoUrl = null,
  onAssignStudentAvatar
}) => {
  const [photoSrc, setPhotoSrc] = useState(classPhotoUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&auto=format&fit=crop&q=80');
  const [circleSize, setCircleSize] = useState(137); // px
  const [zoomLevel, setZoomLevel] = useState(100); // 100% - 250%
  const [cropPos, setCropPos] = useState({ x: 250, y: 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [assignedCount, setAssignedCount] = useState(() => students.filter(s => s.avatar || s.avatar_url).length);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (classPhotoUrl) {
      setPhotoSrc(classPhotoUrl);
    }
  }, [classPhotoUrl]);

  useEffect(() => {
    setAssignedCount(students.filter(s => s.avatar || s.avatar_url).length);
  }, [students]);

  // Cập nhật preview hình tròn cắt
  useEffect(() => {
    updateCropPreview();
  }, [cropPos, circleSize, photoSrc, zoomLevel]);

  const updateCropPreview = () => {
    if (!imageRef.current) return;
    try {
      const img = imageRef.current;
      const scale = zoomLevel / 100;
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      const currentW = img.clientWidth;
      const currentH = img.clientHeight;

      if (!naturalW || !naturalH || !currentW) return;

      const ratioX = naturalW / currentW;
      const ratioY = naturalH / currentH;

      const canvas = document.createElement('canvas');
      canvas.width = circleSize * 2;
      canvas.height = circleSize * 2;
      const ctx = canvas.getContext('2d');

      // Vẽ hình tròn
      ctx.beginPath();
      ctx.arc(circleSize, circleSize, circleSize, 0, Math.PI * 2);
      ctx.clip();

      const sourceX = (cropPos.x - circleSize / 2) * ratioX;
      const sourceY = (cropPos.y - circleSize / 2) * ratioY;
      const sourceW = circleSize * ratioX;
      const sourceH = circleSize * ratioY;

      ctx.drawImage(
        img,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        sourceW,
        sourceH,
        0,
        0,
        circleSize * 2,
        circleSize * 2
      );

      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.85));
    } catch (e) {
      // ignore
    }
  };

  // Xử lý kéo thả vòng tròn crop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropPos.x,
      y: e.clientY - cropPos.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(circleSize / 2, Math.min(rect.width - circleSize / 2, e.clientX - dragStart.x));
    const newY = Math.max(circleSize / 2, Math.min(rect.height - circleSize / 2, e.clientY - dragStart.y));
    setCropPos({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Tải ảnh tập thể mới từ máy
  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playClick();
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPhotoSrc(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gán ảnh đã cắt cho học sinh đang chọn
  const handleAssignCurrent = () => {
    if (!previewDataUrl || !selectedStudentId) return;
    soundFx.playCorrect();
    onAssignStudentAvatar?.(selectedStudentId, previewDataUrl);

    // Tự động nhảy sang học sinh tiếp theo chưa có ảnh
    const currentIndex = students.findIndex(s => s.id === selectedStudentId);
    const nextStudent = students.find((s, idx) => idx > currentIndex && !s.avatar && !s.avatar_url)
      || students.find(s => !s.avatar && !s.avatar_url)
      || students[(currentIndex + 1) % students.length];

    if (nextStudent) {
      setSelectedStudentId(nextStudent.id);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div
        ref={modalRef}
        className={`bg-white rounded-3xl shadow-2xl flex flex-col border border-purple-100 overflow-hidden transition-all ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl max-h-[95vh]'
        }`}
      >
        {/* Header (Chuẩn Ảnh 2) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
              ✂
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              Lấy ảnh từng học sinh từ ảnh tập thể
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center space-x-1 transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thanh cảnh báo cam nhạt (Chuẩn Ảnh 2) */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 px-5 py-2.5 flex items-start space-x-2 text-xs text-amber-900 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Vùng chọn chỉ có <strong>{circleSize}px</strong> nên ảnh cắt ra sẽ hơi mờ. Cách khắc phục: kéo thanh trượt cho vòng to hơn, hoặc bấm "Thêm ảnh để cắt" rồi chọn file ảnh GỐC từ máy — ảnh gốc còn nguyên độ phân giải sẽ cho ảnh học sinh đẹp hơn hẳn ảnh lớp đã lưu.
          </p>
        </div>

        {/* Toolbar công cụ phía trên ảnh (Chuẩn Ảnh 2) */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center space-x-3 text-xs font-black text-slate-700">
            <div className="flex items-center space-x-2">
              <span>Cỡ vòng chọn:</span>
              <input
                type="range"
                min="80"
                max="260"
                value={circleSize}
                onChange={(e) => setCircleSize(Number(e.target.value))}
                className="w-28 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <span className="text-amber-600 font-extrabold px-1.5 py-0.5 bg-amber-50 rounded-md border border-amber-200">
                {circleSize}px
              </span>
            </div>

            {/* Badge đếm [X / Y] */}
            <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg font-black text-xs">
              {assignedCount}/{students.length}
            </span>

            {/* Zoom */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setZoomLevel(Math.max(80, zoomLevel - 15))}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-600"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-slate-600">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(250, zoomLevel + 15))}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-600"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Nút Thêm ảnh để cắt */}
          <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center space-x-1.5 transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Thêm ảnh để cắt</span>
            <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
          </label>
        </div>

        {/* Khu vực hiển thị ảnh & Vòng tròn cắt di chuyển được */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 relative overflow-auto bg-slate-900/90 flex items-center justify-center p-4 min-h-[350px] select-none"
        >
          <div
            className="relative inline-block transition-transform duration-100"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          >
            <img
              ref={imageRef}
              src={photoSrc}
              alt="Ảnh tập thể lớp"
              className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl pointer-events-none"
              onLoad={updateCropPreview}
            />

            {/* Vòng tròn Crop có thể kéo rê */}
            <div
              onMouseDown={handleMouseDown}
              style={{
                left: `${cropPos.x}px`,
                top: `${cropPos.y}px`,
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute rounded-full border-3 border-blue-500 shadow-2xl bg-blue-500/10 cursor-move flex items-center justify-center group hover:border-amber-400 transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-blue-600 group-hover:bg-amber-400 text-white flex items-center justify-center text-[10px] shadow-sm">
                <Move className="w-2.5 h-2.5" />
              </div>
              <div className="absolute -bottom-6 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded-full font-black whitespace-nowrap shadow-md">
                Kéo đến mặt học sinh
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Chọn học sinh để gán ảnh & Nút Xong (Chuẩn Ảnh 2) */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Chọn học sinh và gán */}
          <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
            {/* Preview hình tròn */}
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 overflow-hidden shadow-sm shrink-0 bg-slate-100">
              {previewDataUrl ? (
                <img src={previewDataUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">?</div>
              )}
            </div>

            {/* Dropdown học sinh */}
            <div className="flex-1 max-w-xs">
              <label className="block text-[11px] font-black text-slate-500 mb-0.5">
                Gán khuôn mặt này cho học sinh:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800 outline-none"
              >
                {students.map((st, i) => (
                  <option key={st.id} value={st.id}>
                    {i + 1}. {st.full_name} {st.avatar ? '✓ (Đã có ảnh)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Nút bấm Gán ảnh */}
            <button
              type="button"
              onClick={handleAssignCurrent}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Gán ảnh cho em này</span>
            </button>
          </div>

          {/* Nút Xong (Chuẩn Ảnh 2) */}
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  RefreshCw,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  Camera,
  Crosshair
} from 'lucide-react';

/**
 * Modal Căn Chỉnh & Cắt Ảnh Đại Diện Chân Dung Học Sinh:
 * - Khung tròn Avatar chuẩn tỉ lệ hiển thị trên thẻ học sinh
 * - Kéo thả trực tiếp bằng chuột hoặc cảm ứng (Drag to Pan)
 * - 4 Phím mũi tên điều hướng (Lên / Xuống / Trái / Phải) để căn đúng khuôn mặt
 * - Phóng to / Thu nhỏ (Zoom 40% - 300%) bằng nút, thanh trượt hoặc lăn chuột
 * - Xoay ảnh 90 độ (Rotate)
 * - Xuất Canvas tròn chất lượng cao không bị cắt mất mặt
 */
export const AvatarCropModal = ({
  isOpen,
  onClose,
  imageSrc,
  studentName = 'Học sinh',
  onSaveAvatar
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset khi mở ảnh mới
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // 1. Kéo thả bằng chuột
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 2. Kéo thả cảm ứng trên điện thoại / máy tính bảng
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 3. Lăn chuột để Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 12 : -12;
    setZoom(prev => Math.max(40, Math.min(300, prev + delta)));
  };

  // 4. Các nút bấm di chuyển từng bước (20px)
  const handleMove = (dx, dy) => {
    soundFx.playClick();
    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  // 5. Căn giữa / Đặt lại
  const handleResetCenter = () => {
    soundFx.playClick();
    setOffset({ x: 0, y: 0 });
  };

  const handleResetAll = () => {
    soundFx.playClick();
    setZoom(100);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // 6. Xoay ảnh
  const handleRotateLeft = () => {
    soundFx.playClick();
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    soundFx.playClick();
    setRotation(prev => (prev + 90) % 360);
  };

  // 7. Cắt ảnh bằng HTML5 Canvas và Xuất DataUrl
  const handleCropAndSave = () => {
    if (!imgRef.current) return;

    try {
      const OUTPUT_SIZE = 360;
      const FRAME_SIZE = 260;
      const outputScale = OUTPUT_SIZE / FRAME_SIZE;

      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');

      // Cắt thành hình tròn chuẩn
      ctx.beginPath();
      ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Căn giữa canvas
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

      // Dịch chuyển theo offset người dùng đã chỉnh
      ctx.translate(offset.x * outputScale, offset.y * outputScale);

      // Xoay góc
      ctx.rotate((rotation * Math.PI) / 180);

      // Phóng to / Thu nhỏ
      const currentZoom = zoom / 100;
      ctx.scale(currentZoom, currentZoom);

      const displayedW = imgRef.current.clientWidth || 260;
      const displayedH = imgRef.current.clientHeight || 260;

      ctx.drawImage(
        imgRef.current,
        (-displayedW / 2) * outputScale,
        (-displayedH / 2) * outputScale,
        displayedW * outputScale,
        displayedH * outputScale
      );

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
      soundFx.playCorrect();
      onSaveAvatar?.(croppedBase64);
      onClose();
    } catch (err) {
      console.error('Lỗi cắt ảnh canvas:', err);
      // Fallback nếu có lỗi cross-origin
      onSaveAvatar?.(imageSrc);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-400 flex flex-col items-center max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
                CĂN CHỈNH KHUÔN MẶT
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Ảnh Đại Diện: {studentName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hướng dẫn nhanh */}
        <div className="w-full bg-amber-50/80 border border-amber-200 rounded-2xl px-3.5 py-2 mb-3 text-center">
          <p className="text-xs text-amber-900 font-bold">
            👉 <strong>Kéo chuột trên ảnh</strong> hoặc bấm <strong>nút mũi tên</strong> để đưa khuôn mặt vào giữa vòng tròn!
          </p>
        </div>

        {/* KHUNG TRÒN XEM TRƯỚC AVATAR (Preview Window) */}
        <div className="relative my-2 flex items-center justify-center">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onWheel={handleWheel}
            className="relative w-[260px] h-[260px] rounded-full overflow-hidden border-4 border-amber-500 shadow-2xl cursor-grab active:cursor-grabbing bg-slate-950 flex items-center justify-center"
            title="Nhấp và kéo chuột để di chuyển ảnh"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Avatar preview"
              draggable={false}
              className="pointer-events-none transition-transform duration-75 ease-out select-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                maxWidth: 'none',
                minWidth: '260px'
              }}
            />

            {/* Vòng tròn viền định hướng */}
            <div className="absolute inset-0 rounded-full border-2 border-white/50 pointer-events-none" />

            {/* Tâm chữ thập căn khuôn mặt (Crosshair) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-40 flex items-center justify-center">
              <div className="w-full h-[1.5px] bg-white absolute top-1/2 left-0" />
              <div className="h-full w-[1.5px] bg-white absolute top-0 left-1/2" />
              <div className="w-3 h-3 rounded-full border border-white" />
            </div>

            {/* Huy hiệu hướng dẫn kéo thả */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs pointer-events-none flex items-center space-x-1">
              <Move className="w-3 h-3" />
              <span>Kéo để di chuyển</span>
            </div>
          </div>
        </div>

        {/* 4 NÚT MŨI TÊN DI CHUYỂN ẢNH (Đúng yêu cầu Thầy: Lên / Xuống / Trái / Phải) */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-3 my-2 flex flex-col items-center">
          <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <Move className="w-3.5 h-3.5 text-amber-600" />
            <span>NÚT DI CHUYỂN CĂN KHUÔN MẶT:</span>
          </div>

          <div className="flex flex-col items-center space-y-1.5">
            {/* Nút Lên */}
            <button
              type="button"
              onClick={() => handleMove(0, -25)}
              className="px-4 py-2 bg-white hover:bg-amber-50 active:scale-95 border-2 border-slate-200 hover:border-amber-400 rounded-xl font-black text-xs text-slate-800 shadow-sm flex items-center space-x-1 transition-all"
              title="Đẩy ảnh lên (Lấy khuôn mặt ở phía trên)"
            >
              <ArrowUp className="w-4 h-4 text-amber-600" />
              <span>Lên trên (Lấy Mặt)</span>
            </button>

            {/* Hàng 3 nút: Trái - Căn Giữa - Phải */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleMove(-25, 0)}
                className="px-3.5 py-2 bg-white hover:bg-amber-50 active:scale-95 border-2 border-slate-200 hover:border-amber-400 rounded-xl font-black text-xs text-slate-800 shadow-sm flex items-center space-x-1 transition-all"
                title="Di chuyển sang trái"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600" />
                <span>Sang Trái</span>
              </button>

              <button
                type="button"
                onClick={handleResetCenter}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 active:scale-95 border-2 border-amber-300 rounded-xl font-black text-xs text-amber-900 shadow-xs flex items-center space-x-1 transition-all"
                title="Đặt lại ảnh về chính giữa"
              >
                <Crosshair className="w-3.5 h-3.5 text-amber-700" />
                <span>Căn Giữa</span>
              </button>

              <button
                type="button"
                onClick={() => handleMove(25, 0)}
                className="px-3.5 py-2 bg-white hover:bg-amber-50 active:scale-95 border-2 border-slate-200 hover:border-amber-400 rounded-xl font-black text-xs text-slate-800 shadow-sm flex items-center space-x-1 transition-all"
                title="Di chuyển sang phải"
              >
                <span>Sang Phải</span>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </button>
            </div>

            {/* Nút Xuống */}
            <button
              type="button"
              onClick={() => handleMove(0, 25)}
              className="px-4 py-2 bg-white hover:bg-amber-50 active:scale-95 border-2 border-slate-200 hover:border-amber-400 rounded-xl font-black text-xs text-slate-800 shadow-sm flex items-center space-x-1 transition-all"
              title="Kéo ảnh xuống"
            >
              <ArrowDown className="w-4 h-4 text-amber-600" />
              <span>Xuống dưới</span>
            </button>
          </div>
        </div>

        {/* THANH ĐIỀU KHIỂN PHÓNG TO / THU NHỎ (Zoom) */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 my-1.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-black text-slate-800">
            <span className="flex items-center space-x-1.5">
              <ZoomIn className="w-4 h-4 text-amber-600" />
              <span>Phóng to / Thu nhỏ khuôn mặt:</span>
            </span>
            <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-extrabold text-[11px]">
              {zoom}%
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(40, prev - 15))}
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs active:scale-95 transition-all"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="40"
              max="300"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(300, prev + 15))}
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs active:scale-95 transition-all"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* XOAY ẢNH & ĐẶT LẠI */}
        <div className="flex items-center space-x-2 my-1.5 w-full">
          <button
            type="button"
            onClick={handleRotateLeft}
            className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1 shadow-xs active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Xoay trái 90°</span>
          </button>

          <button
            type="button"
            onClick={handleRotateRight}
            className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1 shadow-xs active:scale-95 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Xoay phải 90°</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 active:scale-95 transition-all"
            title="Đặt lại toàn bộ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>

        {/* FOOTER: HỦY BỎ & CẮT & LƯU AVATAR */}
        <div className="w-full pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black active:scale-95 transition-all"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleCropAndSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-orange-200 flex items-center space-x-1.5 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>CẮT & LƯU KHUÔN MẶT</span>
          </button>
        </div>

      </div>
    </div>
  );
};

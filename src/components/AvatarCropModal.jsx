import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCw, X, Check } from 'lucide-react';

export const AvatarCropModal = ({ isOpen, onClose, imageSrc, onSaveAvatar }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !imageSrc) return null;

  const handleZoomChange = (val) => {
    setZoom(Math.max(50, Math.min(200, val)));
  };

  const handleRotateLeft = () => {
    soundFx.playClick();
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    soundFx.playClick();
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    soundFx.playClick();
    setZoom(100);
    setRotation(0);
  };

  const handleSave = () => {
    soundFx.playCorrect();
    // Return edited canvas data url or imageSrc
    onSaveAvatar(imageSrc, { zoom, rotation });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-800">Chỉnh Sửa & Cắt Ảnh Đại Diện</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Window (Image 4 Style) */}
        <div className="w-64 h-64 bg-slate-900 rounded-3xl overflow-hidden relative flex items-center justify-center border-4 border-purple-500 shadow-lg my-2">
          <img
            src={imageSrc}
            alt="Avatar preview"
            className="w-full h-full object-cover transition-transform duration-150"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
            }}
          />
        </div>

        {/* Zoom Slider Control (Image 4 Style) */}
        <div className="w-full bg-purple-50/60 p-4 rounded-2xl border border-purple-100 my-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <ZoomIn className="w-4 h-4 text-purple-600" />
              <span>Phóng to / Thu nhỏ:</span>
            </span>
            <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-extrabold">
              {zoom}%
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleZoomChange(zoom - 10)}
              className="p-1.5 bg-white rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="50"
              max="200"
              value={zoom}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="flex-1 accent-purple-600 h-2 bg-purple-200 rounded-lg cursor-pointer"
            />

            <button
              onClick={() => handleZoomChange(zoom + 10)}
              className="p-1.5 bg-white rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rotate & Reset Controls (Image 4 Style) */}
        <div className="flex items-center space-x-2 my-2 w-full">
          <button
            onClick={handleRotateLeft}
            className="flex-1 py-2 px-3 bg-white border border-purple-200 rounded-xl text-xs font-extrabold text-purple-700 hover:bg-purple-50 flex items-center justify-center space-x-1 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xoay trái</span>
          </button>

          <button
            onClick={handleRotateRight}
            className="flex-1 py-2 px-3 bg-white border border-purple-200 rounded-xl text-xs font-extrabold text-purple-700 hover:bg-purple-50 flex items-center justify-center space-x-1 shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Xoay phải</span>
          </button>

          <button
            onClick={handleReset}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>

        {/* Footer Actions (Image 4 Style) */}
        <div className="w-full pt-4 mt-2 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Hủy bỏ
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-purple-glow flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Cắt & Lưu Avatar</span>
          </button>
        </div>

      </div>
    </div>
  );
};

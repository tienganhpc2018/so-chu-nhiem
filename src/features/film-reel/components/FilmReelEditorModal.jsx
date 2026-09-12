import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  Quote,
  Smile,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Eye,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  FILM_REEL_CATEGORIES,
  ACTIVITY_SUGGESTIONS,
  AI_STOCK_COVERS
} from '../constants/filmReelPresets';
import { describeImageWithAi } from '../services/filmReelAiService';
import { soundFx } from '../../../utils/soundEffects';

export const FilmReelEditorModal = ({
  isOpen,
  onClose,
  onSave,
  editingReel = null,
  classId = 'default_class',
  className = 'Chủ Nhiệm'
}) => {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Văn nghệ');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [coverImage, setCoverImage] = useState('');
  const [coverInputType, setCoverInputType] = useState('url'); // 'url' | 'upload'
  const [urlInput, setUrlInput] = useState('');
  
  // Blocks state: Mảng các đoạn văn và khối ảnh xen kẽ
  const [blocks, setBlocks] = useState([
    { id: 'b-init-1', type: 'paragraph', text: '' }
  ]);

  // Vết con trỏ chuột trong ô soạn thảo đang active
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRefs = useRef({});

  // Trạng thái AI đang xử lý cho từng khối ảnh
  const [aiLoadingBlockId, setAiLoadingBlockId] = useState(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // Khởi tạo dữ liệu khi mở modal (Tạo mới hoặc Sửa)
  useEffect(() => {
    if (!isOpen) return;

    if (editingReel) {
      setTitle(editingReel.title || '');
      setCategory(editingReel.category || 'Văn nghệ');
      setEventDate(editingReel.eventDate || new Date().toISOString().slice(0, 10));
      setCoverImage(editingReel.coverImage || '');
      setUrlInput(editingReel.coverImage || '');
      setBlocks(
        editingReel.blocks && editingReel.blocks.length > 0
          ? editingReel.blocks
          : [{ id: `blk-${Date.now()}`, type: 'paragraph', text: '' }]
      );
    } else {
      // Mặc định tạo mới
      setTitle('');
      setCategory('Văn nghệ');
      setEventDate(new Date().toISOString().slice(0, 10));
      const defaultCover = AI_STOCK_COVERS['Văn nghệ']?.[0] || '';
      setCoverImage(defaultCover);
      setUrlInput(defaultCover);
      setBlocks([
        { id: `blk-${Date.now()}-1`, type: 'paragraph', text: '' }
      ]);
    }

    setActiveTab('editor');
    setAiLoadingBlockId(null);
    setAiSuccessMessage('');
  }, [isOpen, editingReel]);

  if (!isOpen) return null;

  // AI Tự sinh ảnh bìa dựa trên danh mục
  const handleAiGenerateCover = () => {
    soundFx?.playClick();
    const stockList = AI_STOCK_COVERS[category] || AI_STOCK_COVERS['Kỷ niệm'];
    const randomCover = stockList[Math.floor(Math.random() * stockList.length)];
    setCoverImage(randomCover);
    setUrlInput(randomCover);
  };

  // Xử lý tải ảnh lên (Base64 < 3MB)
  const handleFileUpload = (file, onSuccess) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 3MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onSuccess(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Cập nhật vị trí con trỏ chuột
  const handleTextareaSelect = (blockId, e) => {
    setFocusedBlockId(blockId);
    setCursorPos(e.target.selectionStart || 0);
  };

  // THUẬT TOÁN CHÈN ẢNH VÀ TÁCH ĐOẠN VĂN TẠI VỊ TRÍ CON TRỎ (Smart Cursor Splitting)
  const insertImageAtCursor = (imageUrl, caption = '') => {
    soundFx?.playClick();

    const targetId = focusedBlockId || blocks[blocks.length - 1]?.id;
    const targetIdx = blocks.findIndex(b => b.id === targetId);

    if (targetIdx === -1) {
      // Thêm vào cuối nếu không tìm thấy
      setBlocks(prev => [
        ...prev,
        { id: `img-${Date.now()}`, type: 'image', url: imageUrl, caption },
        { id: `p-${Date.now() + 1}`, type: 'paragraph', text: '' }
      ]);
      return;
    }

    const currentBlock = blocks[targetIdx];

    if (currentBlock.type === 'paragraph') {
      const fullText = currentBlock.text || '';
      const splitPos = Math.min(cursorPos, fullText.length);
      const textBefore = fullText.slice(0, splitPos).trim();
      const textAfter = fullText.slice(splitPos).trim();

      const newImageBlock = {
        id: `img-${Date.now()}`,
        type: 'image',
        url: imageUrl,
        caption: caption || ''
      };

      const newParagraphBlock = {
        id: `p-${Date.now() + 1}`,
        type: 'paragraph',
        text: textAfter
      };

      const updated = [...blocks];
      if (textBefore.length > 0) {
        // Cập nhật đoạn trước
        updated[targetIdx] = { ...currentBlock, text: textBefore };
        // Chèn ảnh và đoạn sau vào kế tiếp
        updated.splice(targetIdx + 1, 0, newImageBlock, newParagraphBlock);
      } else {
        // Đoạn hiện tại rỗng -> thay thế bằng ảnh và tạo đoạn mới phía dưới
        updated.splice(targetIdx, 1, newImageBlock, newParagraphBlock);
      }

      setBlocks(updated);
    } else {
      // Đang ở khối ảnh -> chèn ảnh mới ngay sau khối này
      const newImageBlock = {
        id: `img-${Date.now()}`,
        type: 'image',
        url: imageUrl,
        caption: caption || ''
      };
      const newParagraphBlock = {
        id: `p-${Date.now() + 1}`,
        type: 'paragraph',
        text: ''
      };
      const updated = [...blocks];
      updated.splice(targetIdx + 1, 0, newImageBlock, newParagraphBlock);
      setBlocks(updated);
    }
  };

  // Xử lý dán ảnh từ Clipboard (Ctrl + V ảnh chụp màn hình, Zalo...)
  const handlePasteOnTextarea = (blockId, e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          handleFileUpload(file, (base64) => {
            insertImageAtCursor(base64, 'Ảnh vừa dán từ clipboard');
          });
        }
        return;
      }
    }
  };

  // Thêm đoạn văn bản mới thủ công
  const handleAddParagraph = (afterIdx) => {
    soundFx?.playClick();
    const newBlock = { id: `p-${Date.now()}`, type: 'paragraph', text: '' };
    const updated = [...blocks];
    updated.splice(afterIdx + 1, 0, newBlock);
    setBlocks(updated);
  };

  // Xóa một khối
  const handleRemoveBlock = (blockId) => {
    soundFx?.playClick();
    if (blocks.length <= 1) {
      setBlocks([{ id: `p-${Date.now()}`, type: 'paragraph', text: '' }]);
      return;
    }
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  // Di chuyển khối lên/xuống
  const handleMoveBlock = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    soundFx?.playClick();
    const updated = [...blocks];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    setBlocks(updated);
  };

  // Thanh công cụ định dạng văn bản (Markdown shortcuts)
  const handleFormatText = (format) => {
    soundFx?.playClick();
    if (!focusedBlockId) return;

    setBlocks(prev => prev.map(b => {
      if (b.id !== focusedBlockId) return b;
      let newText = b.text || '';
      if (format === 'bold') newText = `**${newText}**`;
      else if (format === 'italic') newText = `*${newText}*`;
      else if (format === 'list') newText = `- ${newText}`;
      else if (format === 'quote') newText = `> ${newText}`;
      return { ...b, text: newText };
    }));
  };

  // Thêm biểu tượng cảm xúc
  const handleAddEmoji = (emoji) => {
    soundFx?.playClick();
    if (!focusedBlockId) return;
    setBlocks(prev => prev.map(b => {
      if (b.id !== focusedBlockId) return b;
      return { ...b, text: (b.text || '') + emoji };
    }));
  };

  // TÍCH HỢP GEMINI AI VISION: PHÂN TÍCH ẢNH & SINH NỘI DUNG TỰ ĐỘNG
  const handleAiDescribeBlockImage = async (block) => {
    if (!block.url) return;
    soundFx?.playClick();
    setAiLoadingBlockId(block.id);
    setAiSuccessMessage('');

    try {
      const result = await describeImageWithAi({
        image: block.url,
        title: title || '',
        category: category || 'Kỷ niệm'
      });

      if (result && result.success) {
        soundFx?.playCorrect();

        // 1. Cập nhật chú thích ảnh (Caption)
        // 2. Điền đoạn văn 60-120 từ vào đoạn văn kế tiếp (hoặc tạo mới)
        // 3. Gợi ý tiêu đề nếu tiêu đề đang trống
        const targetIdx = blocks.findIndex(b => b.id === block.id);
        const updated = [...blocks];

        updated[targetIdx] = {
          ...block,
          caption: result.caption || block.caption
        };

        // Tìm đoạn văn ngay sau ảnh, nếu có thì điền vào, nếu không thì tạo mới
        const nextBlock = updated[targetIdx + 1];
        if (nextBlock && nextBlock.type === 'paragraph') {
          updated[targetIdx + 1] = {
            ...nextBlock,
            text: nextBlock.text ? `${nextBlock.text}\n\n${result.story}` : result.story
          };
        } else {
          updated.splice(targetIdx + 1, 0, {
            id: `p-${Date.now()}`,
            type: 'paragraph',
            text: result.story
          });
        }

        setBlocks(updated);

        // Gợi ý tiêu đề nếu chưa có
        if (!title.trim() && result.suggestedTitle) {
          setTitle(result.suggestedTitle);
        }

        setAiSuccessMessage('✨ AI đã phân tích ảnh & viết đoạn văn nhật ký thành công!');
        setTimeout(() => setAiSuccessMessage(''), 4000);
      }
    } catch (e) {
      alert('Không thể hoàn thành phân tích ảnh bằng AI: ' + e.message);
    } finally {
      setAiLoadingBlockId(null);
    }
  };

  // Lưu bài viết
  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên hoạt động kỷ niệm!');
      return;
    }

    soundFx?.playClick();

    const reelData = {
      id: editingReel ? editingReel.id : `reel-${Date.now()}`,
      classId,
      title: title.trim(),
      category,
      coverImage: coverImage || AI_STOCK_COVERS[category]?.[0] || '',
      eventDate,
      blocks: blocks.filter(b => (b.type === 'paragraph' && b.text.trim()) || (b.type === 'image' && b.url)),
      likesCount: editingReel ? (editingReel.likesCount || 0) : 0,
      isLiked: editingReel ? editingReel.isLiked : false,
      createdAt: editingReel ? editingReel.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(reelData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-auto">
        
        {/* 1. MODAL HEADER & TAB SWITCHER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎞️</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                {editingReel ? 'Chỉnh Sửa Cuộn Phim Kỷ Niệm' : 'Tạo Cuộn Phim Kỷ Niệm Mới'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Soạn thảo nhật ký hoạt động lớp, đính kèm ảnh và hỗ trợ bởi Gemini AI
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Switcher: Soạn thảo / Xem trước */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Soạn Thảo</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trước</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. BODY CONTENT */}
        {activeTab === 'editor' ? (
          /* TAB 1: FORM SOẠN THẢO */
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Thông báo thành công từ AI nếu có */}
            {aiSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {/* A. ẢNH BÌA ĐẠI DIỆN */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Ảnh bìa đại diện cuộn phim</span>
                </label>

                {/* Nút AI tự sinh ảnh bìa */}
                <button
                  type="button"
                  onClick={handleAiGenerateCover}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1 transition-all"
                  title="Tự động chọn ảnh minh họa đẹp mắt theo chủ đề"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ AI Tự Sinh Ảnh Bìa</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Xem trước ảnh bìa */}
                <div className="w-full sm:w-48 aspect-video rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300 shadow-inner flex items-center justify-center">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400">Chưa có ảnh bìa</span>
                  )}
                </div>

                {/* Ô chọn URL hoặc Tải ảnh */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Dán đường dẫn ảnh (URL) hoặc bấm tải từ máy..."
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setCoverImage(e.target.value);
                      }}
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center space-x-1 shadow-2xs transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5 text-purple-600" />
                      <span>Tải ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, (base64) => {
                            setCoverImage(base64);
                            setUrlInput('Ảnh tải từ máy tính (Base64)');
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* B. THÔNG TIN CƠ BẢN: TÊN HOẠT ĐỘNG, DANH MỤC, NGÀY */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên hoạt động / Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lễ kỷ niệm 20/11 ấm áp của lớp mình..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                />
              </div>

              {/* Thanh gợi ý nhanh các hoạt động phổ biến */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Gợi ý nhanh:</span>
                {ACTIVITY_SUGGESTIONS.map(act => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => {
                      soundFx?.playClick();
                      setTitle(act);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-semibold border border-purple-200 shrink-0 transition-colors"
                  >
                    + {act}
                  </button>
                ))}
              </div>

              {/* Grid 2 cột: Danh mục & Ngày diễn ra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chủ đề / Danh mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {FILM_REEL_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày diễn ra hoạt động
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>

            {/* C. THANH CÔNG CỤ SOẠN THẢO DÒNG CHẢY (Flow Editor Toolbar) */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
              {/* Định dạng văn bản */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleFormatText('bold')}
                  className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                  title="In đậm (**chữ**)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('italic')}
                  className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                  title="In nghiêng (*chữ*)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('list')}
                  className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                  title="Gạch đầu dòng (- chữ)"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('quote')}
                  className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                  title="Trích dẫn (> chữ)"
                >
                  <Quote className="w-4 h-4" />
                </button>

                {/* Emoji pills */}
                <div className="hidden sm:flex items-center space-x-1 pl-1 border-l border-slate-200">
                  {['🌸', '🎉', '🏆', '⭐', '📷', '💖'].map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleAddEmoji(em)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-sm"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút Chèn ảnh tại vị trí con trỏ */}
              <div className="flex items-center space-x-2">
                <label className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Chèn Ảnh Tại Con Trỏ</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, (base64) => {
                        insertImageAtCursor(base64);
                      });
                    }}
                  />
                </label>
              </div>
            </div>

            {/* D. DANH SÁCH KHỐI DÒNG CHẢY (Paragraphs & Images Blocks) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Nội dung bài viết (Có thể dán trực tiếp ảnh bằng Ctrl + V vào khung chữ):</span>
                <span>{blocks.length} khối nội dung</span>
              </div>

              {blocks.map((block, idx) => {
                if (block.type === 'paragraph') {
                  return (
                    <div
                      key={block.id}
                      className="relative p-3 rounded-2xl bg-white border border-slate-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all group"
                    >
                      <textarea
                        rows={3}
                        placeholder="Nhập nội dung đoạn văn... (Mẹo: Nhấn Ctrl + V để dán ảnh trực tiếp ngay tại đây)"
                        value={block.text || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, text: val } : b));
                        }}
                        onSelect={(e) => handleTextareaSelect(block.id, e)}
                        onKeyUp={(e) => handleTextareaSelect(block.id, e)}
                        onClick={(e) => handleTextareaSelect(block.id, e)}
                        onPaste={(e) => handlePasteOnTextarea(block.id, e)}
                        className="w-full text-sm text-slate-800 placeholder:text-slate-400 resize-y outline-none bg-transparent font-normal leading-relaxed"
                      />

                      {/* Actions cho đoạn văn */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                        <span className="text-[10px]">Đoạn văn {idx + 1}</span>
                        <div className="flex items-center space-x-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(idx, -1)}
                              className="p-1 hover:text-slate-700"
                              title="Chuyển lên trên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {idx < blocks.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(idx, 1)}
                              className="p-1 hover:text-slate-700"
                              title="Chuyển xuống dưới"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(block.id)}
                            className="p-1 hover:text-rose-600"
                            title="Xóa đoạn này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (block.type === 'image') {
                  const isAiLoading = aiLoadingBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-2 border-dashed border-purple-300 space-y-3 relative group"
                    >
                      {/* Ảnh & Cụm nút */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-full sm:w-56 max-h-40 rounded-xl overflow-hidden bg-slate-900 border border-purple-200 flex items-center justify-center shrink-0 shadow-sm">
                          <img src={block.url} alt="block" className="max-h-40 w-full object-cover" />
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <label className="text-xs font-bold text-purple-950 block">
                            Chú thích ảnh (Caption):
                          </label>
                          <input
                            type="text"
                            placeholder="Nhập chú thích ảnh..."
                            value={block.caption || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, caption: val } : b));
                            }}
                            className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />

                          {/* NÚT AI VISION SINH NỘI DUNG TỪ ẢNH */}
                          <button
                            type="button"
                            disabled={isAiLoading}
                            onClick={() => handleAiDescribeBlockImage(block)}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all ${
                              isAiLoading
                                ? 'bg-purple-200 text-purple-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white shadow-purple-200'
                            }`}
                          >
                            {isAiLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Gemini AI đang phân tích ảnh...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-amber-200" />
                                <span>✨ AI Sinh Nội Dung Từ Ảnh (Caption & Nhật Ký)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Controls khối ảnh */}
                      <div className="flex items-center justify-between pt-2 border-t border-purple-200/60 text-xs text-slate-400">
                        <span className="text-[10px] text-purple-700 font-bold">Khối hình ảnh {idx + 1}</span>
                        <div className="flex items-center space-x-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(idx, -1)}
                              className="p-1 hover:text-slate-700"
                              title="Chuyển lên trên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {idx < blocks.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(idx, 1)}
                              className="p-1 hover:text-slate-700"
                              title="Chuyển xuống dưới"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(block.id)}
                            className="p-1 hover:text-rose-600"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}

              {/* Nút thêm nhanh đoạn văn */}
              <button
                type="button"
                onClick={() => handleAddParagraph(blocks.length - 1)}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-300 text-slate-500 hover:text-purple-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm đoạn văn mới</span>
              </button>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-purple-200"
              >
                {editingReel ? 'LƯU THAY ĐỔI' : 'TẠO CUỘN PHIM'}
              </button>
            </div>

          </form>
        ) : (
          /* TAB 2: XEM TRƯỚC BÀI VIẾT (LIVE PREVIEW) */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 custom-scrollbar max-w-3xl mx-auto w-full">
            <div className="text-center space-y-2 pb-4 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                {category} • LỚP {className}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {title || 'Chưa đặt tên hoạt động'}
              </h1>
              <p className="text-xs text-slate-400 font-semibold">
                Ngày {eventDate}
              </p>
            </div>

            {coverImage && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-4">
              {blocks.map((b, i) => {
                if (b.type === 'paragraph' && b.text) {
                  return (
                    <p key={i} className="text-base text-slate-700 leading-relaxed">
                      {b.text}
                    </p>
                  );
                }
                if (b.type === 'image' && b.url) {
                  return (
                    <div key={i} className="space-y-1 my-4">
                      <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-96">
                        <img src={b.url} alt="img" className="w-full max-h-96 object-cover" />
                      </div>
                      {b.caption && (
                        <p className="text-xs text-slate-500 italic text-center font-medium">
                          📷 {b.caption}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                ← Quay lại chỉnh sửa
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 rounded-xl bg-purple-600 text-white text-xs font-black shadow-md"
              >
                Xác Nhận Lưu Bài Viết
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

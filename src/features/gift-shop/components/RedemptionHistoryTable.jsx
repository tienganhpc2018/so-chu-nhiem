import React, { useState } from 'react';
import { History, FileSpreadsheet, Trash2, Search, Calendar, User, Gift, AlertTriangle, RotateCcw, Printer } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const RedemptionHistoryTable = ({
  redemptions = [],
  className = '',
  onClearHistory,
  onUndoRedeem,
  onPrintVoucher
}) => {
  const [search, setSearch] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [undoTarget, setUndoTarget] = useState(null);

  // Format datetime dd/mm/yyyy hh:mm
  const formatDateTime = (isoString) => {
    if (!isoString) return '--/--/---- --:--';
    try {
      const d = new Date(isoString);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return isoString;
    }
  };

  // Filter history
  const filtered = redemptions.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.studentName?.toLowerCase().includes(q) ||
      item.giftName?.toLowerCase().includes(q)
    );
  });

  // Export to Excel / CSV with UTF-8 BOM (\uFEFF)
  const handleExportCSV = () => {
    soundFx?.playClick();

    const headers = ['STT', 'Thời gian đổi quà', 'Học sinh nhận quà', 'Lớp học', 'Phần quà đã đổi', 'Số xu đã trừ'];
    const rows = redemptions.map((item, idx) => [
      idx + 1,
      `"${formatDateTime(item.timestamp)}"`,
      `"${item.studentName || ''}"`,
      `"${className || 'Lớp'}"`,
      `"${item.giftName || ''}"`,
      `"-${item.coinsSpent || 0} xu"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanClassName = (className || 'LopHoc').replace(/\s+/g, '_');
    link.setAttribute('download', `LichSu_DoiQua_${cleanClassName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmClear = () => {
    soundFx?.playClick();
    onClearHistory?.();
    setShowConfirmClear(false);
  };

  const handleConfirmUndo = () => {
    if (!undoTarget) return;
    soundFx?.playClick();
    onUndoRedeem?.(undoTarget.id);
    setUndoTarget(null);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-800 flex items-center space-x-2">
              <span>Nhật Ký & Lịch Sử Đổi Quà</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {redemptions.length} lượt
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Ghi nhận chi tiết từng lần trừ xu, hỗ trợ in Voucher A6 và hoàn tác giao dịch
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {redemptions.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                title="Xuất file Excel chuẩn font tiếng Việt"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất Excel (.csv)</span>
              </button>

              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-200 transition-all"
                title="Xóa lịch sử khi sang tháng/học kỳ mới"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa lịch sử</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Filter */}
      {redemptions.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh hoặc tên quà..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 text-center w-12">STT</th>
              <th className="py-3 px-3 min-w-[130px]">Thời gian đổi</th>
              <th className="py-3 px-4 min-w-[150px]">Học sinh nhận quà</th>
              <th className="py-3 px-3 min-w-[80px]">Lớp</th>
              <th className="py-3 px-4 min-w-[170px]">Phần quà đã đổi</th>
              <th className="py-3 px-4 text-right min-w-[110px]">Số xu đã trừ</th>
              <th className="py-3 px-3 text-center min-w-[110px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {formatDateTime(item.timestamp)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                    {item.studentName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                      {className || 'Lớp học'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <span>🎁</span>
                      <span>{item.giftName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-xs">
                      -{item.coinsSpent} xu
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onPrintVoucher?.(item)}
                        className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition-colors shadow-2xs"
                        title="In thẻ Voucher A6 cho học sinh"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUndoTarget(item)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors shadow-2xs"
                        title="Hoàn tác / Hủy lượt đổi & Hoàn lại xu"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                  {redemptions.length === 0 ? (
                    <div className="space-y-1">
                      <div className="text-3xl">🎁</div>
                      <p className="text-xs text-slate-500 font-bold">Chưa có lượt đổi quà nào</p>
                      <p className="text-[11px] text-slate-400">Học sinh đổi quà sẽ được ghi nhận tự động vào bảng này.</p>
                    </div>
                  ) : (
                    'Không tìm thấy kết quả phù hợp với từ khóa'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal xác nhận hoàn tác đổi quà */}
      {undoTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h4 className="font-black text-base text-slate-800">
                Xác Nhận Hoàn Tác Đổi Quà?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thầy có chắc chắn muốn hủy lượt đổi món quà <strong className="text-slate-800">"{undoTarget.giftName}"</strong> của em <strong className="text-purple-700">{undoTarget.studentName}</strong>?
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs space-y-1 text-amber-900">
              <div className="font-bold flex items-center gap-1">
                <span>⚡ Kết quả hoàn tác:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Cộng lại <strong>+{undoTarget.coinsSpent} xu</strong> cho em {undoTarget.studentName}</li>
                <li>Tăng lại <strong>+1</strong> số lượng tồn kho của phần quà</li>
                <li>Xóa bản ghi này khỏi nhật ký lịch sử</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setUndoTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmUndo}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-200"
              >
                Xác Nhận Hoàn Tác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa lịch sử */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-base text-slate-800">Xóa Sạch Lịch Sử Đổi Quà?</h4>
              <p className="text-xs text-slate-500">
                Hành động này sẽ xóa toàn bộ nhật ký đổi quà của lớp {className}. Số xu hiện có của học sinh vẫn được giữ nguyên.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

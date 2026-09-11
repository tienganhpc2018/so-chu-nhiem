import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      localStorage.setItem('sochunhiem_active_tab', 'home');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/50 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-red-400">Đã xảy ra sự cố hiển thị</h2>
            <p className="text-xs text-slate-300">
              Ứng dụng đã tự động bảo vệ dữ liệu lớp học của Thầy/Cô. Vui lòng bấm nút bên dưới để tải lại giao diện.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-left text-[11px] font-mono text-red-300 overflow-x-auto max-h-24">
              {this.state.error?.message || 'Lỗi không xác định'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TẢI LẠI TRANG NGAY</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

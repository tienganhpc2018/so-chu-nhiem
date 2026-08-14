import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/soundEffects';
import { MascotRobot } from '../components/MascotRobot';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Auth = () => {
  const { signIn, signUp, configError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    soundFx.playClick();

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg('Vui lòng nhập họ và tên của Giáo viên.');
          setLoading(false);
          return;
        }
        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;

        soundFx.playCorrect();
        setSuccessMsg('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        setIsSignUp(false);
      } else {
        const { data, error } = await signIn(email, password);
        if (error) throw error;

        soundFx.playCorrect();
      }
    } catch (err) {
      console.error('Lỗi xác thực:', err);
      setErrorMsg(err.message || 'Đã xảy ra lỗi trong quá trình xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-coral-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-mint-100 relative overflow-hidden">
        
        {/* Decorative Mint & Coral background blur circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint-200/40 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-coral-200/40 rounded-full blur-2xl"></div>

        {/* Mascot Branding Header */}
        <div className="text-center relative z-10 mb-6">
          <div className="inline-flex p-3 bg-mint-100 rounded-3xl mb-3 shadow-inner">
            <MascotRobot mode="happy" size={64} className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-mint-600 via-mint-700 to-coral-500 bg-clip-text text-transparent">
            SỔ CHỦ NHIỆM THCS
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Quản Lý Lớp Học Thông Minh Khối 6, 7, 8, 9
          </p>
        </div>

        {/* Supabase Missing Config Notice */}
        {configError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Chưa cấu hình Supabase API Key</span>
            </div>
            <p>
              Vui lòng cập nhật <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> trong file <code>.env</code> và chạy file <code>schema.sql</code> trong Supabase Editor.
            </p>
          </div>
        )}

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-coral-50 border border-coral-200 rounded-2xl text-xs font-semibold text-coral-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-coral-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-mint-50 border border-mint-200 rounded-2xl text-xs font-semibold text-mint-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-mint-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên Giáo viên:</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Hải"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Giáo viên:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giaovien@truong.edu.vn"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none transition-all"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-mint-500 to-coral-500 hover:from-mint-600 hover:to-coral-600 text-white font-extrabold text-sm rounded-2xl shadow-mint-glow transition-all flex items-center justify-center space-x-2 transform active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Đang xử lý...' : isSignUp ? 'TẠO TÀI KHOẢN GIÁO VIÊN' : 'ĐĂNG NHẬP SỔ CHỦ NHIỆM'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center relative z-10">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
              soundFx.playClick();
            }}
            className="text-xs font-bold text-mint-700 hover:text-coral-600 transition-colors"
          >
            {isSignUp
              ? 'Đã có tài khoản Giáo viên? Đăng nhập ngay'
              : 'Chưa có tài khoản? Đăng ký Giáo viên mới'}
          </button>
        </div>

      </div>
    </div>
  );
};

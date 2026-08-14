import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/soundEffects';
import { MascotRobot } from '../components/MascotRobot';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Shield, Zap } from 'lucide-react';

export const Auth = () => {
  const { signIn, signUp, configError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('giaovien.thcs@gmail.com');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('Giáo viên Chủ Nhiệm THCS');
  const [role, setRole] = useState('teacher');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const translateError = (err) => {
    const msg = err?.message || '';
    if (msg.includes('Invalid login credentials')) {
      return 'Email hoặc mật khẩu chưa chính xác. Thầy bấm nút "VÀO THẲNG APP GIÁO VIÊN (1-CLICK)" bên dưới để hệ thống tự tạo tài khoản và vào thẳng App nhé!';
    }
    if (msg.includes('Email not confirmed')) {
      return 'Tài khoản chưa được xác nhận Email trong Supabase. Thầy hãy dùng nút 1-Click bên dưới để vào ứng dụng ngay.';
    }
    if (msg.includes('User already registered')) {
      return 'Email này đã được đăng ký. Thầy bấm nút Đăng nhập để vào App nhé.';
    }
    return msg || 'Đã xảy ra lỗi trong quá trình xác thực.';
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg('Đang kích hoạt tài khoản Giáo viên và vào ứng dụng...');
    soundFx.playClick();

    const demoEmail = email.trim() || 'giaovien.thcs@gmail.com';
    const demoPass = password || '123456';
    const demoName = fullName.trim() || 'Giáo viên Chủ Nhiệm THCS';

    try {
      // 1. Thử Đăng nhập trực tiếp
      const { error: loginErr } = await signIn(demoEmail, demoPass);
      if (!loginErr) {
        soundFx.playCorrect();
        return;
      }

      // 2. Nếu chưa có tài khoản, tự động Đăng ký mới
      const { error: regErr } = await signUp(demoEmail, demoPass, demoName);
      if (regErr && !regErr.message.includes('already registered')) {
        throw regErr;
      }

      // 3. Đăng nhập lại ngay lập tức
      const { error: retryErr } = await signIn(demoEmail, demoPass);
      if (retryErr) throw retryErr;

      soundFx.playCorrect();
    } catch (err) {
      console.error('Quick login error:', err);
      setErrorMsg(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    soundFx.playClick();

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg('Vui lòng nhập đầy đủ Họ và tên Giáo viên.');
          setLoading(false);
          return;
        }

        // 1. Đăng ký
        const { error: signUpErr } = await signUp(email, password, fullName);
        if (signUpErr && !signUpErr.message.includes('already registered')) {
          throw signUpErr;
        }

        // 2. Đăng nhập tự động ngay lập tức
        const { error: signInErr } = await signIn(email, password);
        if (signInErr) {
          throw signInErr;
        }

        soundFx.playCorrect();
        setSuccessMsg('Đăng ký thành công! Đang chuyển hướng vào ứng dụng...');
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          // Thử tự động tạo nếu chưa có
          await handleQuickDemoLogin();
        } else {
          soundFx.playCorrect();
        }
      }
    } catch (err) {
      console.error('Lỗi xác thực Supabase:', err);
      setErrorMsg(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-coral-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-mint-100 relative overflow-hidden">
        
        {/* Background Blur Elements */}
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

        {/* 1-CLICK QUICK ACCESS BUTTON (SUPER EASY FOR TEACHER) */}
        <div className="mb-6 relative z-10">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-coral-500 via-amber-500 to-mint-500 hover:from-coral-600 hover:to-mint-600 text-white font-black text-sm rounded-2xl shadow-coral-glow transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 border-2 border-white"
          >
            <Zap className="w-5 h-5 text-amber-200 fill-amber-200 animate-bounce" />
            <span>VÀO THẲNG APP GIÁO VIÊN (1-CLICK)</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-1.5 font-bold">
            ⚡ Tự động khởi tạo tài khoản Giáo viên & đăng nhập vào ứng dụng ngay
          </p>
        </div>

        <div className="relative flex py-2 items-center z-10">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-xs font-bold uppercase">Hoặc đăng nhập bằng Email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="my-4 p-3 bg-coral-50 border border-coral-200 rounded-2xl text-xs font-semibold text-coral-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-coral-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="my-4 p-3 bg-mint-50 border border-mint-200 rounded-2xl text-xs font-semibold text-mint-800 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-mint-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 my-3 relative z-10">
          
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên Giáo viên:</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn Hải"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò hệ thống:</label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm font-bold text-mint-800 outline-none"
                  >
                    <option value="teacher">Giáo viên Chủ nhiệm THCS</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Giáo viên:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giaovien.thcs@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-mint-500 hover:bg-mint-600 text-white font-extrabold text-xs rounded-2xl shadow-mint-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Đang xử lý...' : isSignUp ? 'ĐĂNG KÝ VÀ VÀO APP' : 'ĐĂNG NHẬP THỦ CÔNG'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center relative z-10">
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
              ? 'Đã có tài khoản? Bấm vào đây để Đăng nhập thủ công'
              : 'Chưa có tài khoản? Nhấn vào đây để Đăng ký mới'}
          </button>
        </div>

      </div>
    </div>
  );
};

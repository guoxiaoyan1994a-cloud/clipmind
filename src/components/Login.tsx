import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setError('请输入手机号和密码');
      return;
    }
    setError('');
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white max-w-md mx-auto px-6 overflow-x-hidden text-[#1d1d1f] font-display">
      {/* Top Navigation */}
      <div className="flex items-center justify-between py-6">
        <div onClick={() => navigate('/')} className="text-[#1d1d1f] flex size-10 shrink-0 items-center justify-start cursor-pointer">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px] font-bold">attachment</span>
          </div>
          <h2 className="text-[#1d1d1f] text-lg font-bold leading-tight tracking-tight">ClipMind</h2>
        </div>
        <div className="size-10"></div>
      </div>

      {/* Header Section */}
      <div className="pt-8 pb-10">
        <h1 className="text-[#1d1d1f] tracking-tight text-4xl font-bold leading-tight mb-3">欢迎回来</h1>
        <p className="text-[#86868b] text-lg font-normal">请登录您的 ClipMind 账号</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Login Form */}
      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-[#1d1d1f] text-sm font-medium px-1">手机号码</label>
          <div className="apple-input-focus flex items-center bg-[#f5f5f7] border border-transparent rounded-xl h-14 px-4 transition-all duration-200">
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-[#1d1d1f] placeholder:text-[#86868b] text-base outline-none"
              placeholder="请输入手机号码"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[#1d1d1f] text-sm font-medium px-1">密码</label>
          <div className="apple-input-focus flex items-center bg-[#f5f5f7] border border-transparent rounded-xl h-14 px-4 transition-all duration-200">
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-[#1d1d1f] placeholder:text-[#86868b] text-base outline-none"
              placeholder="请输入密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <span
              className="material-symbols-outlined text-[#86868b] cursor-pointer hover:text-[#1d1d1f]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <a className="text-primary text-sm font-medium hover:brightness-110" href="#">忘记密码?</a>
        </div>
        <div className="pt-4">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 text-lg transition-all active:scale-[0.98] rounded-full ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </div>
      </div>

      {/* Registration Link */}
      <div className="flex justify-center items-center gap-2 py-8">
        <span className="text-[#86868b] text-sm">还没有账号?</span>
        <a onClick={() => navigate('/register')} className="text-primary text-sm font-bold hover:brightness-110 cursor-pointer">立即注册</a>
      </div>

      {/* Social Login Section */}
      <div className="mt-auto pb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] bg-gray-200 flex-1"></div>
          <span className="text-[#86868b] text-xs font-medium uppercase tracking-widest">快捷登录</span>
          <div className="h-[1px] bg-gray-200 flex-1"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-3 bg-[#f5f5f7] border border-transparent hover:bg-gray-200 text-[#1d1d1f] py-3.5 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.75 1.18-.02 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.13zM12.03 7.25c-.02-2.23 1.8-4.07 3.93-4.25.2.2.3.2.4.4.19 2.15-1.88 4.01-4.33 3.85z"></path>
            </svg>
            <span className="text-sm font-medium">Apple</span>
          </button>
          <button className="flex items-center justify-center gap-3 bg-[#f5f5f7] border border-transparent hover:bg-gray-200 text-[#1d1d1f] py-3.5 rounded-xl transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}

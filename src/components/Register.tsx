import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');


  /** 提交注册 */
  const handleRegister = async () => {
    if (!phone.trim() || !password.trim()) {
      setError('请填写手机号和密码');
      return;
    }
    if (!agreed) {
      setError('请阅读并同意用户协议');
      return;
    }
    setError('');
    try {
      await register(phone, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-x-hidden px-6 bg-white text-slate-900 font-display">
      {/* Top Navigation */}
      <div className="flex items-center pt-8 pb-4">
        <button onClick={() => navigate('/')} className="hover:opacity-70 transition-opacity">
          <span className="material-symbols-outlined text-[28px] text-slate-900">arrow_back</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="pt-8 pb-10">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-slate-900">创建账号</h1>
        <p className="text-base mt-2 text-slate-500">欢迎加入 ClipMind</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium px-1 text-slate-600">手机号</label>
          <div className="relative group">
            <input
              className="w-full border rounded-xl h-[56px] px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
              placeholder="请输入手机号"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium px-1 text-slate-600">密码</label>
          <div className="relative flex items-center">
            <input
              className="w-full border rounded-xl h-[56px] px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
              placeholder="请输入密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-3 pt-2">
          <div className="pt-0.5">
            <input
              className="size-4 rounded text-primary focus:ring-primary focus:ring-offset-background-dark bg-white border-slate-300"
              id="agreement"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
          </div>
          <label className="text-xs leading-relaxed text-slate-500" htmlFor="agreement">
            我已阅读并同意 <a className="text-primary hover:underline" href="#">用户协议</a> 和 <a className="text-primary hover:underline" href="#">隐私政策</a>
          </label>
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-12 space-y-6">
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className={`w-full bg-primary hover:bg-primary/90 text-white font-bold h-[56px] rounded-full text-lg transition-all shadow-lg shadow-primary/20 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
        >
          {isLoading ? '注册中...' : '注册'}
        </button>
        <div className="flex justify-center items-center gap-1 text-sm">
          <span className="text-slate-600">已有账号？</span>
          <a onClick={() => navigate('/login')} className="text-primary font-medium hover:underline cursor-pointer">立即登录</a>
        </div>
      </div>

      {/* Branding */}
      <div className="mt-auto pb-10 flex flex-col items-center">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-primary text-2xl">mindfulness</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">ClipMind Intelligence</p>
      </div>
    </div>
  );
}

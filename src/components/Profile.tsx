import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 未登录时的默认显示
  const displayName = user?.name || '陈小明';
  const displayAvatar = user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf';

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* Header */}
      <header className="flex items-center justify-center px-5 pt-10 pb-4 bg-background-light dark:bg-background-dark border-b border-slate-200/50 dark:border-slate-800/50">
        <h1 className="text-lg font-bold">我的</h1>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-5">
        {/* Profile Info */}
        <div className="flex flex-col items-center mt-8 mb-10">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-sm bg-orange-200">
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {isAuthenticated && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-0.5 rounded-full border-2 border-white dark:border-slate-800">
                PRO
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
          {user?.phone && (
            <p className="text-sm text-slate-400 mb-4">{user.phone}</p>
          )}
          <button className="bg-primary text-white font-medium py-2.5 px-8 rounded-full shadow-md shadow-primary/30 active:scale-95 transition-transform">
            编辑资料
          </button>
        </div>

        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 px-1">账号设置</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">workspace_premium</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">订阅方案</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary">专业版 年费</span>
                <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">history</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">使用统计</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">settings</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">应用设置</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">help</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">支持与帮助</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
            </div>

            {/* Logout Button */}
            <div onClick={handleLogout} className="flex items-center justify-start bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl mt-2 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-3 text-red-500">
                <span className="material-symbols-outlined">logout</span>
                <span className="font-bold">{isAuthenticated ? '退出登录' : '去登录'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-8 pt-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex gap-2 justify-around">
          <a onClick={() => navigate('/')} className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 w-20 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
            <span className="material-symbols-outlined !text-[26px]">home</span>
            <p className="text-[10px] font-semibold mt-1 leading-normal tracking-tight">创作</p>
          </a>
          <a onClick={() => navigate('/projects')} className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 w-20 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
            <span className="material-symbols-outlined !text-[26px]">video_library</span>
            <p className="text-[10px] font-semibold mt-1 leading-normal tracking-tight">作品</p>
          </a>
          <a className="flex flex-col items-center justify-center gap-1 text-primary w-20 cursor-pointer">
            <span className="material-symbols-outlined !text-[26px] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <p className="text-[10px] font-bold mt-1 leading-normal tracking-tight">我的</p>
          </a>
        </div>
      </nav>
    </div>
  );
}

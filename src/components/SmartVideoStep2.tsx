import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '../services/projectStore';

export default function SmartVideoStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const url = location.state?.url || '';
  const projectId = location.state?.projectId || '';
  const [localProgress, setLocalProgress] = useState(0);
  const [statusText, setStatusText] = useState('创意剧本已载入，准备为您剪辑成片！');

  // 纯模拟生成进度的倒计时
  useEffect(() => {
    let internalProgress = 0;
    const updateTarget = setInterval(() => {
        internalProgress += Math.random() * 10;
        if(internalProgress > 100) internalProgress = 100;
        setLocalProgress(internalProgress);
        
        if(internalProgress > 30) setStatusText('正在分发素材寻影...');
        if(internalProgress > 70) setStatusText('正在匹配卡点、合成包装效果...');
        
        if(internalProgress === 100) {
            clearInterval(updateTarget);
            setStatusText('剪辑成片完成！');
            setTimeout(() => {
                navigate('/video-editor', { state: { url, projectId } });
            }, 800)
        }
    }, 300);

    return () => clearInterval(updateTarget);
  }, [navigate, projectId, url]);

  const displayProgress = Math.floor(localProgress);

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-hidden font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-4 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">智能生视频</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="w-full p-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-8 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700">
            <span className="material-symbols-outlined text-primary text-xl active-icon">magic_button</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{statusText}</span>
          </div>

          {/* Loading Animation Area */}
          <div className="relative flex items-center justify-center w-48 h-48 mb-8">
            <div className="absolute inset-0 border-4 border-slate-200/30 dark:border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 w-36 h-36 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-primary text-5xl active-icon">movie_edit</span>
              {displayProgress > 0 && (
                <span className="text-sm font-bold text-primary mt-1">{displayProgress}%</span>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">正在根据分镜逐一匹配最佳素材</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">不想等了？先收起任务，完成后会通知你</p>
          </div>

          <button onClick={() => navigate('/projects')} className="w-full py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all">
            收起任务
          </button>
        </div>
      </main>

      {/* Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-8 pt-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="relative w-full px-10">
          <div className="absolute top-3 left-10 right-10 h-[2px] -translate-y-1/2 bg-slate-200 dark:bg-slate-800"></div>
          <div className="absolute top-3 left-10 right-10 h-[2px] -translate-y-1/2 bg-primary transition-all duration-500"></div>

          <div className="relative flex items-center justify-between w-full">
            <div onClick={() => navigate('/smart-video-1', { state: { url, projectId } })} className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white dark:ring-slate-900">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">理解分析</span>
            </div>

            <div onClick={() => navigate('/smart-video-3', { state: { url, projectId } })} className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white dark:ring-slate-900">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">创意生成</span>
            </div>

            <div className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white dark:ring-slate-900">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              </div>
              <span className="mt-1 text-[10px] font-bold text-primary">剪辑成片</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

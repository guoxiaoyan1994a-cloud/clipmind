import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '../services/projectStore';

export default function SmartVideoStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const url = location.state?.url || '';
  const projectId = location.state?.projectId || '';

  const { currentProject, getProject } = useProjectStore();
  
  // 用于编辑的剧本状态
  const [scenes, setScenes] = useState<any[]>([]);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 当带有 projectId 进来时，如果 store 没有同步过来，尝试重新获取项目信息
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      getProject(projectId).catch(console.error);
    }
  }, [projectId, currentProject?.id]);

  // 同步数据
  useEffect(() => {
    if (currentProject && currentProject.result) {
      const resultData = currentProject.result as any;
      if (resultData.scenes) setScenes(resultData.scenes);
      if (resultData.subtitles) setSubtitles(resultData.subtitles);
    }
  }, [currentProject]);

  const updateScene = (index: number, field: string, value: string) => {
    setScenes(prev => {
      const ns = [...prev];
      ns[index] = { ...ns[index], [field]: value };
      return ns;
    });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSave = () => {
    setEditingIndex(null);
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-primary">专业脚本预览 (1.8版)</h1>
        <div className="flex h-10 w-10 items-center justify-center"></div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-40 pt-4 scroll-smooth">
        <div className="mb-6">
          <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
            我已经使用 1.8 专家模型为您重写了高标准的分镜脚本，整体时长已严格控制在 15s 以内：
          </p>
        </div>

        {/* 脚本内容列表 */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 px-1">📽️ 视觉分镜脚本</h2>
          {scenes.map((scene, index) => (
            <div key={index} className="rounded-3xl bg-white dark:bg-slate-900 shadow-premium border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:shadow-lg">
              <div className="flex items-center justify-between px-4 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs font-black shadow-sm">
                    {scene.sceneIndex}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 leading-none mb-1">TIME RANGE</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {scene.timeRange || '0:00-0:00'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                     {scene.cameraMovement || '固定视角'}
                   </span>
                   <button onClick={() => handleEdit(index)} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">settings_suggest</span>
                   </button>
                </div>
              </div>
              
              <div className="p-5 space-y-5">
                {/* 画面描述 */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    画面描述 (Prompt)
                  </h4>
                  {editingIndex === index ? (
                    <textarea 
                      className="w-full rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-primary/40 transition-all min-h-[100px]"
                      value={scene.prompt || ''}
                      onChange={(e) => updateScene(index, 'prompt', e.target.value)}
                    />
                  ) : (
                    <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      {scene.prompt}
                    </p>
                  )}
                </div>

                {/* 音效 & 音乐 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-1">
                      <span className="material-symbols-outlined text-sm">surround_sound</span>
                      音效设计
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{scene.soundEffects || '默认环境音'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-1">
                      <span className="material-symbols-outlined text-sm">music_note</span>
                      背景音乐
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{scene.bgmDescription || '自动配乐'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 字幕列表列表 */}
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 px-1 mb-4">💬 语音字幕列表</h2>
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[32px] p-6 space-y-4 border border-slate-100 dark:border-slate-800">
              {subtitles.map((sub, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black text-primary p-1">{sub.startTime}</div>
                    <div className="flex-1 w-0.5 bg-slate-200 dark:bg-slate-700 opacity-50 group-last:hidden"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-primary/30 transition-colors">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">
                        {sub.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {subtitles.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4 italic">点击重试重新生成字幕内容</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Area */}
      <footer className="absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-8 pt-4 px-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => {
            // 前面的数据已经齐备，现在通过该按钮引导用户跳入生成跑圈页
            navigate('/smart-video-2', { state: { url, projectId } });
          }}
          className="w-full h-[52px] text-[16px] font-bold transition-all rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
        >
          <span className="material-symbols-outlined text-[20px]">movie_edit</span>
          立即生成
        </button>

        {/* Progress Stepper (更新高亮态) */}
        <div className="relative w-full px-10">
          <div className="absolute top-3 left-10 right-10 h-[2px] -translate-y-1/2 bg-slate-200 dark:bg-slate-800"></div>
          <div className="absolute top-3 left-10 w-1/2 h-[2px] -translate-y-1/2 bg-primary transition-all duration-500"></div>
          <div className="absolute top-3 left-1/2 w-0 h-[2px] -translate-y-1/2 bg-primary transition-all duration-500 delay-300 animate-[growWidth_0.5s_ease-out_forwards]"></div>
          
          <div className="relative flex items-center justify-between w-full">
            <div onClick={() => navigate(-1)} className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white dark:ring-slate-900">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <span className="mt-1 text-[10px] font-bold text-primary">理解分析</span>
            </div>
            
            <div className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white dark:ring-slate-900">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              </div>
              <span className="mt-1 text-[10px] font-bold text-primary">创意生成</span>
            </div>
            
            <div onClick={() => navigate('/smart-video-2', { state: { url, projectId } })} className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-slate-900 transition-colors duration-300">
                <div className="w-2 h-2 rounded-full bg-slate-400 transition-colors duration-300"></div>
              </div>
              <span className="mt-1 text-[10px] font-medium text-slate-400 transition-colors duration-300">剪辑成片</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

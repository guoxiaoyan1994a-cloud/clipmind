import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '../services/projectStore';

export default function SmartVideoStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const url = location.state?.url || '';
  const projectId = location.state?.projectId || '';

  const { currentProject, getProject } = useProjectStore();
  
  // 用于编辑的剧本状态，默认初始化为空数组
  const [scenes, setScenes] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 当带有 projectId 进来时，如果 store 没有同步过来，尝试重新获取项目信息
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      getProject(projectId).catch(console.error);
    }
  }, [projectId, currentProject?.id]);

  // 从 currentProject 的 result.scenes 里同步出用于预览和二次编辑的数据
  useEffect(() => {
    if (currentProject && currentProject.result) {
      const resultData = currentProject.result as any;
      if (resultData.scenes && Array.isArray(resultData.scenes)) {
        setScenes(resultData.scenes);
      }
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
    // 这里未来可以调用 API 存数据库，目前仅做本地 UI 管理
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">确认分镜脚本</h1>
        <div className="flex h-10 w-10 items-center justify-center"></div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        <div className="mb-6">
          <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
            我已经完全掌握了原视频的精髓，并为您重写了一套全新的翻拍脚本文案，请审阅或微调：
          </p>
        </div>

        {/* 脚本内容列表 */}
        <div className="space-y-4">
          {scenes.map((scene, index) => (
            <div key={index} className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                    {scene.sceneIndex || index + 1}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    时长: {scene.duration ? `${scene.duration}s` : '自动'}
                  </span>
                </div>
                {editingIndex === index ? (
                  <button onClick={handleSave} className="text-primary font-bold text-xs px-3 py-1 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                    完成
                  </button>
                ) : (
                  <button onClick={() => handleEdit(index)} className="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span className="text-xs font-medium">编辑</span>
                  </button>
                )}
              </div>
              
              <div className="p-4 space-y-4">
                {/* 画面描述 (Prompt) */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <span className="material-symbols-outlined text-sm text-primary">videocam</span>
                    画面分镜说明
                  </h4>
                  {editingIndex === index ? (
                    <textarea 
                      className="w-full rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/30 transition-shadow min-h-[80px]"
                      value={scene.prompt || ''}
                      onChange={(e) => updateScene(index, 'prompt', e.target.value)}
                      placeholder="描述在此镜头中需要怎样的画面..."
                    />
                  ) : (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-100/50 dark:border-slate-700/50">
                      {scene.prompt || '暂无画面描述'}
                    </div>
                  )}
                </div>

                {/* 旁白/配音台词 */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <span className="material-symbols-outlined text-sm text-blue-500">mic</span>
                    口播配音台词
                  </h4>
                  {editingIndex === index ? (
                    <textarea 
                      className="w-full rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow min-h-[60px]"
                      value={scene.subtitle || ''}
                      onChange={(e) => updateScene(index, 'subtitle', e.target.value)}
                      placeholder="输入将要展示的字幕/旁白..."
                    />
                  ) : (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20"></div>
                      <span className="font-medium">"{scene.subtitle || '（无台词）'}"</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {scenes.length === 0 && (
             <div className="py-10 text-center text-slate-500 text-sm">暂无生成的创意脚本内容</div>
          )}
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

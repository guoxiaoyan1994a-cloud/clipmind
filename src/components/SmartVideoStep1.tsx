import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '../services/projectStore';

export default function SmartVideoStep1() {
  const navigate = useNavigate();
  const location = useLocation();
  const url = location.state?.url || '';
  const projectId = location.state?.projectId || '';
  const { currentProject, getProject, taskStatus, currentTaskId, pollTask, analyzeVideo } = useProjectStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 基础分析结果状态，会从 currentProject 覆盖
  const [sections, setSections] = useState({
    background_music: "提取中...",
    sound_effects: "提取中...",
    role_setting: "提取中...",
    story_summary: "提取中...",
    subtitle_text: "提取中...",
    visual_style: "提取中...",
    language_text: "提取中..."
  });

  // 当带有 projectId 进来时，如果 store 没有同步过来，尝试重新获取项目信息
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      getProject(projectId).catch(console.error);
    }
  }, [projectId, currentProject?.id]);

  // 如果有正在进行的任务，或者刚刚进入需要开始任务，则开启轮询
  useEffect(() => {
    // 如果这是新起的分析任务（在 CreatorCenter 点击解析过来的）
    if (url && projectId && taskStatus === 'idle') {
      analyzeVideo(projectId, url).catch(console.error);
    }

    if (currentTaskId && (taskStatus === 'analyzing' || taskStatus === 'exporting' || taskStatus === 'pending')) {
      pollTask(currentTaskId, () => {
        // UI上已经有各种 “提取中...” 的默认文案，这里后台去刷就好
      }).then(() => {
        // 提取完毕，给用户展示 1.5 秒钟真实数据，自动飞入 Step 3 (创意生成页)
        setTimeout(() => {
          navigate('/smart-video-3', { state: { url, projectId } });
        }, 1500);
      }).catch((err) => {
        console.error('分析过程中断或失败:', err);
      });
    }
  }, [currentTaskId, url, projectId, taskStatus, navigate, pollTask, analyzeVideo]);

  // 从项目中初始化或者覆盖 Sections
  useEffect(() => {
    if (currentProject && currentProject.result) {
      const res = currentProject.result as any;
      setSections(prev => ({
        ...prev,
        background_music: res.background_music || prev.background_music,
        sound_effects: res.sound_effects || prev.sound_effects,
        role_setting: res.role_setting || prev.role_setting,
        story_summary: res.story_summary || prev.story_summary,
        subtitle_text: res.subtitle_text || prev.subtitle_text,
        visual_style: res.visual_style || prev.visual_style,
        language_text: res.language_text || prev.language_text
      }));
    }
  }, [currentProject]);

  // 渲染内容的辅助组件，处理加载状态
  const renderContent = (id: keyof typeof sections) => {
    const content = sections[id];
    const isLoading = content === "提取中...";
    
    if (editingId === id) {
      return (
        <textarea 
          autoFocus
          className="mt-2 w-full rounded-lg border border-primary/20 bg-primary/5 p-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary/30"
          value={content}
          onChange={(e) => updateSection(id, e.target.value)}
          rows={3}
        />
      );
    }
    
    return (
      <p className={`mt-1 text-sm ${isLoading ? 'text-slate-400 animate-pulse italic' : 'text-slate-500 dark:text-slate-400'}`}>
        {content}
      </p>
    );
  };

  const handleModify = () => {
    navigate('/', { state: { url } });
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = () => {
    setEditingId(null);
    // 这里如果要求严格同步也可以考虑调后端API并更新，这里暂留本地UI控制。
  };

  const updateSection = (id: keyof typeof sections, value: string) => {
    setSections(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">提取原片结构</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>
      
      {/* Main Content Scroll Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="mb-8 mt-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                这是豆包大模型为您提炼的原视频爆款要素公式：
              </p>
              <div className="flex justify-end mt-2">
                <span onClick={handleModify} className="text-primary text-sm font-medium cursor-pointer hover:underline">换个视频</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detail Sections */}
        <div className="space-y-4">
          {/* Section: Music */}
          <div className="flex items-start gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <span className="material-symbols-outlined">music_note</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">背景音乐</h3>
                {editingId === 'background_music' ? (
                  <button onClick={handleSave} className="text-primary font-bold text-xs">完成</button>
                ) : (
                  <button onClick={() => handleEdit('background_music')} className="text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                )}
              </div>
              {renderContent('background_music')}
            </div>
          </div>
          
          {/* Section: Sound Effects */}
          <div className="flex items-start gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <span className="material-symbols-outlined">volume_up</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">声效分析</h3>
                {editingId === 'sound_effects' ? (
                  <button onClick={handleSave} className="text-primary font-bold text-xs">完成</button>
                ) : (
                  <button onClick={() => handleEdit('sound_effects')} className="text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                )}
              </div>
              {renderContent('sound_effects')}
            </div>
          </div>
          
          {/* Section: Characters */}
          <div className="flex items-start gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <span className="material-symbols-outlined">face_6</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">角色设定</h3>
                {editingId === 'role_setting' ? (
                  <button onClick={handleSave} className="text-primary font-bold text-xs">完成</button>
                ) : (
                  <button onClick={() => handleEdit('role_setting')} className="text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                )}
              </div>
              {renderContent('role_setting')}
            </div>
          </div>
          
          {/* Section: Plot */}
          <div className="flex items-start gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <span className="material-symbols-outlined">auto_stories</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">故事梗概</h3>
                {editingId === 'story_summary' ? (
                  <button onClick={handleSave} className="text-primary font-bold text-xs">完成</button>
                ) : (
                  <button onClick={() => handleEdit('story_summary')} className="text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                )}
              </div>
              {renderContent('story_summary')}
            </div>
          </div>

          {/* Section: Subtitle */}
          <div className="flex items-start gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <span className="material-symbols-outlined">subtitles</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">字幕文案</h3>
                {editingId === 'subtitle_text' ? (
                  <button onClick={handleSave} className="text-primary font-bold text-xs">完成</button>
                ) : (
                  <button onClick={() => handleEdit('subtitle_text')} className="text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                )}
              </div>
              {renderContent('subtitle_text')}
            </div>
          </div>

          {/* Section: Visual Style */}
          <div className="flex items-start gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <span className="material-symbols-outlined">palette</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">画面风格</h3>
                {editingId === 'visual_style' ? (
                  <button onClick={handleSave} className="text-primary font-bold text-xs">完成</button>
                ) : (
                  <button onClick={() => handleEdit('visual_style')} className="text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                )}
              </div>
              {renderContent('visual_style')}
            </div>
          </div>

          {/* Section: Voice Copy */}
          <div className="flex items-start gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <span className="material-symbols-outlined">record_voice_over</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">语音文案</h3>
                {editingId === 'language_text' ? (
                  <button onClick={handleSave} className="text-primary font-bold text-xs">完成</button>
                ) : (
                  <button onClick={() => handleEdit('language_text')} className="text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                )}
              </div>
              {renderContent('language_text')}
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation & Action Area */}
      <footer className="absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-8 pt-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        {/* Progress Stepper */}
        <div className="relative w-full px-10">
          <div className="absolute top-3 left-10 right-10 h-[2px] -translate-y-1/2 bg-slate-200 dark:bg-slate-800"></div>
          <div className="absolute top-3 left-10 h-[2px] w-0 -translate-y-1/2 bg-primary transition-all duration-500"></div>
          
          <div className="relative flex items-center justify-between w-full">
            <div className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white dark:ring-slate-900">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              </div>
              <span className="mt-1 text-[10px] font-bold text-primary">理解分析</span>
            </div>
            
            <div onClick={() => navigate('/smart-video-3', { state: { url, projectId } })} className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-slate-900">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              </div>
              <span className="mt-1 text-[10px] font-medium text-slate-400">创意生成</span>
            </div>
            
            <div onClick={() => navigate('/video-editor', { state: { url, projectId } })} className="relative flex flex-col items-center z-10 cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-slate-900">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              </div>
              <span className="mt-1 text-[10px] font-medium text-slate-400">剪辑成片</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

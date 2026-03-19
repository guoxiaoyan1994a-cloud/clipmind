import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '../services/projectStore';
import { useAuthStore } from '../services/authStore';

export default function CreatorCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { uploadVideo, createProject } = useProjectStore();
  const [url, setUrl] = useState('');
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.state?.url) {
      setUrl(location.state.url);
    }
  }, [location.state]);

  /** 解析链接或上传视频后导航到下一步 */
  const handleParse = async () => {
    // 未登录时跳转登录页
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (localVideoUrl) {
      // 本地视频：先上传到 Supabase Storage
      const fileInput = fileInputRef.current;
      const file = fileInput?.files?.[0];

      if (file) {
        setIsUploading(true);
        setUploadError('');
        try {
          const videoUrl = await uploadVideo(file);
          navigate('/video-editor', { state: { url: videoUrl, isEditing: true } });
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : '视频上传失败');
          setIsUploading(false);
        }
      } else {
        // 兜底：使用本地 blob URL（无后端情况下仍可用）
        navigate('/video-editor', { state: { url: localVideoUrl, isEditing: true } });
      }
    } else {
      // 链接解析：直接在此处发起真实大模型分析
      setIsUploading(true);
      setUploadError('');
      try {
        // 调用后端 API 创建真实的数据库项目，获取真实的 UUID
        const projectId = await createProject('视频复刻任务', url);
        
        // 带着创建好的 projectId 跳转到提取页 (Step1)，该页面将会被赋予新的轮询属性
        navigate('/smart-video-1', { state: { url, projectId } });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : '解析失败，请重试');
        setIsUploading(false);
      }
    }
  };

  const handleLocalUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setLocalVideoUrl(blobUrl);
      setUrl(`已选中本地视频：${file.name}`);
      setUploadError('');
    }
  };

  const isButtonDisabled = !url.trim() || isUploading;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl px-5 pt-10 pb-3">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">复刻爆款视频</h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar pb-28">
        <section className="px-4 pt-2">
          <div className="flex flex-col gap-6 mt-2">
            <div className="w-full bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-premium border border-slate-100 dark:border-slate-800">
              <textarea
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setLocalVideoUrl(null);
                  setUploadError('');
                }}
                className="w-full h-48 bg-transparent border-none focus:ring-0 p-0 text-[17px] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none outline-none"
                placeholder="粘贴视频链接，开启爆款复刻..."
              ></textarea>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {uploadError}
              </div>
            )}

            <button
              onClick={handleParse}
              disabled={isButtonDisabled}
              className={`w-full h-[60px] text-[17px] font-bold transition-all rounded-full bg-primary text-white ${isButtonDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'shadow-lg shadow-primary/25 active:scale-[0.98]'
                }`}
            >
              {isUploading ? '正在提取高清视频素材...' : '解析链接'}
            </button>
            <p className="text-center text-[13px] text-slate-400 dark:text-slate-500 px-4 leading-relaxed font-medium">
              仅支持抖音、头条、西瓜，建议15秒以内的视频，也可从<span onClick={handleLocalUploadClick} className="text-primary cursor-pointer hover:underline">本地上传</span>
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
          </div>
        </section>
      </main>

      <nav className="absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-8 pt-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex gap-2 justify-around">
          <a className="flex flex-col items-center justify-center gap-1 text-primary w-20 cursor-pointer">
            <span className="material-symbols-outlined !text-[26px] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <p className="text-[10px] font-bold mt-1 leading-normal tracking-tight">创作</p>
          </a>
          <a onClick={() => navigate('/projects')} className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 w-20 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
            <span className="material-symbols-outlined !text-[26px]">video_library</span>
            <p className="text-[10px] font-semibold mt-1 leading-normal tracking-tight">作品</p>
          </a>
          <a onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 w-20 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
            <span className="material-symbols-outlined !text-[26px]">person</span>
            <p className="text-[10px] font-semibold mt-1 leading-normal tracking-tight">我的</p>
          </a>
        </div>
      </nav>
    </div>
  );
}

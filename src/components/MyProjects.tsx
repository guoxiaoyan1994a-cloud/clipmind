import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../services/projectStore';
import { useAuthStore } from '../services/authStore';

/** 项目状态对应的中文标签和样式 */
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: { label: '已完成', className: 'bg-emerald-500/80 border-emerald-400/30' },
  draft: { label: '草稿', className: 'bg-amber-500/80 border-amber-400/30' },
  analyzing: { label: '分析中', className: 'bg-primary/80 border-blue-400/30' },
  editing: { label: '编辑中', className: 'bg-indigo-500/80 border-indigo-400/30' },
  exporting: { label: '导出中', className: 'bg-violet-500/80 border-violet-400/30' },
  failed: { label: '失败', className: 'bg-red-500/80 border-red-400/30' },
};

// 默认封面图（按序使用）
const DEFAULT_COVERS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDl2W4b1CzGi5OJ30DRKcspraY2HGWylPGjGiuHYj-Jrs3-useH9lcsbxtvYMB6de6QTWugWjKgzJlTdZapoCPiaA0XenJdlIjUbtiMqU2D4G3rDxgUa6ce3qybG1fOTxOyX-iqZ4qIk_u3KK1qSv2ddxQfvcuGdR2tfHtaXFbhBawBLYKIao-r8HTiLEb7IP1_jH9FslFqw8VIi9IJ8Ox3BAVFrrH9R7e85SWj3W59LLbYKrKLfGmbiMW1XYujmXnocuhz7s8tJxY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCQH8pju0yVgI6mjo1yqqVUJ10iVZlBm2YV-jPH_l8mltNTib4EzpHOnqQUnQIk7_yF9f7Xw3rButWKDeWe1uGWTYB_F3bY5VTpm-KFf12Re0MrxDywV4FtTGmflEBM8PJJWHqypGVJxjh9gUaL9z2JngCVRUoet_xayo1x1KsmiQxer4pU554G2L70NMpUN14KnzfX4aGwIV4Ou8CYrNU-pH4LQZm5bWd7khGcHiVjSyjXAqsXcdtQw_6iUQAmA54dxSdfETU3wEU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAHA876izlCWSQmHBDYjkFf20JZMvl-b8jUhAHq7P2HGo4zTQ4WrWZCcF7cGJnFFUkp3mI_oJ_OHqAdVWOaaScPPAhj3AGLJRoxBoCYjFy0MJNJDsC2dCN4RIR2sF0U1HlHWyUmv4SEzGuZzOLN1GkApeAV5Pq-nNJFbIWJDoKpWFaHLSU2DcNEsJAWKf9SUov5apjZMGjvLlGQwr14F50t9lMS6YhRZJznoLieBJHdTVIDHczLC5FQsb-yZe3cXXAJImJ3WlNLpM8',
];

export default function MyProjects() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { projects, isLoadingProjects, fetchProjects } = useProjectStore();

  // 页面加载时从 API 拉取项目列表
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects]);

  /** 格式化时间为相对时间 */
  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}分钟前更新`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前更新`;
    const days = Math.floor(hours / 24);
    return `${days}天前更新`;
  };

  /** 根据项目状态生成操作按钮 */
  const renderActionButton = (project: typeof projects[0]) => {
    const status = project.status;

    if (status === 'completed') {
      return (
        <button
          onClick={() => navigate('/video-editor', { state: { projectId: project.id } })}
          className="rounded-full bg-slate-900 dark:bg-white px-5 py-2 text-sm font-bold text-white dark:text-slate-900 transition-colors hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm"
        >
          打开项目
        </button>
      );
    }

    if (status === 'analyzing' || status === 'exporting') {
      return (
        <button
          onClick={() => navigate('/smart-video-2', { state: { projectId: project.id } })}
          className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 py-2 text-sm font-bold text-slate-700 dark:text-slate-300"
        >
          查看进度
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate('/video-editor', { state: { projectId: project.id } })}
        className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90 shadow-sm shadow-primary/20"
      >
        继续编辑
      </button>
    );
  };

  // 合并 API 数据和兜底硬编码数据
  // 如果 API 返回为空（例如未连接数据库），显示示例数据
  const displayProjects = projects.length > 0 ? projects : [
    { id: 'demo-1', user_id: '', title: '现代建筑巡礼', video_url: null, status: 'completed', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'demo-2', user_id: '', title: '烹饪大师课片头', video_url: null, status: 'draft', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'demo-3', user_id: '', title: '氛围音乐可视化', video_url: null, status: 'analyzing', created_at: new Date(Date.now() - 172800000).toISOString() },
  ];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl px-5 pt-10 pb-3">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">我的项目</h1>
          <button onClick={() => navigate('/')} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform active:scale-95">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-28 space-y-8">
        {isLoadingProjects ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-slate-400">加载项目中...</p>
          </div>
        ) : (
          displayProjects.map((project, index) => {
            const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;
            const coverUrl = DEFAULT_COVERS[index % DEFAULT_COVERS.length];

            return (
              <div key={project.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800/60">
                <div className="relative aspect-video w-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: `url('${coverUrl}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                      <span className="material-symbols-outlined text-white text-3xl ml-1">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wider text-white backdrop-blur-md border shadow-sm ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col p-5">
                  <h3 className="text-xl font-bold leading-tight text-slate-900 dark:text-slate-50 mb-4">{project.title}</h3>
                  <div className="flex items-center justify-between">
                    {project.status === 'analyzing' || project.status === 'exporting' ? (
                      <div className="flex items-center gap-3 w-1/2">
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                          <div className="h-full w-[65%] bg-primary rounded-full"></div>
                        </div>
                        <span className="text-[12px] font-bold text-primary">65%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <p className="text-[13px] font-medium">{formatRelativeTime(project.created_at)}</p>
                      </div>
                    )}
                    {renderActionButton(project)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-8 pt-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex gap-2 justify-around">
          <a onClick={() => navigate('/')} className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 w-20 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
            <span className="material-symbols-outlined !text-[26px]">home</span>
            <p className="text-[10px] font-semibold mt-1 leading-normal tracking-tight">创作</p>
          </a>
          <a className="flex flex-col items-center justify-center gap-1 text-primary w-20 cursor-pointer">
            <span className="material-symbols-outlined !text-[26px] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>video_library</span>
            <p className="text-[10px] font-bold mt-1 leading-normal tracking-tight">作品</p>
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

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '../services/projectStore';
import type { SceneData } from '../services/api';

/** 硬编码的默认场景图片 */
const SCENE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBUcZJm5dgmhDTaZJvGAgs3Sf0aM4McPoqGmMTOWq9eAfngccxjoKDqYc1EKSKJ89cd21i48cNRhmW8fDobdEKyDvBtiMj_KX7cjYvNV7tELS9YweGyHheZEqWRu49FY7okQ5NGwqti4GRVtMxrtdEFuGHSS7dK_8fKsiDv_SZ92QHWprAkB8w9r_m7sDU8_IsSnrDtPnHiK5HJ68Dok3NU9xsHxOAED_V1y4QfJs8qVU1EKOMpA2xXs_lrvG1tA5Sro_NSaBSTFIw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD7WF4-xJyzCNy7enR1jP4WUT_YyaaAmgTfLCzDIQDr82piA0R5iYldC5-uNr6dEQj7ODSb6iRsqwzl8Q4kSzXrx-NK40DfGhyd3MHHS12nCDtsSxNlPOMoUBGdT-rcIb8O3Ojc6-9bAFW-ZZpCzxu5jh5RsbZI8LgKqFtOLV7CcZR_ZocmZer6ShkFX8kr0XgrfOZlFYxMNjpEfkyP1RWKUnMn4ONMnVa2X46Yfjkfi9RNQAtryeHsrWQzeW2BG7-Mhgu-f1JvLUg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAB0wh-pNo9BfFpm2-ATOokGgoPp2RnEHNs2TrvKUFKv0PPrMtwRQDk4LOUKeRy1l8ZobbNbqRLkYXdVk0k9RKAB8we3eQQCKx-spAed-J5Gk9pISGl1Xr7QPshCIZkN_gCtraB3dj5GsSaB4Onr-QZp-RDR0RCwzIkFZoPN7gZYaBLnCsyIxbc7w6m5D15nu_smO5rlGsjJkvgZbMzoHRpDQFOnujr6_AgJw9bpHYQKawgvgyplEfux4TXXz-1iNFZ6UPTbiPPXh8',
];

// 默认分镜数据
const DEFAULT_SCENES = [
  { subtitle: '排骨，还要一个嘛？', voice: '晓晓 (女声)' },
  { subtitle: '真的很好吃呀', voice: '晓晓 (女声)' },
  { subtitle: '这是我吃过最香的排骨', voice: '晓晓 (女声)' },
];

export default function VideoEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const url = location.state?.url || '';
  const projectId = location.state?.projectId || '';
  const [isEditing, setIsEditing] = useState(location.state?.isEditing || false);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { currentScenes, exportVideo, fetchProjectDetail } = useProjectStore();

  // 如果有 projectId，加载项目详情
  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(projectId);
    }
  }, [projectId, fetchProjectDetail]);

  // 构建展示的分镜列表
  const scenes = currentScenes.length > 0
    ? currentScenes.map((s, i) => ({
      subtitle: s.subtitle || DEFAULT_SCENES[i % DEFAULT_SCENES.length].subtitle,
      voice: s.voice || DEFAULT_SCENES[i % DEFAULT_SCENES.length].voice,
      image: SCENE_IMAGES[i % SCENE_IMAGES.length],
    }))
    : DEFAULT_SCENES.map((s, i) => ({
      ...s,
      image: SCENE_IMAGES[i % SCENE_IMAGES.length],
    }));

  /** 导出视频 */
  const handleExport = async () => {
    if (projectId) {
      setIsExporting(true);
      try {
        await exportVideo(projectId);
        navigate('/smart-video-2', { state: { url, projectId } });
      } catch (err) {
        console.error('导出失败:', err);
        setIsExporting(false);
      }
    }
  };

  return (
    <div className={`relative flex h-screen w-full flex-col overflow-hidden ${isEditing ? 'bg-zinc-950 text-slate-100' : 'bg-black text-slate-100'} font-display`}>
      {/* Video Background Area */}
      <div
        className={`${isEditing ? 'flex-1 w-full bg-black flex items-center justify-center cursor-pointer' : 'absolute inset-0 z-0 flex items-center justify-center bg-black'}`}
        onClick={() => {
          if (isEditing && activeMenuIndex !== null) {
            setActiveMenuIndex(null);
          }
        }}
      >
        <img
          alt="A cute baby happily eating baby food"
          className={`${isEditing ? 'h-full w-full object-contain' : 'h-full w-full object-cover aspect-[9/16] max-w-[calc(100%*9/16)] mx-auto'}`}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH1eTiwFbZKB8vCpA0A46_MbY2fuZL7z-FRNLZxB7d1mrJ4_LeL6cx1F1C_in190SLU5K0T_C16XnFECbOlFITbNpk2njCtdq1ewGxpAyRcRZR3BqbEn_QS3DXGiKfqoFJ5wC3MYmMkOEIisJKOFapqR_gBJunlZ3c2tP5r8oIY_rv9tdWcoHZF94LEkKJPi2aWkBgBmabEebYOEGNmHxL2ujy6ur4s3H5p4IJrvsLpBcGRfrBR_527Sv31CC8sbfaXhdjVZfK7so"
        />
        <button className={`absolute z-10 flex ${isEditing ? 'h-12 w-12' : 'h-20 w-20'} items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-transform active:scale-95`}>
          <span className={`material-symbols-outlined ${isEditing ? '!text-2xl' : '!text-5xl'} fill-1`}>play_arrow</span>
        </button>
      </div>

      {/* Top Controls Overlay */}
      <div className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 pt-12 ${!isEditing ? 'video-overlay-gradient' : ''} px-6`}>
        <button onClick={() => navigate(-1)} className={`flex h-10 w-10 items-center justify-center rounded-full ${isEditing ? 'bg-black/20 text-white backdrop-blur-md' : 'bg-black/30 text-white backdrop-blur-xl border border-white/10'}`}>
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>

        {isEditing && (
          <div onClick={() => navigate('/add-music')} className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full cursor-pointer hover:bg-black/40 transition-colors border border-white/10">
            <span className="material-symbols-outlined text-sm text-primary">music_note</span>
            <span className="text-xs font-medium truncate max-w-[80px] text-white">默认音频.mp3</span>
            <span className="material-symbols-outlined text-xs text-white/40">chevron_right</span>
          </div>
        )}

        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-full bg-black/30 px-5 py-2.5 text-white backdrop-blur-xl border border-white/10">
            <span className="material-symbols-outlined text-lg">content_cut</span>
            <span className="text-sm font-medium">编辑更多</span>
          </button>
        ) : (
          <button onClick={() => setIsEditing(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform">
            <span className="material-symbols-outlined font-bold">check</span>
          </button>
        )}
      </div>

      {/* Storyboard Area */}
      {isEditing && (
        <div className={`overflow-hidden bg-zinc-950/90 backdrop-blur-2xl border-t border-white/5 z-30 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${activeMenuIndex === null ? 'h-[38vh]' : 'h-[22vh]'}`}>
          {activeMenuIndex === null ? (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <div className="flex flex-col gap-4 pb-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">分镜列表</h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold border border-primary/20">共 {scenes.length} 个镜头</span>
                </div>

                {scenes.map((scene, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="flex gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-sm hover:border-primary/30 transition-colors">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img className="w-full h-full object-cover" src={scene.image} />
                      </div>
                      <div className="flex flex-col justify-between flex-1 py-1">
                        <div onClick={() => navigate('/subtitle-editor')} className="space-y-1 cursor-pointer hover:opacity-80 transition-opacity">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider">TTS / Voiceover</p>
                          <p className="text-sm font-medium leading-relaxed text-white">{scene.subtitle}</p>
                        </div>
                        <div onClick={() => navigate('/voice-selection')} className="flex gap-2 cursor-pointer hover:text-primary transition-colors">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-primary">mic</span> {scene.voice}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveMenuIndex(index)}
                        className="self-center h-10 w-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4 animate-in slide-in-from-bottom-4 duration-300 justify-end">
              <div className="flex items-center justify-end mb-4">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">Scene {activeMenuIndex + 1}</span>
              </div>

              <div className="flex items-center justify-around px-4 mb-2">
                <button onClick={() => navigate('/trim-video')} className="flex flex-col items-center gap-2 group">
                  <div className="size-14 flex items-center justify-center rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-all shadow-lg">
                    <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">content_cut</span>
                  </div>
                  <span className="text-[10px] font-bold text-white group-hover:text-primary transition-colors">剪辑</span>
                </button>
                <button onClick={() => navigate('/ai-generate')} className="flex flex-col items-center gap-2 group">
                  <div className="size-14 flex items-center justify-center rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-all shadow-lg">
                    <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">auto_awesome</span>
                  </div>
                  <span className="text-[10px] font-bold text-white group-hover:text-primary transition-colors">AI特效</span>
                </button>
                <button onClick={() => navigate('/volume')} className="flex flex-col items-center gap-2 group">
                  <div className="size-14 flex items-center justify-center rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-all shadow-lg">
                    <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">volume_up</span>
                  </div>
                  <span className="text-[10px] font-bold text-white group-hover:text-primary transition-colors">音量</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom UI Area */}
      <div className={`${isEditing ? 'hidden' : 'absolute inset-x-0 bottom-0 z-20 flex flex-col bg-gradient-to-t from-black/60 to-transparent'}`}>
        {!isEditing && (
          <>
            {/* Playback Progress */}
            <div className="px-6 pb-4">
              <div className="relative flex h-1 w-full items-center rounded-full bg-white/30">
                <div className="h-1 w-1/3 rounded-full bg-primary"></div>
                <div className="absolute left-1/3 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-primary shadow-lg"></div>
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-medium text-white/80">
                <span>01:12</span>
                <span>03:45</span>
              </div>
            </div>

            {/* Action Buttons Panel */}
            <div className="flex flex-col gap-4 rounded-t-[2.5rem] bg-white/80 p-6 pb-8 backdrop-blur-2xl shadow-2xl border-t border-white/20">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300/50 mb-2"></div>
              <div className="flex items-center gap-3">
                <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100/50 text-slate-700 font-semibold backdrop-blur-sm">
                  <span className="material-symbols-outlined text-xl">send</span>
                  <span>发布</span>
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 ${isExporting ? 'opacity-60' : ''}`}
                >
                  <span className="material-symbols-outlined text-xl">download</span>
                  <span>{isExporting ? '导出中...' : '保存视频'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

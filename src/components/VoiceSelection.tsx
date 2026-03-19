import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VoiceSelection() {
  const navigate = useNavigate();
  const [showVolume, setShowVolume] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(100);

  return (
    <div className="bg-background-dark font-display text-slate-100 overflow-hidden h-screen w-screen flex flex-col">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type='range'] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          outline: none;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #007aff;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(0, 122, 255, 0.5);
        }
      `}</style>
      {/* Video Preview Section (9:16 Aspect Ratio) */}
      <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full max-w-[420px] aspect-[9/16] bg-slate-900 overflow-hidden">
          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK_gOmZlzeFW9QIj2lTOm_vIUpvrBngDbaWE22J-qIJBjBBAxSGuwMM0DsEJmTZnBmOtRnGn6Z-laddvleSNNnew0Vuqp_IJriKP3Vae0Q4ItsSrMr1UatrdUTni7VxvLlWQH7DqAgbzD2bradu75Hwu3lh7qdMkhv-1bWcY_Cv4srGEmW449FmLKWgD7von4Bsa8zgCXU7m5h-xEHQ0wkT41q0_cVsuCD0A4T_58YaX2Tn38dPO7J0Pin0ME27QrwWLGb-2baaFc" />
          {/* Video Controls Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-b from-black/20 via-transparent to-black/40">
            <div className="flex justify-between items-start">
              <button onClick={() => navigate('/video-editor')} className="size-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-white">chevron_left</span>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button className="size-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white fill-1">play_arrow</span>
                </button>
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-white">00:12 / 00:45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Selection Panel (Glassmorphism) */}
      <div className="relative rounded-t-3xl flex flex-col h-1/3 bg-zinc-900/95 backdrop-blur-2xl border-t border-white/10">
        {/* Header & Tabs */}
        <div className="px-4 pt-2 shrink-0">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-1 rounded-full bg-white/10"></div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-6">
              <button 
                onClick={() => setShowVolume(false)}
                className="relative pb-2"
              >
                <span className={`text-lg font-semibold transition-colors ${!showVolume ? 'text-white' : 'text-white/40'}`}>音色</span>
                {!showVolume && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
              </button>
              <button 
                onClick={() => setShowVolume(true)}
                className="relative pb-2"
              >
                <span className={`text-lg font-semibold transition-colors ${showVolume ? 'text-white' : 'text-white/40'}`}>音量</span>
                {showVolume && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
              </button>
            </div>
            <button onClick={() => navigate('/video-editor', { state: { isEditing: true } })} className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-xl font-bold">check</span>
            </button>
          </div>
        </div>
        
        {!showVolume ? (
          <>
            {/* Categories Scrollable Row */}
            <div className="flex gap-2 px-4 mb-4 overflow-x-auto no-scrollbar shrink-0">
              <button className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white whitespace-nowrap">全部</button>
              <button className="px-4 py-1.5 rounded-full bg-white/5 border border-transparent text-xs font-medium text-white/40 whitespace-nowrap">解说</button>
              <button className="px-4 py-1.5 rounded-full bg-white/5 border border-transparent text-xs font-medium text-white/40 whitespace-nowrap">营销</button>
              <button className="px-4 py-1.5 rounded-full bg-white/5 border border-transparent text-xs font-medium text-white/40 whitespace-nowrap">动漫</button>
              <button className="px-4 py-1.5 rounded-full bg-white/5 border border-transparent text-xs font-medium text-white/40 whitespace-nowrap">男生</button>
              <button className="px-4 py-1.5 rounded-full bg-white/5 border border-transparent text-xs font-medium text-white/40 whitespace-nowrap">女生</button>
            </div>
            
            {/* Apply to All Checkbox */}
            <div className="px-4 mb-4 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="size-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-[12px] text-primary">check</span>
                </div>
                <span className="text-xs text-slate-400">应用到相同音色的分镜</span>
              </label>
            </div>
            
            {/* Grid of Voices */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 no-scrollbar">
              <div className="grid grid-cols-3 gap-3">
                {/* Selected Card */}
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 border-2 border-primary ring-4 ring-primary/10 transition-all">
                  <div className="size-12 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-white">mic</span>
                  </div>
                  <span className="text-[11px] font-bold text-white text-center leading-tight">晓晓 | 女声</span>
                </button>
                
                {/* Other Cards */}
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-slate-400">person</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 text-center leading-tight">么妹</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-slate-400">campaign</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 text-center leading-tight">网文解说</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-slate-400">male</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 text-center leading-tight">粤语男声</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-slate-400">face_3</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 text-center leading-tight">蕾蕾 | 气质女生</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-slate-400">person_4</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 text-center leading-tight">Rodrigo</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-slate-400">brand_awareness</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 text-center leading-tight">魔粤琪</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-slate-400">military_tech</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 text-center leading-tight">百变舰长</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-slate-400">account_circle</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 text-center leading-tight">魔丁宏</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col px-8 py-6 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-300">文本音量</span>
                <span className="text-xs font-mono text-primary">{voiceVolume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={voiceVolume} 
                onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

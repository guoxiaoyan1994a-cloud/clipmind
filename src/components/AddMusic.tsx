import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddMusic() {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('动感');
  const [showVolume, setShowVolume] = useState(false);
  const [videoVolume, setVideoVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(50);
  
  const [selectedMusicId, setSelectedMusicId] = useState(1);
  
  const musicList = [
    { id: 1, title: 'Midnight City', artist: 'M83', duration: '04:03' },
    { id: 2, title: 'Summer Vibe', artist: 'Lofi Girl', duration: '02:45' },
    { id: 3, title: 'Neon Streets', artist: 'Retro Waves', duration: '03:12' },
    { id: 4, title: 'Golden Hour', artist: 'JVKE', duration: '03:51' },
  ];
  
  const tags = [
    { id: '动感', label: '动感', icon: 'bolt' },
    { id: '流行', label: '流行', icon: 'favorite' },
    { id: '纯音乐', label: '纯音乐', icon: 'piano' },
    { id: 'Vlog', label: 'Vlog', icon: 'videocam' },
  ];
  
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0a0a0f] text-slate-100 font-display">
      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
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

      {/* Top App Bar */}
      <div className="flex items-center justify-between p-4 z-20 shrink-0">
        <button 
          onClick={() => navigate('/video-editor', { state: { isEditing: true } })} 
          className="flex size-10 items-center justify-center rounded-full bg-white/5 text-slate-100 hover:bg-white/10 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={() => navigate('/video-editor', { state: { isEditing: true } })} 
          className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">check</span>
        </button>
      </div>
      
      {/* Video Preview Section (Top 2/3) */}
      <div className="flex-1 px-6 py-4 flex flex-col items-center justify-center overflow-hidden">
        <div className="relative w-full aspect-[9/16] max-h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900/50">
          <img 
            className="w-full h-full object-cover opacity-40" 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800" 
            referrerPolicy="no-referrer"
          />
          {/* Playback Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-5 border border-white/20 shadow-xl">
              <span className="material-symbols-outlined text-white text-5xl leading-none">play_arrow</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/80 font-mono">00:12</span>
              <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/3 rounded-full shadow-[0_0_10px_rgba(0,122,255,0.5)]"></div>
              </div>
              <span className="text-[10px] text-white/80 font-mono">00:45</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Music Selection Panel (Bottom 1/3) */}
      <div className="h-1/3 bg-[#12121a] rounded-t-[32px] border-t border-white/10 flex flex-col overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Pull Handle */}
        <div className="w-full flex justify-center py-3 shrink-0">
          <div className="h-1.5 w-12 bg-white/10 rounded-full"></div>
        </div>
        
        {/* Categories */}
        <div className="flex px-6 py-1 shrink-0">
          <div className="flex gap-8">
            <button 
              onClick={() => setShowVolume(false)}
              className={`relative pb-3 text-sm transition-colors ${!showVolume ? 'font-bold text-white' : 'font-medium text-slate-500'}`}
            >
              推荐音乐
              {!showVolume && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
            <button 
              onClick={() => setShowVolume(true)}
              className={`relative pb-3 text-sm transition-colors ${showVolume ? 'font-bold text-white' : 'font-medium text-slate-500'}`}
            >
              音量
              {showVolume && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
          </div>
        </div>
        
        {!showVolume ? (
          <>
            {/* Tags */}
            <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar shrink-0">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(tag.id)}
                  className={`flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-full px-4 transition-all ${
                    activeTag === tag.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tag.icon}</span>
                  <p className={`text-xs ${activeTag === tag.id ? 'font-bold' : 'font-medium'}`}>{tag.label}</p>
                </button>
              ))}
            </div>
            
            {/* Music List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
              {musicList.map((music) => (
                <div 
                  key={music.id} 
                  className={`flex items-center gap-4 py-4 border-t border-white/5 first:border-t-0 group cursor-pointer`}
                  onClick={() => setSelectedMusicId(music.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold truncate transition-colors ${selectedMusicId === music.id ? 'text-primary' : 'text-slate-200 group-hover:text-white'}`}>
                      {music.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{music.artist} • {music.duration}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {selectedMusicId === music.id ? (
                      <>
                        <div className="flex gap-0.5 items-end h-3">
                          <div className="w-0.5 bg-primary animate-[music-bar_0.8s_ease-in-out_infinite] h-full"></div>
                          <div className="w-0.5 bg-primary animate-[music-bar_1.2s_ease-in-out_infinite] h-2/3"></div>
                          <div className="w-0.5 bg-primary animate-[music-bar_0.9s_ease-in-out_infinite] h-1/2"></div>
                        </div>
                        <span className="material-symbols-outlined text-primary text-2xl">pause</span>
                      </>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMusicId(music.id);
                        }}
                        className="size-10 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-primary hover:text-white transition-all"
                      >
                        <span className="material-symbols-outlined text-xl">add</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col px-8 py-6 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-300">配乐音量</span>
                <span className="text-xs font-mono text-primary">{musicVolume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={musicVolume} 
                onChange={(e) => setMusicVolume(parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

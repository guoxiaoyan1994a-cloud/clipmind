import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VolumeSettings() {
  const navigate = useNavigate();
  const [volume, setVolume] = useState(100);

  return (
    <div className="relative h-screen w-full max-w-md mx-auto flex flex-col bg-black overflow-hidden font-display antialiased">
      <style>{`
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

      {/* Top Controls Overlay */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 pt-12 px-6">
        <button onClick={() => navigate('/video-editor', { state: { isEditing: true } })} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md border border-white/10 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      </div>

      {/* Video Preview Section (9:16) */}
      <div className="relative flex-1 w-full bg-slate-900 flex items-center justify-center">
        <div className="relative w-full h-full">
          <img alt="Baby eating food with a messy face" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTF5DlHMgqNtRDpyVDv3Tn-414YRac4MTgnEpWnI51GLOjisS9VL2fKe7Kzi9qvwxEEiArBjU7pX2tJOVHTCgfv9ibNnDnlPezf9ZOlQAx20EMaSQGHlJ9JBZbB5Vy1ZBBj7zhJST0FVU5ndA03bh0nN_EQ19wL7vjUi2PYISTrtN-cpBraILA_SOxlw0Tp6Oc8gfkWxn_3sWhTed219Am4gFs-kL0At9YBqOQWLOOIXiHXtGKG1LVZTv18fj25n_Sxto9Sy3BTOE" />
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-white text-4xl leading-none">play_arrow</span>
            </div>
          </div>
          {/* Video Progress Bar */}
          <div className="absolute inset-x-0 bottom-4 px-6">
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/3 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Integrated Bottom Panel */}
      <div className="h-[33.33vh] bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="w-10 h-10"></div> {/* Spacer to keep title centered */}
          <div className="flex flex-col items-center">
            <span className="text-white text-base font-bold tracking-wide">音量</span>
            <div className="mt-1 h-1 w-6 bg-primary rounded-full"></div>
          </div>
          <div className="flex-1 flex justify-end">
            <button onClick={() => navigate('/video-editor', { state: { isEditing: true } })} className="w-10 h-10 flex items-center justify-center text-white bg-primary rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-transform">
              <span className="material-symbols-outlined font-bold text-xl">check</span>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-8 space-y-8 mt-4 flex-1 overflow-y-auto pb-10">
          {/* Volume Slider Block */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-300">视频原声</span>
              <span className="text-xs font-mono text-primary">{volume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={volume} 
              onChange={(e) => setVolume(parseInt(e.target.value))}
            />
          </div>
          
          {/* Toggle Switch Area */}
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex flex-col">
              <span className="text-white text-sm font-bold">全局应用</span>
              <span className="text-slate-500 text-xs">将此音量设置应用至所有片段</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input className="sr-only peer" type="checkbox" value="" />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

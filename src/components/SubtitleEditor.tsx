import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubtitleEditor() {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-start overflow-hidden bg-black text-slate-100 font-display">
      {/* Video Preview Section (9:16) */}
      <div className="relative w-full max-w-[400px] h-full flex items-center justify-center p-4 pb-80">
        <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-slate-900">
          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABx39ZWXr3STSdaQK74dGiHDfgQh0wm8Gw3mbCbs2H5vclZ_hNAdL9T3cvUUbVkF2XlivEZeXyYWgjW5mAyex8ZWIIvem5OzLTqhdHssd6clSkngis2H7k1lMQn12LVVuWfRETptseM_TZbNj-dnboNzDj3saScIyo-tvnBHOgqg0NN22PbE6EvTgFCzKNEDwDdNrTYtbrujQtdL3Pd-1tu53pNSuPXIxZUetHDnLTxK8xxDnCvI_nfI7mcs6y14sReuVcssl_H8M" />
          {/* Playback Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="flex items-center justify-center rounded-full size-16 bg-black/30 backdrop-blur-md text-white border border-white/20 transition-transform active:scale-95">
              <span className="material-symbols-outlined !text-4xl fill-1">play_arrow</span>
            </button>
          </div>
          {/* Active Subtitle Preview on Video */}
          <div className="absolute bottom-16 left-0 right-0 px-8 text-center">
            <p className="bg-black/60 backdrop-blur-sm inline-block px-4 py-2 rounded-lg text-white text-lg font-medium shadow-lg">
              排骨，还要一个嘛？
            </p>
          </div>
          {/* Video Progress Bar */}
          <div className="absolute inset-x-0 bottom-0 px-4 py-6 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex h-1.5 items-center justify-center gap-3">
              <p className="text-white text-[10px] font-medium opacity-80">00:12</p>
              <div className="h-1 flex-1 rounded-full bg-white/30 relative">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full"></div>
                <div className="absolute left-1/3 top-1/2 -translate-y-1/2 size-3 rounded-full bg-white border-2 border-primary shadow-sm"></div>
              </div>
              <p className="text-white text-[10px] font-medium opacity-80">00:45</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Integrated Bottom Panel */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-zinc-900/95 backdrop-blur-2xl border-t border-white/10 flex flex-col max-h-[70%]">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <button onClick={() => navigate('/video-editor', { state: { isEditing: true } })} className="flex items-center justify-center size-10 rounded-full bg-white/10 text-slate-400 hover:text-slate-200 active:scale-95 transition-all">
            <span className="material-symbols-outlined !text-xl">close</span>
          </button>
          <h2 className="text-white text-lg font-bold tracking-tight">字幕编辑</h2>
          <button onClick={() => navigate('/video-editor', { state: { isEditing: true } })} className="flex items-center justify-center size-10 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined !text-xl">check</span>
          </button>
        </div>
        
        {/* Panel Content - Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-12 custom-scrollbar">
          {/* Subtitle Item 1 (Active/Playing) */}
          <div className="flex items-center gap-3 bg-primary/20 ring-1 ring-primary/30 p-3 rounded-xl">
            <div className="flex items-center justify-center rounded-lg bg-primary shrink-0 size-8 text-white text-sm font-bold">1</div>
            <div className="flex-1">
              <input className="w-full bg-transparent border-none focus:ring-0 text-white text-base font-semibold p-0 outline-none" type="text" defaultValue="排骨，还要一个嘛？" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primary font-bold">00:10</span>
              <button className="text-primary hover:text-primary/80">
                <span className="material-symbols-outlined !text-2xl">visibility</span>
              </button>
            </div>
          </div>
          
          {/* Subtitle Item 2 */}
          <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors group border border-white/5">
            <div className="flex items-center justify-center rounded-lg bg-white/10 shrink-0 size-8 text-slate-400 text-sm font-bold">2</div>
            <div className="flex-1">
              <input className="w-full bg-transparent border-none focus:ring-0 text-slate-300 text-base p-0 outline-none" type="text" defaultValue="真的很好吃呀" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold">00:15</span>
              <button className="text-slate-500 hover:text-slate-300">
                <span className="material-symbols-outlined !text-2xl">visibility</span>
              </button>
            </div>
          </div>
          
          {/* Subtitle Item 3 */}
          <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors group border border-white/5">
            <div className="flex items-center justify-center rounded-lg bg-white/10 shrink-0 size-8 text-slate-400 text-sm font-bold">3</div>
            <div className="flex-1">
              <input className="w-full bg-transparent border-none focus:ring-0 text-slate-300 text-base p-0 outline-none" type="text" defaultValue="这是我吃过最香的排骨" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold">00:18</span>
              <button className="text-slate-500 hover:text-slate-300">
                <span className="material-symbols-outlined !text-2xl">visibility</span>
              </button>
            </div>
          </div>
          
          {/* Subtitle Item 4 (Hidden) */}
          <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors group border border-white/5 opacity-60">
            <div className="flex items-center justify-center rounded-lg bg-white/10 shrink-0 size-8 text-slate-400 text-sm font-bold">4</div>
            <div className="flex-1">
              <input className="w-full bg-transparent border-none focus:ring-0 text-slate-300 text-base p-0 outline-none" type="text" defaultValue="宝宝表情真丰富" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold">00:22</span>
              <button className="text-slate-500 hover:text-slate-300">
                <span className="material-symbols-outlined !text-2xl">visibility_off</span>
              </button>
            </div>
          </div>
          
          {/* Subtitle Item 5 */}
          <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors group border border-white/5">
            <div className="flex items-center justify-center rounded-lg bg-white/10 shrink-0 size-8 text-slate-400 text-sm font-bold">5</div>
            <div className="flex-1">
              <input className="w-full bg-transparent border-none focus:ring-0 text-slate-300 text-base p-0 outline-none" type="text" defaultValue="笑得合不拢嘴" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold">00:26</span>
              <button className="text-slate-500 hover:text-slate-300">
                <span className="material-symbols-outlined !text-2xl">visibility</span>
              </button>
            </div>
          </div>
          
          {/* Add Button */}
          <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-sm font-medium">新增字幕</span>
          </button>
        </div>
        
        {/* Bottom Floating Action */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-background-dark to-transparent pointer-events-none"></div>
      </div>
      
      {/* Navigation Bar (Mimicking Mobile OS) */}
      <div className="absolute bottom-2 h-1 w-32 bg-white/20 rounded-full left-1/2 -translate-x-1/2 z-20"></div>
    </div>
  );
}

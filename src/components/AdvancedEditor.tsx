import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdvancedEditor() {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary/30">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/video-editor')} className="flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold leading-tight">One Day (Remix)</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Music Track Info</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-xl">help</span>
          </button>
          <button className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
            导出
          </button>
        </div>
      </header>
      
      {/* Video Player Section */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="relative w-full bg-black flex items-center justify-center aspect-[9/16] max-h-[60%]">
          <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsKCTX1zntaWy9Ab1KoGHD4ClhGI4IvgYOyqLljOHeCgORhSuFGs1_-Nhk4cKqVWqXood_d4Rs4VZXeULWslAK3Dn0xSiQntHqNg5floQLbC4v83WtMGENUmvLHbNcGRMYImqmLVDMVCkX77y6GzpDJIfv-Bq8UqIy9Bo8aDbNKotJzoZyS_kn3flyseQjRxN987HYC7UznN7SpL25aK1-WhNuk22hFcBbdv3NoXj2a6suLrrQ2qyed8daeb-9IISMLNiytpqzm2Y')"}}></div>
          {/* Center Play Button Overlay */}
          <button className="relative z-10 flex items-center justify-center rounded-full size-16 bg-black/40 text-white backdrop-blur-sm border border-white/20">
            <span className="material-symbols-outlined text-4xl translate-x-0.5">play_arrow</span>
          </button>
          {/* Frame Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/80 font-mono">
            00:00:12:04
          </div>
        </div>
        
        {/* Controls Area */}
        <div className="p-4 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">00:00 | 00:33</span>
              <div className="flex gap-6">
                <button className="text-slate-600 dark:text-slate-400 hover:text-primary"><span className="material-symbols-outlined">undo</span></button>
                <button className="text-slate-600 dark:text-slate-400 hover:text-primary"><span className="material-symbols-outlined">redo</span></button>
                <button className="text-slate-600 dark:text-slate-400 hover:text-primary"><span className="material-symbols-outlined">fullscreen</span></button>
              </div>
            </div>
            <div className="relative h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Scrollable Timeline */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-900/50 p-4">
          <div className="flex flex-col gap-4">
            {/* Timeline Item: Scene 1 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">分镜 1</h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">4.2s</span>
              </div>
              <div className="flex gap-3 bg-white dark:bg-background-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUcZJm5dgmhDTaZJvGAgs3Sf0aM4McPoqGmMTOWq9eAfngccxjoKDqYc1EKSKJ89cd21i48cNRhmW8fDobdEKyDvBtiMj_KX7cjYvNV7tELS9YweGyHheZEqWRu49FY7okQ5NGwqti4GRVtMxrtdEFuGHSS7dK_8fKsiDv_SZ92QHWprAkB8w9r_m7sDU8_IsSnrDtPnHiK5HJ68Dok3NU9xsHxOAED_V1y4QfJs8qVU1EKOMpA2xXs_lrvG1tA5Sro_NSaBSTFIw" />
                </div>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-primary uppercase">TTS / Voiceover</p>
                    <p className="text-sm font-medium leading-relaxed">排骨，还要一个嘛？</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">mic</span> 晓晓 (女声)
                    </span>
                  </div>
                </div>
                <button className="self-center text-slate-300 dark:text-slate-600">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
            
            {/* Timeline Item: Scene 2 */}
            <div className="flex flex-col gap-2 opacity-60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">分镜 2</h3>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">3.5s</span>
              </div>
              <div className="flex gap-3 bg-white dark:bg-background-dark p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7WF4-xJyzCNy7enR1jP4WUT_YyaaAmgTfLCzDIQDr82piA0R5iYldC5-uNr6dEQj7ODSb6iRsqwzl8Q4kSzXrx-NK40DfGhyd3MHHS12nCDtsSxNlPOMoUBGdT-rcIb8O3Ojc6-9bAFW-ZZpCzxu5jh5RsbZI8LgKqFtOLV7CcZR_ZocmZer6ShkFX8kr0XgrfOZlFYxMNjpEfkyP1RWKUnMn4ONMnVa2X46Yfjkfi9RNQAtryeHsrWQzeW2BG7-Mhgu-f1JvLUg" />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <p className="text-sm text-slate-400 italic">点击添加文案...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

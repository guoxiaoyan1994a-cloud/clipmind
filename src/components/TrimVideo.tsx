import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrimVideo() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen font-display bg-black text-white overflow-hidden">
      {/* Header Navigation */}
      <header className="safe-top flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md z-50">
        <button onClick={() => navigate('/video-editor', { state: { isEditing: true } })} className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h1 className="text-white text-lg font-semibold">裁剪视频</h1>
        <button onClick={() => navigate('/video-editor', { state: { isEditing: true } })} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">check</span>
        </button>
      </header>
      
      {/* Main Preview Area */}
      <main className="flex-grow flex flex-col items-center justify-center bg-black overflow-hidden px-6">
        {/* Video Preview Card (9:16 Aspect) */}
        <div className="relative w-full aspect-[9/16] max-h-[75%] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOju-QoBmPIml8vmWtFAUBPEjshoCb_IUcHkcXrlvAMBAkiwzLvUGSPKr_haOj0XdqUOiNtTbQYJIrEBB84_rpJM3lrNaoaGLL6tGJIx6okgCkCEm-jpRE_pcEGWJ3OmxlAymPY0xogPbC3te0jJmNZwK3x2v5WIvk4owfMkTXDZrZOYjGQEa9VJdguHtEQWc3x249hcgUeafmhTjUfn0n3O_rkEaOvIHMkk5zCByvxxrbHFdIQcIZ4igcRH_77NRMjPppUEfqPJQ" />
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/20 backdrop-blur-sm rounded-full p-4">
              <svg className="h-8 w-8 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z"></path>
              </svg>
            </div>
          </div>
        </div>
      </main>
      
      {/* Trimming Controls */}
      <section className="bg-zinc-900/95 backdrop-blur-2xl border-t border-white/10 px-4 pt-4 pb-10">
        {/* Duration Display */}
        <div className="flex justify-center mb-4">
          <span className="text-sm font-bold text-slate-400">
            当前时长 <span className="text-primary ml-1">1s</span>
          </span>
        </div>
        
        {/* Timeline/Trimmer Bar */}
        <div className="relative h-16 w-full flex items-center mb-4">
          {/* Thumbnails Track (Simulated) */}
          <div className="absolute inset-0 flex overflow-hidden rounded-lg opacity-80 border border-white/10">
            <img className="h-full w-1/5 object-cover brightness-75" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuCrngp0hLv37ZP6LcoOXih_IBW2ofR6mKDyG8Eq_Ab-U7y-kJBOfivVTYYKcSWcrOc7Qe0wOpXkSqWuiO0p9gstNburTMqY5nKhcjt85R5ohUgtLKHeZgOgGk-GQV_d3-aGloWsh1zLTWOA0qKdOcOJugsvTW7Ti1x_CYdrWKgw9OPDAGPB2J0DlT6SLA5gGQt_kp0VKMLXNMjkX_7zPEMHk3V_RZn6RzXqg3_lhBZkbNEXTXOVsE220p9_Ir-EO-v95QhRiwKT4" />
            <img className="h-full w-1/5 object-cover brightness-75" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrVyYAcoyBZ1_uky6-rhzcdysIZvh7JT0ToAf8FkMFQYB2XseNOzgDeqBZLO9YPf5FodG9denlo9V7jKzrZYm4fbtjq0AMMWrH1CHG82st4rh_yoPIXyalqCKAF_U2IHptbPqoMt8KhMVnN-rN2bwoFOqVtChUBEMkpuqtXLr8tRRWlOF1KBRvb0YBvw7G9vkntpkTnpHP4-V_CbSRWTxm9zfx_hCKx5TZAoznqDtPlu5XbwSkd0KY7d7XEUT2N_WkjybNdRLolWQ" />
            <img className="h-full w-1/5 object-cover brightness-75" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0RedFdwOkZbw2SKY13v5YZHvOJj-9gbs5antWXSXMkaa7jrMa3iV2M6uRFPcNXfpUgyCsOy5YFzHuOjyUeFgorzkAJlEGmd7Dy762V8Xj66QFBBsZSbNiro6MAN_CReB7UavibqBzzX2-jfHFaAtkUbNhE7wtAv8fODye66SYUGetghP4L5Tn4iz8CcbXOwjyEXL59wc_OCIYvinefR_RsyP2PDcJesknY0J2W2IXPhvwbQtFk9zNM1AeUOazii7TKWSiFxfZDxg" />
            <img className="h-full w-1/5 object-cover brightness-75" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz6C63K0CF6qAfqOk6-dWMubZDaHABd_GcgsQQGA4HU1yFdQ8TiZj15wcCHuvnKIswZbewdkVrIyR1k60GeGUqBHdStOUJpuJ08iws8YaE7KkIuo1zTszm8vKuz8OgXSWmfbZ6yM4AKuxRFhehxZTvUuMkElKOyxB3jpRIGLPT-MaoQF3DaMDnpdJaCn3iQ78XkxBwn47AhHitSVnMEgAezjMxQfg4ho9V3pGrgSMYyXgEs25duj8cRxJsubjHS1WokciiLqrP6vw" />
            <img className="h-full w-1/5 object-cover brightness-75" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyw4F5bHaYrpXcWKBDiGDVx7LPgO4wlhzXCYBEn2q_f4FnaudcLkiQoPOw3YyEpncS4WarXzBXjkXcqfAdmbcH-2by_ndl5fiLxAgD1c7OE_Wcszf1AbyK73jZwUAKU0P7Ho3URz2ADResBOfZZvGGp6ANiJb7s8vPLcJ6KI7E05o9STe8AAAKQGsPoEMoZmxBbmiHu3zJlQUhLT9ICK9pzgYlQ5IcQ_8_AIf2_N508G0baTcJ5txr3OeNLh5l2dZZCVFa-Ncrj3c" />
          </div>
          
          {/* Selection Window & Handles */}
          <div className="absolute inset-y-0 left-[20%] right-[35%] border-y-[3px] border-primary flex items-center cursor-grab active:cursor-grabbing group">
            {/* Center Clear Area - Draggable Overlay */}
            <div className="flex-grow h-full bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            {/* Left Handle */}
            <div className="absolute -left-1 inset-y-[-3px] w-4 bg-primary rounded-l-md flex items-center justify-center trimmer-handle cursor-ew-resize shadow-[0_0_15px_rgba(0,122,255,0.4)]">
              <div className="w-1 h-6 bg-white/40 rounded-full"></div>
            </div>
            {/* Right Handle */}
            <div className="absolute -right-1 inset-y-[-3px] w-4 bg-primary rounded-r-md flex items-center justify-center trimmer-handle cursor-ew-resize shadow-[0_0_15px_rgba(0,122,255,0.4)]">
              <div className="w-1 h-6 bg-white/40 rounded-full"></div>
            </div>
            {/* Playhead Line */}
            <div className="absolute left-1/3 top-[-8px] bottom-[-8px] w-0.5 bg-white shadow-sm z-10"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

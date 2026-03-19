import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AIGenerate() {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-screen w-full flex-col bg-background-dark font-display text-slate-100 antialiased overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCG_QbO6ZcSr56bKVxnHTFPa9gAR4FCoOe0gCV4FKB0wVhLXovLZD_c83_ligjtdriZGU_Ywj31kiY_eh2w63NL0ryGzVJwPG9SkU3gG4h5UGlCw20XNNIRg8alrT5LyvP4aSx0vCA4wocG8ORKh1dcxwpZgOg5uZjreHm8VqEEckLF0QrCs6gRQgJysIh6_XS-IjzEV_XVw7PqoKvwkaoVNUNh8gozdgHFDfEBVu_wjsrOvyhrVp0GrS-8JYQIP9jQ9JjWEhIw8u8')"}}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background-dark/80"></div>
        </div>
      </div>
      
      <div className="relative z-10 flex items-center justify-between p-4 pt-12">
        <button onClick={() => navigate('/video-editor', { state: { isEditing: true } })} className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h2 className="text-lg font-bold tracking-tight text-white">ClipMind AI</h2>
        <div className="size-10"></div> {/* Spacer */}
      </div>
      
      <div className="relative z-10 flex flex-1 items-center justify-center pb-64">
        <div className="flex flex-col items-center gap-4">
          <button className="flex size-20 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xl border border-white/10">
            <span className="material-symbols-outlined !text-4xl fill-1">play_arrow</span>
          </button>
          <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium backdrop-blur-md text-white/80">00:12 / 02:23</div>
        </div>
      </div>
      
      <div className="h-[55vh] absolute bottom-0 left-0 right-0 z-20 flex flex-col bg-zinc-900/95 backdrop-blur-2xl border-t border-white/10 px-6 pb-10 pt-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white tracking-tight">AI 生成素材</h3>
        </div>
        
        <div className="mb-8">
          <div className="relative">
            <textarea 
              className="w-full h-40 rounded-2xl border border-white/10 bg-white/5 p-4 pb-14 text-sm leading-relaxed text-white placeholder-slate-500 resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              placeholder="描述你想要的画面..."
              defaultValue="亮调暖色调风格，近景镜头，视角平视。家庭餐厅(明亮的室内餐厅，光线柔和，背景简洁温馨，有白色餐椅和原木色餐桌，桌上摆放着精致的餐具和一小盆绿植)..."
            ></textarea>
            <button className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>生成</span>
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-500">历史记录</h4>
          </div>
          <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-2">
            <div className="relative min-w-[100px] shrink-0">
              <div className="aspect-square rounded-xl border-2 border-primary bg-cover bg-center p-1 overflow-hidden" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOeu4w9iZNf18yYJDAUhMOcCgOXR383aGzLzg8AgTHNnCoawbU-inLEnR1mkbkW6-ATiOi2rZVR-7TLWUs1VSgPGoLTNpGGFVR_W64yVhWGRoCqtjyI4aLHN_9Cgo-2WQNxHpX9BYgSi2pY2jFEZg1Ds0dMJfUva0POrSgFiekMAfIDAA0UiCEBzFRV5RQyfSvfKzSD0psMx0ZeiUxwgThQ4FmTCkR9I27JW8vnRyIKwxtPBhWK-hQxyZFxQpde6Hxg4nSLS3H7ns')"}}>
                <div className="absolute top-2 left-2 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-white uppercase">原素材</div>
              </div>
            </div>
            <div className="min-w-[100px] shrink-0">
              <div className="aspect-square rounded-xl bg-white/10 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAemAdptrf7A-342XHqMRQ-_ANDuzEZMZTuV-JYoJY0QyA9n6VPBlqtJ0a417bUjJAihttKOAVmhIgmtL-J2CDrE5GwjlPJNB5QYYUZqWacLblUIDYfViQDRe-HnG0SjYa8T8QASdTE1T61k6uw7cJtsfJAp27tPhuoxoEjIM_1H4dnwcmIC-qUs8kR5Ri5o9I1oLWDrQWzw-KURmNalnhZAdiQ0MBxmOim2DuM9YGjAhuh_KedW7i3J03GeL9BH4BjFCHhcXZYEyY')"}}></div>
            </div>
            <div className="min-w-[100px] shrink-0">
              <div className="aspect-square rounded-xl bg-white/10 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAB0wh-pNo9BfFpm2-ATOokGgoPp2RnEHNs2TrvKUFKv0PPrMtwRQDk4LOUKeRy1l8ZobbNbqRLkYXdVk0k9RKAB8we3eQQCKx-spAed-J5Gk9pISGl1Xr7QPshCIZkN_gCtraB3dj5GsSaB4Onr-QZp-RDR0RCwzIkFZoPN7gZYaBLnCsyIxbc7w6m5D15nu_smO5rlGsjJkvgZbMzoHRpDQFOnujr6_AgJw9bpHYQKawgvgyplEfux4TXXz-1iNFZ6UPTbiPPXh8')"}}></div>
            </div>
            <div className="flex min-w-[100px] shrink-0 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5">
              <span className="material-symbols-outlined text-slate-500">add</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

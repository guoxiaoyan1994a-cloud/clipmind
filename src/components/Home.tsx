import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const screens = [
    { path: '/video-editor', name: 'Video Editor (Main)' },
    { path: '/advanced-editor', name: 'Advanced Editor (One Day Remix)' },
    { path: '/add-music', name: 'Add Music' },
    { path: '/register', name: 'Register' },
    { path: '/login', name: 'Login' },
    { path: '/voice-selection', name: 'Voice Selection' },
    { path: '/subtitle-editor', name: 'Subtitle Editor' },
    { path: '/ai-generate', name: 'AI Generate Material' },
    { path: '/trim-video', name: 'Trim Video' },
    { path: '/creator', name: 'Creator Center' },
    { path: '/volume', name: 'Volume Settings' },
    { path: '/projects', name: 'My Projects' },
    { path: '/smart-video-1', name: 'Smart Video - Step 1 (Analysis)' },
    { path: '/smart-video-3', name: 'Smart Video - Step 2 (Creative)' },
    { path: '/smart-video-2', name: 'Smart Video - Step 3 (Editing)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-display">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">ClipMind Screens</h1>
        <div className="grid gap-4">
          {screens.map((screen) => (
            <Link
              key={screen.path}
              to={screen.path}
              className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 text-slate-700 hover:text-primary font-medium flex items-center justify-between"
            >
              {screen.name}
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

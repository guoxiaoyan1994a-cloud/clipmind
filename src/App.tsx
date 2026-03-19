/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './services/authStore';
import VideoEditor from './components/VideoEditor';
import AdvancedEditor from './components/AdvancedEditor';
import AddMusic from './components/AddMusic';
import Register from './components/Register';
import Login from './components/Login';
import VoiceSelection from './components/VoiceSelection';
import SubtitleEditor from './components/SubtitleEditor';
import AIGenerate from './components/AIGenerate';
import TrimVideo from './components/TrimVideo';
import CreatorCenter from './components/CreatorCenter';
import VolumeSettings from './components/VolumeSettings';
import MyProjects from './components/MyProjects';
import Profile from './components/Profile';
import SmartVideoStep1 from './components/SmartVideoStep1';
import SmartVideoStep2 from './components/SmartVideoStep2';
import SmartVideoStep3 from './components/SmartVideoStep3';

export default function App() {
  // 应用启动时初始化 Supabase Auth 监听
  const initAuth = useAuthStore((s) => s.initAuth);
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-gray-100 dark:bg-gray-900">
      <div className="w-full h-[100dvh] sm:w-[375px] sm:h-[812px] bg-white dark:bg-black overflow-hidden relative transform sm:shadow-2xl sm:rounded-[40px] sm:border-[8px] sm:border-gray-800">
        <Router>
          <Routes>
            <Route path="/" element={<CreatorCenter />} />
            <Route path="/video-editor" element={<VideoEditor />} />
            <Route path="/advanced-editor" element={<AdvancedEditor />} />
            <Route path="/add-music" element={<AddMusic />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/voice-selection" element={<VoiceSelection />} />
            <Route path="/subtitle-editor" element={<SubtitleEditor />} />
            <Route path="/ai-generate" element={<AIGenerate />} />
            <Route path="/trim-video" element={<TrimVideo />} />
            <Route path="/creator" element={<CreatorCenter />} />
            <Route path="/volume" element={<VolumeSettings />} />
            <Route path="/projects" element={<MyProjects />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/smart-video-1" element={<SmartVideoStep1 />} />
            <Route path="/smart-video-2" element={<SmartVideoStep2 />} />
            <Route path="/smart-video-3" element={<SmartVideoStep3 />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

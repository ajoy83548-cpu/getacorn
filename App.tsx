import React, { useState } from 'react';
import { AppMode } from './types';
import ChatInterface from './components/ChatInterface';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import DeviceControl from './components/DeviceControl';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.CHAT);

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.CHAT: return <ChatInterface />;
      case AppMode.IMAGE_STUDIO: return <ImageStudio />;
      case AppMode.VIDEO_STUDIO: return <VideoStudio />;
      case AppMode.DEVICE_CONTROL: return <DeviceControl />;
      default: return <ChatInterface />;
    }
  };

  const NavItem = ({ mode, icon, label }: { mode: AppMode; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setActiveMode(mode)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeMode === mode 
          ? 'bg-slate-700 text-white shadow-lg' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium tracking-wide hidden md:block">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="leading-tight">
             <h1 className="font-bold text-lg text-white tracking-tight">AI for Future</h1>
             <p className="text-xs text-slate-500 font-mono">v1.0.0 // GEMINI</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem 
            mode={AppMode.CHAT} 
            label="Omni-Chat"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
          />
           <NavItem 
            mode={AppMode.IMAGE_STUDIO} 
            label="Image Studio"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <NavItem 
            mode={AppMode.VIDEO_STUDIO} 
            label="Video Studio"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          />
          <NavItem 
            mode={AppMode.DEVICE_CONTROL} 
            label="Device Hub"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
          />
        </nav>

        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 mb-2">System Status</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-mono">Gemini 2.5 Flash: Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-mono">Gemini 3 Pro: Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden h-screen">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
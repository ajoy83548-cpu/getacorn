import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setStatusMsg('Initializing Veo model...');
    
    try {
      setStatusMsg('Dreaming up video frames (this may take a minute)...');
      const url = await generateVideo(prompt);
      setVideoUrl(url);
    } catch (error) {
      console.error(error);
      setStatusMsg('Error generating video. Please ensure you have a paid API key selected for Veo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Video Studio (Veo)
        </h2>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-8 overflow-y-auto">
        <div className="w-full max-w-2xl text-center space-y-6">
          <div className="space-y-2">
             <label className="text-slate-300 font-medium block text-left">Video Prompt</label>
             <div className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A cinematic drone shot of a futuristic city at sunset..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 h-32 resize-none shadow-inner"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500">Veo 3.1</div>
             </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 transition-all transform hover:scale-105"
          >
            {isLoading ? 'Generating Video...' : 'Create Video'}
          </button>
          
          {isLoading && (
            <div className="text-emerald-400 animate-pulse text-sm">
                {statusMsg}
            </div>
          )}
        </div>

        {videoUrl ? (
          <div className="w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full aspect-video"
            />
            <div className="p-4 bg-slate-900 flex justify-between items-center">
                <span className="text-slate-400 text-sm truncate max-w-md">{prompt}</span>
                <a href={videoUrl} download className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">Download MP4</a>
            </div>
          </div>
        ) : (
            !isLoading && (
                <div className="w-full max-w-2xl border-2 border-dashed border-slate-800 rounded-xl h-64 flex flex-col items-center justify-center text-slate-600">
                    <svg className="w-16 h-16 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                    <p>Generated video will appear here</p>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default VideoStudio;
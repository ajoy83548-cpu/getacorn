import React, { useState } from 'react';
import { generateImage, editImageWithInstructions } from '../services/geminiService';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  
  // File upload for editing
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      if (mode === 'create') {
        const result = await generateImage(prompt, "1:1");
        setImageSrc(result);
      } else if (mode === 'edit' && imageSrc) {
        // Strip prefix for API if needed, but SDK usually handles inline data well if we prep it right.
        // We'll pass the base64 data part.
        const base64Data = imageSrc.split(',')[1]; 
        if (!base64Data) throw new Error("Invalid image data");
        const result = await editImageWithInstructions(base64Data, prompt);
        // If result is text (analysis), we show it (todo: better UI for text response in image mode), 
        // but if it's data URI, we update image.
        if (result.startsWith('data:image')) {
            setImageSrc(result);
        } else {
            alert(`AI Analysis/Edit Instructions: ${result}`);
        }
      }
    } catch (error) {
      alert("Failed to process image request.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setMode('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-pink-500 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Image Studio
        </h2>
        <div className="flex bg-slate-900 rounded-lg p-1">
            <button onClick={() => { setMode('create'); setImageSrc(null); }} className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'create' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}>Create</button>
            <button onClick={() => setMode('edit')} className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'edit' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}>Edit</button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-y-auto">
        {/* Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
            {mode === 'edit' && (
                <div className="p-4 border-2 border-dashed border-slate-600 rounded-xl hover:border-pink-500 transition-colors cursor-pointer text-center" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <p className="text-slate-400">Click to upload an image to edit</p>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                    {mode === 'create' ? 'Describe the image you want:' : 'How should I edit this image?'}
                </label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500 h-32 resize-none"
                    placeholder={mode === 'create' ? "A futuristic city with flying cars, cyberpunk style..." : "Add a neon sign that says 'Future'..."}
                />
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isLoading || !prompt}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
                {isLoading ? 'Processing...' : (mode === 'create' ? 'Generate Image' : 'Edit Image')}
            </button>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden min-h-[300px]">
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-pink-400 animate-pulse">Creating masterpiece...</p>
                </div>
            )}
            
            {imageSrc ? (
                <img src={imageSrc} alt="Generated result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            ) : (
                <div className="text-center text-slate-600">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>Image preview will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
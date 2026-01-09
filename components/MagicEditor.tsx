
import React, { useState, useRef } from 'react';
import { editImage, generateRecipeImage } from '../services/geminiService';

const MagicEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAction = async (type: 'EDIT' | 'GENERATE') => {
    setIsProcessing(true);
    setError(null);
    try {
      let result = "";
      if (type === 'EDIT' && selectedImage) {
        result = await editImage(selectedImage.split(',')[1], prompt);
      } else {
        result = await generateRecipeImage(prompt, aspectRatio, imageSize);
      }
      setSelectedImage(result);
    } catch (e) {
      setError("Operation failed. Try a different prompt.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">AI Magic Studio</h2>
              {selectedImage && (
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Clear Canvas
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Creative Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 'Add a bowl of pasta on the side' or 'Cinematic food lighting with dark background'"
                  className="w-full h-32 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none shadow-sm text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-slate-50 focus:bg-white transition-colors cursor-pointer"
                  >
                    {['1:1', '4:3', '3:4', '16:9', '9:16'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Resolution</label>
                  <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-slate-50 focus:bg-white transition-colors cursor-pointer"
                  >
                    {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
                
                <button
                  onClick={triggerFileUpload}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-3 text-slate-500 font-bold hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-[0.99]"
                >
                  <span className="text-xl">📷</span>
                  {selectedImage ? "Replace Base Image" : "Upload Base Image"}
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction('GENERATE')}
                    disabled={isProcessing || !prompt}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg active:scale-[0.98]"
                  >
                    {isProcessing ? 'Generating...' : 'Start New'}
                  </button>
                  <button
                    onClick={() => handleAction('EDIT')}
                    disabled={isProcessing || !selectedImage || !prompt}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-100 active:scale-[0.98]"
                  >
                    Apply AI Edit
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="mt-4 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          </div>
          
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="text-3xl">🪄</div>
            <div>
              <h4 className="font-bold text-sm">Studio Tip</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload a photo of your actual meal to let the AI suggest stylistic improvements or add virtual side dishes!
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-slate-200 rounded-3xl aspect-square overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl relative group">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt="Editor result" 
                className="w-full h-full object-contain bg-slate-100" 
              />
            ) : (
              <div className="text-slate-400 text-center px-8 transition-transform group-hover:scale-110 duration-500">
                <p className="text-7xl mb-4">🎨</p>
                <p className="font-bold text-slate-500">Studio Canvas</p>
                <p className="text-xs mt-2 text-slate-400">Generate or upload to begin</p>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-700 font-bold text-sm">Orchestrating AI...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicEditor;

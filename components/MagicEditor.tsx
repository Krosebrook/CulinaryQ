
import React, { useState } from 'react';
import { editImage, generateRecipeImage } from '../services/geminiService';

const MagicEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
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
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">AI Magic Studio</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 'A futuristic kitchen scene' or 'Add a retro film grain to this photo'"
                  className="w-full h-32 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                  >
                    {['1:1', '4:3', '3:4', '16:9', '9:16'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Resolution</label>
                  <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                  >
                    {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction('GENERATE')}
                    disabled={isProcessing || !prompt}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Generating...' : 'Create from Scratch'}
                  </button>
                  <button
                    onClick={() => handleAction('EDIT')}
                    disabled={isProcessing || !selectedImage || !prompt}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    Apply Edit
                  </button>
                </div>
                {!selectedImage && (
                  <label className="w-full text-center py-4 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                    <span className="text-slate-500 font-medium">Click to Upload Base Image</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            </div>
            {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-slate-100 rounded-3xl aspect-square overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl relative">
            {selectedImage ? (
              <img src={selectedImage} alt="Editor result" className="w-full h-full object-contain" />
            ) : (
              <div className="text-slate-400 text-center px-8">
                <p className="text-6xl mb-4">✨</p>
                <p className="font-medium">Your creation will appear here</p>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicEditor;

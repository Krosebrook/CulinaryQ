
import React from 'react';

const TechDocs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4">
      <header className="border-b border-slate-200 pb-8">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">AI Systems Documentation</h2>
        <p className="text-slate-500 text-lg mt-2 font-medium">Technical architecture and Gemini model orchestration for CulinaryGenie.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">V1</div>
            <h3 className="text-xl font-bold text-slate-800">Vision Engine</h3>
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            Utilizes <strong>gemini-3-flash-preview</strong> for low-latency visual analysis. The model processes real-time camera frames or uploaded images to extract structured data of food ingredients.
          </p>
          <ul className="space-y-2 text-sm font-medium text-slate-500">
            <li className="flex items-center gap-2">🟢 Zero-shot detection of raw produce</li>
            <li className="flex items-center gap-2">🟢 Packaging text OCR integration</li>
            <li className="flex items-center gap-2">🟢 RGB color-to-freshness mapping</li>
          </ul>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">R1</div>
            <h3 className="text-xl font-bold text-slate-800">Reasoning Core</h3>
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            Employs <strong>gemini-3-pro-preview</strong> with a thinking budget of 32,768 tokens. This enables complex "Pantry Logic" where the AI simulates substitutions and flavor profile matching.
          </p>
          <ul className="space-y-2 text-sm font-medium text-slate-500">
            <li className="flex items-center gap-2">🟢 User profile constraint satisfaction</li>
            <li className="flex items-center gap-2">🟢 Cross-referenced pantry inventory</li>
            <li className="flex items-center gap-2">🟢 Dynamic Step-by-Step generation</li>
          </ul>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold">M1</div>
            <h3 className="text-xl font-bold text-slate-800">Multimodal Output</h3>
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            Orchestrates <strong>gemini-3-pro-image-preview</strong> for 2K-resolution cinematic recipe previews. Integrates <strong>gemini-2.5-flash-native-audio</strong> for low-latency hands-free narration.
          </p>
          <ul className="space-y-2 text-sm font-medium text-slate-500">
            <li className="flex items-center gap-2">🟢 Real-time audio transcription</li>
            <li className="flex items-center gap-2">🟢 Prompt-based image manipulation</li>
            <li className="flex items-center gap-2">🟢 PCM raw audio stream decoding</li>
          </ul>
        </section>

        <section className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
          <h3 className="text-xl font-bold mb-4">Infrastructure Security</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            All data processed via encrypted environment context. API keys are injected at runtime through secured process variables.
          </p>
          <div className="flex gap-4">
            <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono">HTTPS/TLS 1.3</div>
            <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono">SANDBOXED V8</div>
          </div>
        </section>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-10 rounded-3xl text-center">
        <h4 className="text-2xl font-bold text-indigo-900 mb-4">Implementation Best Practices</h4>
        <p className="text-indigo-800 max-w-2xl mx-auto mb-8">
          The application follows Google's official GenAI SDK guidelines, including efficient session management for Live API and robust error handling for grounding retrievals.
        </p>
        <div className="flex justify-center gap-8 text-indigo-400 font-bold text-sm tracking-widest">
          <span>CLEAN CODE</span>
          <span>ACCESSIBILITY</span>
          <span>OFFLINE FIRST</span>
        </div>
      </div>
    </div>
  );
};

export default TechDocs;

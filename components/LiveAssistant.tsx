
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getAI, decodeBase64, decodeAudioData, encodeAudio } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';

const LiveAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startAssistant = useCallback(async () => {
    try {
      const ai = getAI();
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = encodeAudio(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-4), `Genie: ${msg.serverContent!.outputTranscription!.text}`]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev.slice(-4), `You: ${msg.serverContent!.inputTranscription!.text}`]);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live Error", e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a friendly culinary expert. Help the user with recipes, substitutions, and cooking tips. Keep it concise and helpful.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
      setIsActive(true);
    } catch (err) {
      console.error("Failed to start assistant", err);
    }
  }, []);

  const stopAssistant = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
  };

  return (
    <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 ${isActive ? 'w-80 h-96' : 'w-16 h-16'}`}>
      {isActive ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in">
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
            <span className="font-bold">Live Assistant</span>
            <button onClick={stopAssistant} className="text-white/70 hover:text-white">✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {transcript.map((line, i) => (
              <div key={i} className={`text-sm p-3 rounded-2xl ${line.startsWith('You:') ? 'bg-emerald-50 text-emerald-800 self-end' : 'bg-white text-slate-700 shadow-sm'}`}>
                {line}
              </div>
            ))}
            <div className="flex justify-center pt-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-1 h-6 bg-emerald-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Genie is listening...</p>
          </div>
        </div>
      ) : (
        <button
          onClick={startAssistant}
          className="w-16 h-16 bg-emerald-600 rounded-full shadow-xl shadow-emerald-200 flex items-center justify-center text-3xl hover:scale-110 transition-transform hover:bg-emerald-700"
          title="Open Voice Assistant"
        >
          🧞
        </button>
      )}
    </div>
  );
};

export default LiveAssistant;


import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';

interface StepByStepProps {
  recipe: Recipe;
  onClose: () => void;
  onAddToShoppingList: (items: string[]) => void;
}

const StepByStep: React.FC<StepByStepProps> = ({ recipe, onClose, onAddToShoppingList }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  const missingIngredients = recipe.ingredients.filter(i => i.isMissing).map(i => i.name);

  // Parse time from current step text
  useEffect(() => {
    const stepText = recipe.steps[currentStep];
    const timeMatch = stepText.match(/(\d+)\s*(minute|min|sec|second)s?/i);
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      const seconds = unit.startsWith('min') ? value * 60 : value;
      setTimeLeft(seconds);
      setIsTimerRunning(false);
    } else {
      setTimeLeft(null);
      setIsTimerRunning(false);
    }
  }, [currentStep, recipe.steps]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    speak(`Step ${currentStep + 1}. ${recipe.steps[currentStep]}`);
  }, [currentStep, recipe.steps]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      const alarm = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      alarm.play();
      speak("Timer complete!");
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4">
      <div className="md:w-1/3 bg-slate-900 text-white p-8 overflow-y-auto">
        <button onClick={onClose} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2">
          ← Exit Cooking Mode
        </button>
        <img src={recipe.imageUrl} alt={recipe.title} className="w-full aspect-video object-cover rounded-xl mb-6 shadow-2xl" />
        <h2 className="text-3xl font-bold mb-4">{recipe.title}</h2>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-widest mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className={`flex items-center gap-2 ${ing.isMissing ? 'text-slate-500' : 'text-slate-300'}`}>
                  <span className={ing.isMissing ? 'text-red-400' : 'text-emerald-400'}>
                    {ing.isMissing ? '✕' : '✓'}
                  </span>
                  {ing.amount} {ing.name}
                </li>
              ))}
            </ul>
          </section>

          {missingIngredients.length > 0 && (
            <button
              onClick={() => onAddToShoppingList(missingIngredients)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors"
            >
              🛒 Add Missing to List
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-8 md:p-24 justify-center items-center relative overflow-hidden bg-slate-50">
        <div className="absolute top-12 right-12 flex gap-4">
          <button 
            onClick={() => speak(recipe.steps[currentStep])}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isReading ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-white text-slate-600 shadow-md hover:bg-emerald-50'}`}
          >
            🔊
          </button>
        </div>

        {timeLeft !== null && (
          <div className="mb-12 text-center animate-in zoom-in duration-300">
            <div className={`text-7xl font-mono font-bold tracking-tighter ${timeLeft === 0 ? 'text-red-500 animate-bounce' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`mt-4 px-8 py-2 rounded-full font-bold transition-all ${
                isTimerRunning 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
              }`}
            >
              {timeLeft === 0 ? 'Restart' : isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            </button>
          </div>
        )}

        <div className="max-w-3xl w-full text-center">
          <div className="text-slate-400 font-bold uppercase tracking-[0.2em] mb-8 text-sm">
            Step {currentStep + 1} of {recipe.steps.length}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight mb-12 min-h-[120px]">
            {recipe.steps[currentStep]}
          </h1>
        </div>

        <div className="flex gap-6 mt-12 w-full max-w-xl">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 py-6 rounded-2xl bg-white text-slate-600 font-bold text-xl shadow-sm border border-slate-100 hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === recipe.steps.length - 1}
            className="flex-2 w-2/3 py-6 rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-30 transition-all"
          >
            {currentStep === recipe.steps.length - 1 ? 'Finish!' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepByStep;

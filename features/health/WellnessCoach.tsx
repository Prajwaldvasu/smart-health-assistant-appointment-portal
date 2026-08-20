import React, { useState, useEffect, useRef } from 'react';
import { HealthLog, WellnessTip } from '../../shared/types';
import { getWellnessTips } from '../../services/geminiService';
import { SparklesIcon, BrainIcon, BoltIcon, SunIcon, HeartIcon } from '../../shared/Icons';

interface WellnessCoachProps {
  logs: HealthLog[];
}

const BREATHING_CYCLE = [
  { phase: 'Breathe In', duration: 4000, instruction: 'Inhale slowly through your nose...' },
  { phase: 'Hold', duration: 4000, instruction: 'Hold your breath gently.' },
  { phase: 'Breathe Out', duration: 4000, instruction: 'Exhale smoothly through your mouth...' },
  { phase: 'Hold', duration: 4000, instruction: 'Pause and rest.' },
];

const WellnessCoach: React.FC<WellnessCoachProps> = ({ logs }) => {
  const [tips, setTips] = useState<WellnessTip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isBreathing, setIsBreathing] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  // FIX: In a browser environment, setTimeout returns a number, not NodeJS.Timeout.
  const timerRef = useRef<number | null>(null);

  const handleFetchTips = async () => {
    setIsLoading(true);
    setError(null);
    setTips([]);
    try {
      const last7DaysLogs = logs.slice(-7);
      if (last7DaysLogs.length === 0) {
        setError("Not enough data to generate tips. Please log your health for a few days.");
        return;
      }
      const fetchedTips = await getWellnessTips(last7DaysLogs);
      setTips(fetchedTips);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setCycleIndex(0);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (isBreathing) {
      timerRef.current = window.setTimeout(() => {
        setCycleIndex((prevIndex) => (prevIndex + 1) % BREATHING_CYCLE.length);
      }, BREATHING_CYCLE[cycleIndex].duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isBreathing, cycleIndex]);

  const currentPhase = BREATHING_CYCLE[cycleIndex];
  const isHolding = currentPhase.phase === 'Hold';
  const isBreathingIn = currentPhase.phase === 'Breathe In';

  const categoryIcons: { [key: string]: React.FC<{ className?: string }> } = {
    Mindfulness: BrainIcon,
    Nutrition: HeartIcon,
    Sleep: SunIcon,
    Activity: BoltIcon,
  };

  const categoryColors: { [key: string]: string } = {
    Mindfulness: 'text-purple-400 bg-purple-900/50',
    Nutrition: 'text-rose-400 bg-rose-900/50',
    Sleep: 'text-indigo-400 bg-indigo-900/50',
    Activity: 'text-amber-400 bg-amber-900/50',
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* AI Wellness Coach */}
      <div className="bg-slate-800/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-brand-teal-400" />
          <div>
            <h3 className="text-xl font-bold text-slate-100">Your AI Wellness Coach</h3>
            <p className="text-slate-400">Get personalized tips based on your recent activity.</p>
          </div>
        </div>
        <div className="mt-6">
          {tips.length === 0 && !isLoading && !error && (
            <div className="text-center py-4">
              <p className="text-slate-400 mb-4">Click the button to generate your personalized wellness plan.</p>
            </div>
          )}
          <button
            onClick={handleFetchTips}
            disabled={isLoading}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-600 hover:to-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Tips...
              </>
            ) : 'Get AI Wellness Tips'}
          </button>
          {error && <p className="mt-4 text-sm text-center text-red-300 bg-red-900/50 p-3 rounded-lg">{error}</p>}
          <div className="mt-6 space-y-4">
            {tips.map((tip, index) => {
              const Icon = categoryIcons[tip.category] || HeartIcon;
              const colors = categoryColors[tip.category] || 'text-slate-400 bg-slate-700';
              return (
                <div key={index} className="bg-slate-700/50 border border-slate-600/80 rounded-lg p-4 flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colors}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">{tip.title}</h4>
                    <p className="text-sm text-slate-300">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breathing Exercise */}
      <div className="bg-slate-800/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center space-x-3">
          <BrainIcon className="w-8 h-8 text-indigo-400" />
          <div>
            <h3 className="text-xl font-bold text-slate-100">Mindful Moment</h3>
            <p className="text-slate-400">A simple exercise to calm your mind.</p>
          </div>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center mt-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className={`absolute w-full h-full bg-brand-teal-900/60 rounded-full transition-transform duration-[4000ms] ease-in-out ${isBreathingIn ? 'scale-110' : 'scale-75'}`}></div>
            <div className={`absolute w-full h-full bg-brand-teal-800/30 rounded-full transition-transform duration-[4000ms] ease-in-out delay-100 ${isBreathingIn ? 'scale-125' : 'scale-50'}`}></div>
            <p className="relative z-10 text-2xl font-bold text-brand-teal-200 transition-opacity duration-500">
              {isBreathing ? currentPhase.phase : 'Ready?'}
            </p>
          </div>
          <p className="text-slate-400 mt-4 h-10 text-center transition-opacity duration-500">
            {isBreathing ? currentPhase.instruction : 'Take a moment to relax and focus on your breath.'}
          </p>
        </div>
        <div className="mt-4">
          <button
            onClick={isBreathing ? stopBreathing : startBreathing}
            className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isBreathing ? 'End Exercise' : 'Start Breathing Exercise'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WellnessCoach;
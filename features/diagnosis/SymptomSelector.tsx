import React, { useState, useEffect, useRef } from 'react';
import { Symptom, UserProfile, BODY_PARTS, DURATION_OPTIONS, GENDER_OPTIONS } from '../../shared/types';
import { PlusIcon, TrashIcon, MicrophoneIcon } from '../../shared/Icons';

interface SymptomSelectorProps {
  onSubmit: (symptoms: Symptom[], profile: UserProfile) => void;
  isLoading: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SymptomSelector: React.FC<SymptomSelectorProps> = ({ onSubmit, isLoading }) => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentBodyPart, setCurrentBodyPart] = useState(BODY_PARTS[0]);
  const [currentSeverity, setCurrentSeverity] = useState(5);
  const [currentDuration, setCurrentDuration] = useState(DURATION_OPTIONS[0]);
  const [currentNotes, setCurrentNotes] = useState('');

  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>(GENDER_OPTIONS[0]);
  const [formError, setFormError] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setCurrentSymptom(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    }

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };


  const addSymptom = () => {
    if (currentSymptom.trim()) {
      const newSymptom: Symptom = {
        id: Date.now().toString(),
        name: currentSymptom.trim(),
        bodyPart: currentBodyPart,
        severity: currentSeverity,
        duration: currentDuration,
        notes: currentNotes.trim(),
      };
      setSymptoms([...symptoms, newSymptom]);
      setCurrentSymptom('');
      setCurrentSeverity(5);
      setCurrentNotes('');
    }
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || Number(age) <= 0) {
      setFormError('Please enter a valid age.');
      return;
    }
    setFormError(null);
    onSubmit(symptoms, { age: Number(age), gender });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="p-4 border border-slate-700/80 rounded-lg">
          <h3 className="font-semibold text-slate-200 mb-3">Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your Age"
              min="1"
              className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500 bg-slate-700 text-slate-100 placeholder-slate-400"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500 bg-slate-700 text-slate-100"
            >
              {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>


        <div className="p-4 border border-slate-700/80 rounded-lg">
          <h3 className="font-semibold text-slate-200 mb-3">Add a Symptom</h3>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                placeholder="e.g., Headache, Fever, Cough or use the mic"
                className="w-full px-3 py-2 pr-12 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500 bg-slate-700 text-slate-100 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleListen}
                disabled={!recognitionRef.current}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'text-brand-teal-500 animate-pulse' : 'text-slate-400 hover:text-brand-teal-400'} disabled:text-slate-500 disabled:cursor-not-allowed`}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <MicrophoneIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={currentBodyPart}
                onChange={(e) => setCurrentBodyPart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500 bg-slate-700 text-slate-100"
              >
                {BODY_PARTS.map(part => <option key={part} value={part}>{part}</option>)}
              </select>
              <select
                value={currentDuration}
                onChange={(e) => setCurrentDuration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500 bg-slate-700 text-slate-100"
              >
                {DURATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Add more details (e.g., 'sharp pain', 'worse at night')"
              className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500 bg-slate-700 text-slate-100 placeholder-slate-400"
              rows={2}
            />
            <div className='flex items-center space-x-3'>
              <label htmlFor="severity" className="text-sm font-medium text-slate-300">Severity:</label>
              <input
                id="severity"
                type="range"
                min="1"
                max="10"
                value={currentSeverity}
                onChange={(e) => setCurrentSeverity(Number(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-brand-teal-500"
              />
              <span className="font-bold text-brand-teal-400 w-8 text-center">{currentSeverity}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={addSymptom}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-teal-600 hover:bg-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 disabled:opacity-50"
            disabled={!currentSymptom.trim()}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Symptom
          </button>
        </div>

        {symptoms.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-200">Your Symptoms</h3>
            {symptoms.map(symptom => (
              <div key={symptom.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-md">
                <div>
                  <p className="font-medium text-slate-200">{symptom.name}</p>
                  <p className="text-sm text-slate-400">
                    {symptom.bodyPart} | Severity: {symptom.severity}/10 | Duration: {symptom.duration}
                  </p>
                  {symptom.notes && <p className="text-sm text-slate-300 italic mt-1">"{symptom.notes}"</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeSymptom(symptom.id)}
                  className="p-1 text-slate-500 hover:text-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {formError && (
          <div className="p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-sm">
            {formError}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || symptoms.length === 0}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-600 hover:to-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : 'Analyze My Symptoms'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SymptomSelector;
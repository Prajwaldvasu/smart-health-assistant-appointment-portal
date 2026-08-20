import React from 'react';
import { AnalysisResult, TriageLevel } from '../types';
import { HeartIcon, ShieldCheckIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from './Icons';

interface PredictionResultsProps {
    analysisResult: AnalysisResult | null;
    onNext: () => void;
    onReset: () => void;
    isLoading: boolean;
}

const TriageInfo = {
    [TriageLevel.Minor]: {
        title: '🟢 GREEN - Mild Symptoms',
        subtitle: 'Home remedies & rest',
        Icon: ShieldCheckIcon,
        containerClasses: 'bg-green-900/40 border-green-700 text-green-200',
        iconClasses: 'text-green-400',
    },
    [TriageLevel.Moderate]: {
        title: '🟨 YELLOW - Moderate Severity',
        subtitle: 'Suggest meds / consult doctor',
        Icon: ExclamationTriangleIcon,
        containerClasses: 'bg-yellow-900/40 border-yellow-700 text-yellow-200',
        iconClasses: 'text-yellow-400',
    },
    [TriageLevel.Severe]: {
        title: '🟥 RED - Life-threatening Symptoms',
        subtitle: 'Show hospitals & emergency route',
        Icon: ExclamationCircleIcon,
        containerClasses: 'bg-red-900/40 border-red-700 text-red-200',
        iconClasses: 'text-red-400',
    },
}


const PredictionResults: React.FC<PredictionResultsProps> = ({ analysisResult, onNext, onReset, isLoading }) => {

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64">
                <svg className="animate-spin h-8 w-8 text-brand-teal-500 mb-4" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-semibold">Our AI is analyzing your symptoms...</p>
                <p className="text-sm">This may take a moment.</p>
            </div>
        );
    }

    if (!analysisResult) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-slate-400 h-64">
                <p>No analysis results available.</p>
            </div>
        );
    }

    const { triageLevel, triageDescription, predictions, selfCareAdvice } = analysisResult;
    const triageConfig = TriageInfo[triageLevel];


    return (
        <div>
            <div className={`mb-6 p-4 rounded-lg border-l-4 flex items-start ${triageConfig.containerClasses}`} role="alert">
                <triageConfig.Icon className={`w-6 h-6 mr-3 flex-shrink-0 ${triageConfig.iconClasses}`} />
                <div>
                    <h3 className="font-bold text-lg">{triageConfig.title}</h3>
                    <p className="text-sm font-medium mb-1">{triageConfig.subtitle}</p>
                    <p className="text-sm">{triageDescription}</p>
                </div>
            </div>



            {predictions.length > 0 && (
                <div className="space-y-4">
                    {predictions.map((p, index) => (
                        <div key={index} className="bg-slate-700/50 border border-slate-600/80 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-100">{p.condition}</h3>
                                    <p className="text-sm font-medium text-brand-teal-400">{p.specialty} Specialist Recommended</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-slate-100">{p.probability}%</p>
                                    <p className="text-xs text-slate-400">Likelihood</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2.5 my-2">
                                <div className="bg-gradient-to-r from-brand-teal-400 to-brand-green-400 h-2.5 rounded-full" style={{ width: `${p.probability}%` }}></div>
                            </div>
                            <p className="text-sm text-slate-300 mt-3">{p.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {selfCareAdvice.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                        <HeartIcon className="w-6 h-6 text-brand-teal-500 mr-2" />
                        Self-Care Recommendations
                    </h3>
                    <div className="space-y-3">
                        {selfCareAdvice.map((tip, index) => (
                            <div key={index} className="bg-gradient-to-r from-brand-teal-900/30 to-brand-green-900/30 border-l-4 border-brand-teal-500 rounded-lg p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-brand-teal-500/20 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-brand-teal-400 font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <p className="text-sm text-slate-200 leading-relaxed flex-1">{tip}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Information Section */}
                    <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Important Information
                        </h4>
                        <div className="space-y-2 text-xs text-slate-400">
                            <p className="flex items-start">
                                <span className="text-brand-teal-400 mr-2">•</span>
                                <span>This is an AI-powered assessment and not a substitute for professional medical advice</span>
                            </p>
                            <p className="flex items-start">
                                <span className="text-brand-teal-400 mr-2">•</span>
                                <span>If symptoms persist, worsen, or you feel concerned, please consult a healthcare professional</span>
                            </p>
                            {triageLevel === TriageLevel.Severe && (
                                <p className="flex items-start text-red-300 font-medium">
                                    <span className="text-red-400 mr-2">⚠</span>
                                    <span>For emergencies, call 108 or visit the nearest emergency room immediately</span>
                                </p>
                            )}
                            {triageLevel === TriageLevel.Moderate && (
                                <p className="flex items-start text-yellow-300">
                                    <span className="text-yellow-400 mr-2">!</span>
                                    <span>Schedule an appointment with a doctor within 24-48 hours if symptoms don't improve</span>
                                </p>
                            )}
                            <p className="flex items-start">
                                <span className="text-brand-teal-400 mr-2">•</span>
                                <span>Keep track of your symptoms, their duration, and any changes in severity</span>
                            </p>
                            <p className="flex items-start">
                                <span className="text-brand-teal-400 mr-2">•</span>
                                <span>Avoid self-medication without consulting a healthcare provider</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8">
                {triageLevel === TriageLevel.Minor ? (
                    <button
                        onClick={onReset}
                        className="w-full flex justify-center items-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500"
                    >
                        Start Over
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-600 hover:to-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 transition-all transform hover:scale-[1.02]"
                    >
                        Find a Doctor
                    </button>
                )}
            </div>
        </div>
    );
};

export default PredictionResults;
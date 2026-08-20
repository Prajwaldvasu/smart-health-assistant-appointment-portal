
import React from 'react';
import { Step, STEPS } from '../types';
import { CheckCircleIcon } from './Icons';

interface StepIndicatorProps {
    currentStep: Step;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {STEPS.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {step.id < currentStep ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-brand-teal-600" />
                                </div>
                                <div
                                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal-600"
                                >
                                    <CheckCircleIcon className="h-5 w-5 text-white" />
                                </div>
                                <span className="absolute mt-2 text-xs text-center w-full left-[-50%] ml-4 font-medium text-slate-300">{step.name}</span>
                            </>
                        ) : step.id === currentStep ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-slate-700" />
                                </div>
                                <div
                                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-teal-500 bg-slate-800"
                                    aria-current="step"
                                >
                                    <span className="h-2.5 w-2.5 rounded-full bg-brand-teal-500" />
                                </div>
                                <span className="absolute mt-2 text-xs text-center w-full left-[-50%] ml-4 font-bold text-brand-teal-400">{step.name}</span>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-slate-700" />
                                </div>
                                <div
                                    className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800"
                                >
                                    <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                                </div>
                                <span className="absolute mt-2 text-xs text-center w-full left-[-50%] ml-4 font-medium text-slate-500">{step.name}</span>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default StepIndicator;
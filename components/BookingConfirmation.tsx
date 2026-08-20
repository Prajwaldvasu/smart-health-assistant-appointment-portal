import React, { useState } from 'react';
import { Doctor, Symptom, UserProfile, AnalysisResult } from '../types';
import { CheckCircleIcon, MapPinIcon, DownloadIcon, BellIcon } from './Icons';

interface BookingConfirmationProps {
    doctor: Doctor | null;
    symptoms: Symptom[];
    analysisResult: AnalysisResult | null;
    userProfile: UserProfile | null;
    onReset: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ doctor, symptoms, analysisResult, userProfile, onReset }) => {
    const [reminderSet, setReminderSet] = useState<boolean>(false);
    const [notificationError, setNotificationError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    if (!doctor) {
        return (
            <div className="text-center py-10">
                <p className="text-slate-300">No doctor selected. Please go back and choose a doctor.</p>
                <button onClick={onReset} className="mt-4 text-brand-teal-400 font-semibold">Start Over</button>
            </div>
        );
    }

    const handleSetReminder = async () => {
        setNotificationError(null);

        if (!('Notification' in window)) {
            setNotificationError('This browser does not support desktop notifications.');
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const appointmentTimeStr = doctor.availability[0];
            if (!appointmentTimeStr) {
                setNotificationError('Appointment time is not available to set a reminder.');
                return;
            }

            const [time, modifier] = appointmentTimeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

            const appointmentDate = new Date();
            appointmentDate.setDate(appointmentDate.getDate() + 1); // Assume appointment is for tomorrow
            appointmentDate.setHours(hours, minutes, 0, 0);

            const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000); // 1 hour before
            const delay = reminderTime.getTime() - Date.now();

            if (delay > 0) {
                setTimeout(() => {
                    new Notification('Appointment Reminder', {
                        body: `Your appointment with ${doctor.name} is in one hour.`,
                        icon: '/vite.svg', // A default icon
                    });
                }, delay);
                setReminderSet(true);
            } else {
                setNotificationError('Cannot set a reminder for an appointment in the past.');
            }
        } else {
            setNotificationError('Notification permission was denied. Please enable it in your browser settings to use this feature.');
        }
    };


    const handleDownload = () => {
        let summary = `Health Analysis & Appointment Summary\n`;
        summary += `=======================================\n\n`;

        if (userProfile) {
            summary += `--- Patient Profile ---\n`;
            summary += `Age: ${userProfile.age}\n`;
            summary += `Gender: ${userProfile.gender}\n\n`;
        }

        summary += `--- Reported Symptoms ---\n`;
        symptoms.forEach(s => {
            summary += `- ${s.name} (${s.bodyPart}) | Severity: ${s.severity}/10 | Duration: ${s.duration}\n`;
            if (s.notes) {
                summary += `  Notes: ${s.notes}\n`;
            }
        });
        summary += `\n`;

        if (analysisResult) {
            summary += `--- AI-Powered Triage (Not a Medical Diagnosis) ---\n`;
            summary += `Triage Level: ${analysisResult.triageLevel}\n`;
            summary += `Assessment: ${analysisResult.triageDescription}\n\n`;

            summary += `--- Potential Conditions Identified by AI ---\n`;
            analysisResult.predictions.forEach(p => {
                summary += `- Condition: ${p.condition} (${p.probability}% Likelihood)\n`;
                summary += `  Description: ${p.description}\n`;
            });
            summary += `\n`;
        }


        summary += `--- Appointment Details ---\n`;
        summary += `Doctor: ${doctor.name} (${doctor.specialty})\n`;
        summary += `Location: ${doctor.address}\n`;
        summary += `Time: ${doctor.availability[0] || 'To be confirmed'}\n\n`;

        summary += `Disclaimer: This summary is for informational purposes only and is not a substitute for professional medical advice.\n`;

        const blob = new Blob([summary], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'Health_Summary.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    const handleCopyDetails = async () => {
        const appointmentDetails = `🏥 APPOINTMENT DETAILS\n\n` +
            `👨‍⚕️ Doctor: ${doctor.name}\n` +
            `🩺 Specialty: ${doctor.specialty}\n` +
            `📍 Location: ${doctor.address}\n` +
            `🕐 Time: ${doctor.availability[0] || 'To be confirmed'}\n` +
            `📞 Phone: ${doctor.phone || 'Not available'}\n\n` +
            `💊 Symptoms Discussed:\n` +
            symptoms.map(s => `  • ${s.name} (Severity: ${s.severity}/10)`).join('\n') +
            `\n\n⚕️ Smart Health Assistant & Appointment Portal`;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(appointmentDetails);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } else {
                // Fallback for browsers that don't support clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = appointmentDetails;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy appointment details. Please try again.');
        }
    };

    return (
        <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-brand-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-100">Appointment Booked!</h3>
            <p className="text-slate-400 mt-1">Your appointment with {doctor.name} has been confirmed.</p>

            <div className="mt-6 text-left bg-slate-700/50 border border-slate-600/80 rounded-lg p-4 space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Doctor</h4>
                    <p className="text-lg font-semibold text-slate-100">{doctor.name}</p>
                    <p className="text-brand-teal-400">{doctor.specialty}</p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Location</h4>
                    <p className="text-slate-300 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2 text-slate-500" />
                        {doctor.address}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Appointment Time</h4>
                    <p className="text-lg font-semibold text-slate-100">{doctor.availability[0] || 'To be confirmed'}</p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Symptoms Discussed</h4>
                    <ul className="space-y-1 text-slate-300 mt-2">
                        {symptoms.map(s => (
                            <li key={s.id}>
                                <span className="font-medium">{s.name}</span>
                                {s.notes && <p className="text-xs text-slate-400 pl-2 italic">"{s.notes}"</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-6 p-4 bg-brand-teal-900/40 border border-brand-teal-800 rounded-lg text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-slate-200">Set a Reminder</h4>
                        <p className="text-sm text-slate-300">Get a browser notification 1 hour before your appointment.</p>
                    </div>
                    {!reminderSet && (
                        <button
                            onClick={handleSetReminder}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-teal-600 hover:bg-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500"
                        >
                            <BellIcon className="w-5 h-5 mr-2" />
                            Set Reminder
                        </button>
                    )}
                </div>
                {reminderSet && (
                    <p className="mt-2 text-sm font-medium text-brand-green-300">✓ Reminder has been set successfully!</p>
                )}
                {notificationError && (
                    <p className="mt-2 text-sm text-red-400">{notificationError}</p>
                )}
            </div>


            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleCopyDetails}
                    className="w-full flex justify-center items-center px-6 py-3 border border-brand-teal-600 text-base font-medium rounded-md shadow-sm text-brand-teal-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500"
                >
                    {copied ? (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Details
                        </>
                    )}
                </button>
                <button
                    onClick={handleDownload}
                    className="w-full flex justify-center items-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500"
                >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Download Summary
                </button>
                <button
                    onClick={onReset}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-600 hover:to-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 transition-all"
                >
                    Start New Analysis
                </button>
            </div>
        </div>
    );
};

export default BookingConfirmation;
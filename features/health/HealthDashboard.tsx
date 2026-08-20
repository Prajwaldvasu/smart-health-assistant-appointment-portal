import React, { useState, useEffect, useRef } from 'react';
import { HealthLog, Mood, MOOD_OPTIONS } from '../../shared/types';
import { WaterDropIcon, MoonIcon, FaceSmileIcon, PlusIcon, MinusIcon } from '../../shared/Icons';
import WellnessCoach from './WellnessCoach';

// Chart.js is loaded from a CDN, so we declare it globally.
declare const Chart: any;

interface HealthDashboardProps {
    logs: HealthLog[];
    onAddLog: (log: HealthLog) => void;
    isSyncing: boolean;
    syncError: string | null;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ logs, onAddLog, isSyncing, syncError }) => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === today);

    const [waterIntake, setWaterIntake] = useState(todayLog?.waterIntake || 8);
    const [sleepHours, setSleepHours] = useState(todayLog?.sleepHours || 7.5);
    const [mood, setMood] = useState<Mood>(todayLog?.mood || Mood.Neutral);

    const waterChartRef = useRef<HTMLCanvasElement>(null);
    const sleepChartRef = useRef<HTMLCanvasElement>(null);
    const moodChartRef = useRef<HTMLCanvasElement>(null);
    const chartInstances = useRef<any>({});

    useEffect(() => {
        // Update form if log for today appears
        const todayLog = logs.find(l => l.date === today);
        if (todayLog) {
            setWaterIntake(todayLog.waterIntake);
            setSleepHours(todayLog.sleepHours);
            setMood(todayLog.mood);
        }
    }, [logs, today])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddLog({ date: today, waterIntake, sleepHours, mood });
    };

    const createChart = (ctx: CanvasRenderingContext2D, labels: string[], data: number[], label: string, color: string, chartType: 'line' | 'bar' = 'line') => {
        return new Chart(ctx, {
            type: chartType,
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    borderColor: color,
                    backgroundColor: `${color}33`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f8fafc20' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { color: '#f8fafc20' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    useEffect(() => {
        const last7DaysLogs = logs.slice(-7);
        const labels = last7DaysLogs.map(log => new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Destroy previous charts before creating new ones
        Object.values(chartInstances.current).forEach((chart: any) => chart.destroy());

        if (waterChartRef.current) {
            chartInstances.current.water = createChart(waterChartRef.current.getContext('2d')!, labels, last7DaysLogs.map(l => l.waterIntake), 'Water Intake (glasses)', '#26a69a');
        }
        if (sleepChartRef.current) {
            chartInstances.current.sleep = createChart(sleepChartRef.current.getContext('2d')!, labels, last7DaysLogs.map(l => l.sleepHours), 'Sleep (hours)', '#818cf8');
        }
        if (moodChartRef.current) {
            const moodData = last7DaysLogs.map(l => MOOD_OPTIONS.findIndex(m => m.value === l.mood) + 1);
            const moodChart = createChart(moodChartRef.current.getContext('2d')!, labels, moodData, 'Mood', '#4CAF50', 'bar');
            moodChart.options.scales.y = {
                ...moodChart.options.scales.y,
                ticks: {
                    ...moodChart.options.scales.y.ticks,
                    callback: function (value: number) {
                        return MOOD_OPTIONS[value - 1]?.icon || '';
                    }
                },
                min: 0,
                max: MOOD_OPTIONS.length + 1,
            };
            moodChart.update();
            chartInstances.current.mood = moodChart;
        }

        return () => {
            Object.values(chartInstances.current).forEach((chart: any) => chart.destroy());
        }

    }, [logs]);

    return (
        <div className="space-y-8">
            <div className="bg-slate-800/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">Health Dashboard</h2>
                        <p className="mt-2 text-slate-400">Track your daily wellness habits to see trends over time.</p>
                    </div>
                    {isSyncing && (
                        <div className="flex items-center text-sm text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Syncing...
                        </div>
                    )}
                </div>

                {syncError && (
                    <div className="mt-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-sm" role="alert">
                        {syncError}
                    </div>
                )}

                <hr className="my-6 border-slate-700/80" />
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="font-semibold text-slate-200 text-lg">Log for Today ({new Date().toLocaleDateString()})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Water Intake */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center"><WaterDropIcon className="w-5 h-5 mr-2 text-brand-teal-400" /> Water Intake</label>
                            <div className="flex items-center space-x-3">
                                <input type="range" min="0" max="20" step="1" value={waterIntake} onChange={(e) => setWaterIntake(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-brand-teal-500" />
                                <span className="font-bold text-brand-teal-400 w-20 text-center">{waterIntake} glasses</span>
                            </div>
                        </div>
                        {/* Sleep Hours */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center"><MoonIcon className="w-5 h-5 mr-2 text-indigo-400" /> Sleep</label>
                            <div className="flex items-center justify-between">
                                <button type="button" onClick={() => setSleepHours(s => Math.max(0, s - 0.5))} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors" aria-label="Decrease sleep hours">
                                    <MinusIcon className="w-5 h-5 text-slate-300" />
                                </button>
                                <span className="font-bold text-indigo-400 w-24 text-center">{sleepHours.toFixed(1)} hours</span>
                                <button type="button" onClick={() => setSleepHours(s => Math.min(12, s + 0.5))} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors" aria-label="Increase sleep hours">
                                    <PlusIcon className="w-5 h-5 text-slate-300" />
                                </button>
                            </div>
                        </div>
                        {/* Mood */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center"><FaceSmileIcon className="w-5 h-5 mr-2 text-amber-400" /> Mood</label>
                            <div className="flex items-center space-x-2 bg-slate-700 rounded-full p-1">
                                {MOOD_OPTIONS.map(opt => (
                                    <button type="button" key={opt.value} onClick={() => setMood(opt.value)} className={`w-full text-center px-3 py-1.5 rounded-full text-sm transition-all ${mood === opt.value ? 'text-white shadow' : 'hover:bg-slate-600/60'}`} style={{ backgroundColor: mood === opt.value ? opt.color : 'transparent', color: mood === opt.value ? 'white' : '#d1d5db' }} title={opt.label}>
                                        <span className="text-xl">{opt.icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-teal-600 hover:bg-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            {todayLog ? 'Update Today\'s Log' : 'Log Today\'s Health'}
                        </button>
                    </div>
                </form>
            </div>

            <WellnessCoach logs={logs} />

            <div className="bg-slate-800/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold text-slate-100">Your 7-Day Trends</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    <div>
                        <h4 className="font-semibold text-slate-300 text-center mb-2">Water Intake</h4>
                        <div className="h-56"><canvas ref={waterChartRef}></canvas></div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-300 text-center mb-2">Sleep</h4>
                        <div className="h-56"><canvas ref={sleepChartRef}></canvas></div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-300 text-center mb-2">Mood</h4>
                        <div className="h-56"><canvas ref={moodChartRef}></canvas></div>
                    </div>
                </div>
                {logs.length === 0 && !isSyncing && (
                    <div className="text-center py-10 text-slate-400">
                        <p>No data yet. Start logging your health to see your trends!</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default HealthDashboard;
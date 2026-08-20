import React, { useState } from 'react';
import { UserProfile, GENDER_OPTIONS } from '../../shared/types';

interface DetailPageProps {
    onComplete: (profile: UserProfile) => void;
}

const DetailPage: React.FC<DetailPageProps> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!name.trim()) {
            setError('Please enter your name');
            setIsLoading(false);
            return;
        }

        const ageNum = parseInt(age);
        if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            setError('Please enter a valid age between 1 and 120');
            setIsLoading(false);
            return;
        }

        if (!gender) {
            setError('Please select your gender');
            setIsLoading(false);
            return;
        }

        const profile: UserProfile = {
            name,
            age: ageNum,
            gender,
        };

        // Simulate saving profile
        setTimeout(() => {
            onComplete(profile);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-100">
                        Complete Your Profile
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Help us personalize your health experience
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl p-8">
                        {error && (
                            <div className="mb-4 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-slate-300">
                                    Age
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    min="1"
                                    max="120"
                                    required
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
                                    placeholder="Enter your age"
                                />
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-slate-300">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    required
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-teal-600 hover:bg-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </div>
                                ) : (
                                    'Continue'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DetailPage;

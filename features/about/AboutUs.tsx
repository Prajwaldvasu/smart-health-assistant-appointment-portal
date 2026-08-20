import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        About Smart Health Assistant
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Your trusted digital companion for health and wellness guidance
                    </p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-teal-400">Our Mission</h2>
                    <p className="text-slate-200 mb-4">
                        At Smart Health Assistant, we believe that quality healthcare guidance should be accessible to everyone, everywhere.
                        Our mission is to empower individuals with reliable health information and tools to make informed decisions about their wellbeing.
                    </p>
                    <p className="text-slate-200">
                        We're committed to bridging the gap between patients and healthcare providers through innovative technology that's both
                        intuitive and medically sound.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold mb-3 text-cyan-400">What We Offer</h3>
                        <ul className="space-y-2 text-slate-200">
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Symptom checker with AI-powered analysis</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Personalized health recommendations</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Doctor appointment scheduling</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Health tracking and wellness coaching</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Emergency contact services</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold mb-3 text-cyan-400">Our Approach</h3>
                        <ul className="space-y-2 text-slate-200">
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Evidence-based medical information</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>User privacy and data security</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Continuous improvement through feedback</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Collaboration with healthcare professionals</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-teal-400 mr-2">✓</span>
                                <span>Accessibility for all users</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-teal-400">Our Team</h2>
                    <p className="text-slate-200 mb-4">
                        Our team consists of healthcare professionals, software engineers, and user experience designers who are passionate
                        about making healthcare more accessible and understandable. We work tirelessly to ensure our platform provides
                        accurate, up-to-date information while maintaining the highest standards of privacy and security.
                    </p>
                    <p className="text-slate-200">
                        We collaborate with medical institutions and professionals to validate our content and continuously improve
                        our services based on the latest medical research and user feedback.
                    </p>
                </div>

                <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-2xl border border-teal-700/50 p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-4 text-teal-400">Our Commitment</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
                            <div className="text-slate-200">Availability</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-400 mb-2">100%</div>
                            <div className="text-slate-200">Privacy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-400 mb-2">99.9%</div>
                            <div className="text-slate-200">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
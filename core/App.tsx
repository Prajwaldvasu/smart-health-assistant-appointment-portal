import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Symptom, Step, Location, UserProfile, AnalysisResult, TriageLevel, View, HealthLog, Doctor, STEPS } from '../shared/types';
import { getAnalysis } from '../services/geminiService';
import { fetchLogs, saveLog } from '../services/healthLogService';
import { doctors as allKarnatakaDoctors } from '../services/karnatakaHealthData';

import SymptomSelector from '../features/diagnosis/SymptomSelector';
import PredictionResults from '../features/diagnosis/PredictionResults';
import DoctorFinder from '../features/appointments/DoctorFinder';
import BookingConfirmation from '../features/appointments/BookingConfirmation';
import StepIndicator from '../features/diagnosis/StepIndicator';
import { StethoscopeIcon, ChartBarIcon, MapIcon } from '../shared/Icons';
import Chatbot from '../features/health/Chatbot';
import ChatbotIcon from '../features/health/ChatbotIcon';
import HealthDashboard from '../features/health/HealthDashboard';
import HealthMapView from '../features/health/HealthMapView';
import Login from '../features/auth/Login';
import DetailPage from '../features/auth/DetailPage';
import PermissionStatus from '../shared/PermissionStatus';
import BMICalculator from '../features/health/BMICalculator';
import AboutUs from '../features/about/AboutUs';
import PatientSummaryPDF from '../features/health/PatientSummaryPDF';

const haversineDistance = (
  coords1: { latitude: number; longitude: number },
  coords2: { latitude: number; longitude: number }
): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.Login);
  const [currentStep, setCurrentStep] = useState<Step>(Step.Symptom);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<AnalysisResult['doctors'][0] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState<boolean>(false);
  const [showBMI, setShowBMI] = useState<boolean>(false);
  const [showPDFSummary, setShowPDFSummary] = useState<boolean>(false);

  useEffect(() => {
    const syncData = async () => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        const backendLogs = await fetchLogs();

        let localLogs: HealthLog[] = [];
        const storedLogs = localStorage.getItem('healthLogs');
        if (storedLogs) {
          localLogs = JSON.parse(storedLogs);
        }

        const mergedLogsMap = new Map<string, HealthLog>();
        backendLogs.forEach(log => mergedLogsMap.set(log.date, log));
        localLogs.forEach(log => mergedLogsMap.set(log.date, log));

        const mergedLogs = Array.from(mergedLogsMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setHealthLogs(mergedLogs);
        localStorage.setItem('healthLogs', JSON.stringify(mergedLogs));

      } catch (error) {
        console.error("Failed to sync health logs from backend", error);
        setSyncError("Could not load data from the server. Displaying local data.");
        try {
          const storedLogs = localStorage.getItem('healthLogs');
          if (storedLogs) {
            setHealthLogs(JSON.parse(storedLogs));
          }
        } catch (localError) {
          console.error("Failed to parse health logs from localStorage", localError);
        }
      } finally {
        setIsSyncing(false);
      }
    };

    syncData();
  }, []);

  const addHealthLog = async (log: HealthLog) => {
    const updatedLogs = healthLogs.filter(l => l.date !== log.date);
    const newLogs = [...updatedLogs, log].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setHealthLogs(newLogs);
    localStorage.setItem('healthLogs', JSON.stringify(newLogs));
    setSyncError(null);

    try {
      await saveLog(log);
      console.log('Log synced successfully');
    } catch (error) {
      console.error("Failed to save log to backend:", error);
      if (error instanceof Error) {
        setSyncError(error.message);
      } else {
        setSyncError("An unknown error occurred while syncing.");
      }
    }
  };


  const resetApp = useCallback(() => {
    setCurrentStep(Step.Symptom);
    setSymptoms([]);
    setUserProfile(null);
    setAnalysisResult(null);
    setSelectedDoctor(null);
    setIsLoading(false);
    setError(null);
    setCurrentView(View.Wizard);
  }, []);

  const findNearbyDoctors = (specialties: string[], userLocation: Location): Doctor[] => {
    if (!userLocation) return [];

    // Create a mapping of specialty synonyms for better matching
    const specialtySynonyms: { [key: string]: string[] } = {
      'cardiology': ['cardiology', 'cardiologist', 'heart', 'cardiac'],
      'neurology': ['neurology', 'neurologist', 'brain', 'nervous system'],
      'orthopedics': ['orthopedics', 'orthopedic', 'orthopaedics', 'orthopaedist', 'bone', 'joint'],
      'general physician': ['general physician', 'general practice', 'gp', 'family medicine'],
      'obstetrics & gynaecology': ['obstetrics & gynaecology', 'obstetrics', 'gynaecology', 'gynecology', 'obgyn', 'women\'s health'],
      'nephrology': ['nephrology', 'nephrologist', 'kidney'],
      'dermatology': ['dermatology', 'dermatologist', 'skin'],
      'pediatrics': ['pediatrics', 'pediatrician', 'children', 'pediatric'],
      'ophthalmology': ['ophthalmology', 'ophthalmologist', 'eye', 'vision'],
      'dentistry': ['dentistry', 'dentist', 'dental'],
      'psychiatry': ['psychiatry', 'psychiatrist', 'mental health'],
      'urology': ['urology', 'urologist', 'urinary'],
      'endocrinology': ['endocrinology', 'endocrinologist', 'hormone', 'diabetes'],
      'pulmonology': ['pulmonology', 'pulmonologist', 'lung', 'respiratory'],
      'rheumatology': ['rheumatology', 'rheumatologist', 'arthritis']
    };

    // Function to check if a specialty matches
    const matchesSpecialty = (docSpecialty: string, requiredSpecialties: string[]): boolean => {
      const docLower = docSpecialty.toLowerCase();
      return requiredSpecialties.some(reqSpecialty => {
        const reqLower = reqSpecialty.toLowerCase();
        // Direct match
        if (docLower.includes(reqLower) || reqLower.includes(docLower)) return true;
        // Check synonyms
        const synonyms = specialtySynonyms[reqLower] || [];
        return synonyms.some(syn => docLower.includes(syn));
      });
    };

    let relevantDoctors = allKarnatakaDoctors.filter(doc =>
      matchesSpecialty(doc.specialty, specialties)
    );

    // If no doctors match the specialties, return general physicians or all doctors as fallback
    if (relevantDoctors.length === 0) {
      relevantDoctors = allKarnatakaDoctors.filter(doc =>
        doc.specialty.toLowerCase().includes('general physician') ||
        doc.specialty.toLowerCase().includes('general practice')
      );
    }

    // If still no doctors, return all doctors (shouldn't happen but safety net)
    if (relevantDoctors.length === 0) {
      relevantDoctors = allKarnatakaDoctors.slice();
    }

    const doctorsWithDistance = relevantDoctors.map(doc => ({
      ...doc,
      distance: haversineDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: doc.location.lat, longitude: doc.location.lng }
      )
    }));

    return doctorsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 5);
  };

  const handleSymptomSubmit = async (submittedSymptoms: Symptom[], profile: UserProfile) => {
    if (submittedSymptoms.length === 0) {
      setError("Please add at least one symptom.");
      return;
    }
    setSymptoms(submittedSymptoms);
    setUserProfile(profile);
    setIsLoading(true);
    setError(null);
    setCurrentStep(Step.Analysis);

    const performAnalysis = async (userLocation: Location) => {
      try {
        const analysis = await getAnalysis(submittedSymptoms, userLocation, profile);
        const requiredSpecialties = [...new Set(analysis.predictions.map(p => p.specialty))];
        if (requiredSpecialties.length === 0) {
          requiredSpecialties.push('General Physician');
        }
        const nearbyDoctors = findNearbyDoctors(requiredSpecialties, userLocation);

        const finalResult: AnalysisResult = {
          ...analysis,
          doctors: nearbyDoctors,
        };

        setAnalysisResult(finalResult);
      } catch (err) {
        setError("An error occurred while analyzing symptoms. Please try again.");
        console.error(err);
        setCurrentStep(Step.Symptom);
      } finally {
        setIsLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(userLocation);
        performAnalysis(userLocation);
      },
      (error) => {
        console.warn(`Geolocation error: ${error.message}. Using default location.`);
        const fallbackLocation = { latitude: 12.9716, longitude: 77.5946 }; // Bengaluru
        setLocation(fallbackLocation);
        performAnalysis(fallbackLocation);
      },
      { timeout: 5000 }
    );
  };

  const handleFindDoctors = () => {
    if (analysisResult && analysisResult.triageLevel !== TriageLevel.Minor) {
      setCurrentStep(Step.Doctor);
    }
  };

  const handleDoctorSelect = (doctor: AnalysisResult['doctors'][0]) => {
    setSelectedDoctor(doctor);
    setCurrentStep(Step.Booking);
  };

  const currentStepInfo = useMemo(() => STEPS.find(s => s.id === currentStep), [currentStep]);

  const handleLogin = (email: string, password: string) => {
    setUser({ email });
    setIsLoggedIn(true);
    setCurrentView(View.DetailPage);
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentView(View.Wizard);
  };

  const handleBack = () => {
    if (currentStep === Step.Analysis) {
      setCurrentStep(Step.Symptom);
    } else if (currentStep === Step.Doctor) {
      setCurrentStep(Step.Analysis);
    } else if (currentStep === Step.Booking) {
      setCurrentStep(Step.Doctor);
    }
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentView) {
      case View.DetailPage:
        return <DetailPage onComplete={handleProfileComplete} />;
      case View.Wizard:
        return (
          <>
            <StepIndicator currentStep={currentStep} />
            {/* Back Button */}
            {currentStep !== Step.Symptom && (
              <div className="mt-6">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              </div>
            )}
            <div className="mt-8 bg-slate-800/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl min-h-[400px]">
              <h2 className="text-2xl font-bold text-slate-100">{currentStepInfo?.title}</h2>
              <p className="mt-2 text-slate-400">{currentStepInfo?.description}</p>
              <hr className="my-6 border-slate-700/80" />
              {error && (
                <div className="mb-4 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
                  {error}
                </div>
              )}
              {renderWizardStep()}
            </div>
          </>
        );
      case View.Dashboard:
        return <HealthDashboard logs={healthLogs} onAddLog={addHealthLog} isSyncing={isSyncing} syncError={syncError} />;
      case View.MapView:
        return <HealthMapView userLocation={location} />;
      case View.AboutUs:
        return <AboutUs />;
      default:
        return <HealthDashboard logs={healthLogs} onAddLog={addHealthLog} isSyncing={isSyncing} syncError={syncError} />;
    }
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case Step.Symptom:
        return <SymptomSelector onSubmit={handleSymptomSubmit} isLoading={isLoading} />;
      case Step.Analysis:
        return (
          <>
            <PredictionResults 
              analysisResult={analysisResult} 
              userProfile={userProfile} 
              symptoms={symptoms}
              onGeneratePDF={() => setShowPDFSummary(true)}
              onNext={handleFindDoctors} 
              onReset={resetApp} 
              isLoading={isLoading} 
            />
            {showPDFSummary && analysisResult && userProfile && (
              <PatientSummaryPDF 
                userProfile={userProfile} 
                symptoms={symptoms}
                analysisResult={analysisResult}
                onClose={() => setShowPDFSummary(false)}
              />
            )}
          </>
        );
      case Step.Doctor:
        return <DoctorFinder doctors={analysisResult?.doctors || []} onSelectDoctor={handleDoctorSelect} userLocation={location} />;
      case Step.Booking:
        return <BookingConfirmation doctor={selectedDoctor} symptoms={symptoms} userProfile={userProfile} analysisResult={analysisResult} onReset={resetApp} />;
      default:
        return <SymptomSelector onSubmit={handleSymptomSubmit} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 font-sans text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={resetApp}>
              <StethoscopeIcon className="h-8 w-8 text-brand-teal-500" />
              <h1 className="text-xl font-bold text-slate-100">
                Smart Health Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Emergency Button - Always Visible */}
              <a
                href="tel:108"
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-lg transition-all animate-pulse"
                title="Emergency - Call 108"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="hidden sm:inline">SOS</span>
              </a>

              {isLoggedIn && (
                <>
                  <button
                    onClick={() => setShowPermissions(true)}
                    className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-brand-teal-400 transition-colors"
                    title="Browser Permissions"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="hidden lg:inline">Permissions</span>
                  </button>
                  <button
                    onClick={() => setShowBMI(true)}
                    className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-brand-teal-400 transition-colors"
                    title="BMI Calculator"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden lg:inline">BMI</span>
                  </button>
                  <button
                    onClick={() => setCurrentView(View.Dashboard)}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors ${currentView === View.Dashboard ? 'text-brand-teal-400' : 'text-slate-400 hover:text-brand-teal-400'}`}
                    title="Health Dashboard"
                  >
                    <ChartBarIcon className="h-6 w-6" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                  <button
                    onClick={() => setCurrentView(View.MapView)}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors ${currentView === View.MapView ? 'text-brand-teal-400' : 'text-slate-400 hover:text-brand-teal-400'}`}
                    title="Health Map"
                  >
                    <MapIcon className="h-6 w-6" />
                    <span className="hidden sm:inline">Health Map</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setUser(null);
                      setCurrentView(View.Login);
                      resetApp();
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
              {!isLoggedIn && (
                <button
                  onClick={() => setCurrentView(View.Login)}
                  className="text-sm font-medium text-brand-teal-400 hover:text-brand-teal-300 transition-colors"
                >
                  Login / Sign Up
                </button>
              )}
              {currentView === View.Wizard && currentStep !== Step.Symptom && (
                <button
                  onClick={resetApp}
                  className="text-sm font-medium text-brand-teal-400 hover:text-brand-teal-300 transition-colors"
                >
                  Start Over
                </button>
              )}
              {isLoggedIn && (
                <button
                  onClick={() => setCurrentView(View.AboutUs)}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${currentView === View.AboutUs ? 'text-brand-teal-400' : 'text-slate-400 hover:text-brand-teal-400'}`}
                  title="About Us"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">About</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <footer className="bg-slate-800/50 border-t border-slate-700/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Emergency Contact */}
            <div className="text-center md:text-left">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">🚨 Emergency Services</h3>
              <a href="tel:108" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call 108
              </a>
              <p className="text-xs text-slate-500 mt-2">24/7 Ambulance Service</p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <button onClick={() => alert('Privacy Policy: We protect your health data. All information is stored locally in your browser and never shared without consent.')} className="block mx-auto text-brand-teal-400 hover:text-brand-teal-300 transition-colors">
                  Privacy Policy
                </button>
                <button onClick={() => alert('Terms of Service: This app provides health information only. Always consult a qualified healthcare professional for medical advice.')} className="block mx-auto text-brand-teal-400 hover:text-brand-teal-300 transition-colors">
                  Terms of Service
                </button>
                <button onClick={() => setShowPermissions(true)} className="block mx-auto text-brand-teal-400 hover:text-brand-teal-300 transition-colors">
                  App Permissions
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-right">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Contact Support</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>📧 support@smarthealth.com</p>
                <p>📞 1800-XXX-XXXX</p>
                <p>🕐 Mon-Sat: 9 AM - 6 PM</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-6 text-center">
            <p className="text-sm text-slate-400 mb-2">
              <strong className="text-yellow-400">⚠️ Medical Disclaimer:</strong> This AI assistant is for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              © 2024 Smart Health Assistant & Appointment Portal. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              🔒 Your data is private and secure. We never share your health information.
            </p>
          </div>
        </div>
      </footer>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {!isChatOpen && <ChatbotIcon onClick={() => setIsChatOpen(true)} />}
      {showPermissions && <PermissionStatus onClose={() => setShowPermissions(false)} />}
      {showBMI && <BMICalculator onClose={() => setShowBMI(false)} />}
    </div>
  );
};

export default App;

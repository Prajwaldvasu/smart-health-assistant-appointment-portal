export enum Step {
  Symptom = 1,
  Analysis = 2,
  Doctor = 3,
  Booking = 4,
}

export enum View {
  Login = 'login',
  DetailPage = 'detail',
  Wizard = 'wizard',
  Dashboard = 'dashboard',
  MapView = 'map',
  AboutUs = 'about',
}

export enum TriageLevel {
  Minor = 'Minor',
  Moderate = 'Moderate',
  Severe = 'Severe',
}

export enum Mood {
  Happy = 'Happy',
  Neutral = 'Neutral',
  Tired = 'Tired',
  Stressed = 'Stressed',
  Sad = 'Sad',
}

export interface HealthLog {
  date: string; // YYYY-MM-DD
  waterIntake: number; // in glasses
  sleepHours: number;
  mood: Mood;
}

export interface WellnessTip {
  title: string;
  description: string;
  category: 'Mindfulness' | 'Nutrition' | 'Sleep' | 'Activity';
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
}

export interface Symptom {
  id: string;
  name: string;
  bodyPart: string;
  severity: number; // 1-10 scale
  duration: string; // e.g., '2 days'
  notes?: string;
}

export interface Prediction {
  condition: string;
  probability: number; // 0-100
  description: string;
  specialty: string;
}

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  location: LocationCoords;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  rating: number; // 1-5 scale
  availability: string[];
  location: LocationCoords;
  distance?: number; // in km
  phone?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface AnalysisResult {
  triageLevel: TriageLevel;
  triageDescription: string;
  predictions: Prediction[];
  doctors: Doctor[];
  selfCareAdvice: string[];
  predictedCondition?: string;
  confidenceScore?: number;
  triageLevelEmoji?: string;
  recommendation?: string;
  nearbyHospitals?: Array<{
    name: string;
    distance: number;
    address: string;
  }>;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// Constants moved from constants.ts
export const STEPS = [
  { id: Step.Symptom, name: 'Symptoms', title: 'Symptom Checker', description: 'Provide your symptoms and some basic information for a personalized AI analysis.' },
  { id: Step.Analysis, name: 'AI Triage', title: 'AI-Powered Triage', description: 'Our AI is analyzing your symptoms to determine the level of urgency. This is not a medical diagnosis.' },
  { id: Step.Doctor, name: 'Find Doctor', title: 'Find a Specialist', description: 'Based on your analysis, here are some recommended specialists near you.' },
  { id: Step.Booking, name: 'Booking', title: 'Appointment Confirmation', description: 'Your appointment details are confirmed. Know when to rest, and when to reach out.' },
];

export const BODY_PARTS = [
  'Head', 'Eyes', 'Ears', 'Nose', 'Mouth', 'Throat',
  'Neck', 'Chest', 'Abdomen', 'Back', 'Arms', 'Hands',
  'Legs', 'Feet', 'Skin', 'General'
];

export const DURATION_OPTIONS = [
  'Less than a day', '1-2 days', '3-7 days', 'More than a week', 'More than a month'
];

export const GENDER_OPTIONS = ['Prefer not to say', 'Male', 'Female', 'Other'];

export const MOOD_OPTIONS: { value: Mood; label: string; color: string, icon: string }[] = [
  { value: Mood.Happy, label: 'Happy', color: '#34D399', icon: '😄' },
  { value: Mood.Neutral, label: 'Neutral', color: '#60A5FA', icon: '😐' },
  { value: Mood.Tired, label: 'Tired', color: '#A78BFA', icon: '😴' },
  { value: Mood.Stressed, label: 'Stressed', color: '#F59E0B', icon: '😟' },
  { value: Mood.Sad, label: 'Sad', color: '#EF4444', icon: '😢' },
];

export const KARNATAKA_CITIES = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'];
import { HealthLog, Mood } from '../shared/types';

const STORAGE_KEY = 'health_logs_db';
const NETWORK_DELAY = 1000; // ms

// Initial mock data for first-time users
const INITIAL_DATA: { [date: string]: HealthLog } = {
  '2024-07-15': { date: '2024-07-15', waterIntake: 8, sleepHours: 7, mood: Mood.Happy },
  '2024-07-16': { date: '2024-07-16', waterIntake: 6, sleepHours: 6.5, mood: Mood.Tired },
  '2024-07-17': { date: '2024-07-17', waterIntake: 9, sleepHours: 8, mood: Mood.Neutral },
  '2024-07-18': { date: '2024-07-18', waterIntake: 7, sleepHours: 6, mood: Mood.Stressed },
};

// Load data from localStorage or use initial data
const loadFromStorage = (): { [date: string]: HealthLog } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  // First time: save initial data and return it
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
};

// Save data to localStorage
const saveToStorage = (data: { [date: string]: HealthLog }): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Get current database
const getDB = (): { [date: string]: HealthLog } => {
  return loadFromStorage();
}

export const fetchLogs = async (): Promise<HealthLog[]> => {
  console.log('Backend: Fetching logs...');
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Backend: Logs fetched successfully.');
      const db = getDB();
      resolve(Object.values(db));
    }, NETWORK_DELAY);
  });
};

export const saveLog = async (log: HealthLog): Promise<HealthLog> => {
  console.log(`Backend: Saving log for ${log.date}...`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Randomly simulate a failure to test error handling
      if (Math.random() < 0.15) {
        console.error('Backend: Failed to save log.');
        reject(new Error('Failed to sync log with the server. Please try again.'));
        return;
      }
      const db = getDB();
      db[log.date] = log;
      saveToStorage(db);
      console.log('Backend: Log saved successfully.');
      resolve(log);
    }, NETWORK_DELAY / 2);
  });
};

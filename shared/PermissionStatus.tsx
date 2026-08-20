import React, { useState, useEffect } from 'react';

interface PermissionStatusProps {
  onClose: () => void;
}

interface PermissionInfo {
  name: string;
  status: 'granted' | 'denied' | 'prompt' | 'unknown';
  required: boolean;
  description: string;
  icon: string;
}

const PermissionStatus: React.FC<PermissionStatusProps> = ({ onClose }) => {
  const [permissions, setPermissions] = useState<PermissionInfo[]>([]);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const permissionChecks: PermissionInfo[] = [];

    // Geolocation
    const geoStatus = await checkGeolocation();
    permissionChecks.push({
      name: 'Location Access',
      status: geoStatus,
      required: true,
      description: 'Find nearby doctors and hospitals based on your location',
      icon: '📍'
    });

    // Microphone (Speech Recognition)
    const micStatus = checkMicrophone();
    permissionChecks.push({
      name: 'Microphone Access',
      status: micStatus,
      required: false,
      description: 'Use voice input to describe your symptoms',
      icon: '🎤'
    });

    // Notifications
    const notifStatus = checkNotifications();
    permissionChecks.push({
      name: 'Notifications',
      status: notifStatus,
      required: false,
      description: 'Get appointment reminders and health alerts',
      icon: '🔔'
    });

    // LocalStorage
    const storageStatus = checkLocalStorage();
    permissionChecks.push({
      name: 'Local Storage',
      status: storageStatus,
      required: true,
      description: 'Save your health logs and preferences locally',
      icon: '💾'
    });

    // Clipboard
    permissionChecks.push({
      name: 'Clipboard Access',
      status: 'prompt',
      required: false,
      description: 'Copy appointment details to clipboard',
      icon: '📋'
    });

    setPermissions(permissionChecks);
  };

  const checkGeolocation = (): Promise<'granted' | 'denied' | 'prompt'> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('denied');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve('denied');
          } else {
            resolve('prompt');
          }
        },
        { timeout: 1000 }
      );
    });
  };

  const checkMicrophone = (): 'granted' | 'denied' | 'prompt' | 'unknown' => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      return 'denied';
    }
    return 'prompt';
  };

  const checkNotifications = (): 'granted' | 'denied' | 'prompt' | 'unknown' => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    const permission = Notification.permission;
    return permission === 'default' ? 'prompt' : permission;
  };

  const checkLocalStorage = (): 'granted' | 'denied' => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return 'granted';
    } catch (e) {
      return 'denied';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'text-green-400 bg-green-900/30';
      case 'denied':
        return 'text-red-400 bg-red-900/30';
      case 'prompt':
        return 'text-yellow-400 bg-yellow-900/30';
      default:
        return 'text-slate-400 bg-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'granted':
        return '✓ Allowed';
      case 'denied':
        return '✗ Blocked';
      case 'prompt':
        return '? Not Set';
      default:
        return '- Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Browser Permissions</h2>
            <p className="text-sm text-slate-400 mt-1">Manage app access to enhance your experience</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {permissions.map((perm, index) => (
            <div
              key={index}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-brand-teal-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-3xl">{perm.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-200">{perm.name}</h3>
                      {perm.required && (
                        <span className="text-xs bg-brand-teal-500/20 text-brand-teal-400 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{perm.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(perm.status)}`}>
                  {getStatusText(perm.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 p-6 bg-slate-900/50">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Enable Permissions
            </h3>
            <div className="text-xs text-slate-400 space-y-2 pl-7">
              <p>• <strong>Chrome/Edge:</strong> Click the lock icon in the address bar → Site settings</p>
              <p>• <strong>Firefox:</strong> Click the lock icon → Connection secure → More information → Permissions</p>
              <p>• <strong>Safari:</strong> Safari menu → Settings for This Website → Allow</p>
              <p className="text-brand-teal-400 mt-3">💡 Tip: Refresh the page after changing permissions</p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-600 hover:to-brand-green-600 text-white font-medium rounded-lg shadow-lg transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionStatus;

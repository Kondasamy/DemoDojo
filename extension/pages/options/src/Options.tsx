import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import { useState } from 'react';

interface RecordingPreferences {
  defaultAudio: boolean;
  autoSaveLocation: string;
  videoQuality: 'high' | 'medium' | 'low';
  countdownDuration: number;
  showClickIndicator: boolean;
}

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const [preferences, setPreferences] = useState<RecordingPreferences>({
    defaultAudio: true,
    autoSaveLocation: 'Downloads',
    videoQuality: 'high',
    countdownDuration: 3,
    showClickIndicator: true,
  });

  const handleSave = () => {
    chrome.storage.sync.set({ recordingPreferences: preferences }, () => {
      // Show success message
      const status = document.getElementById('save-status');
      if (status) status.textContent = 'Options saved.';
      setTimeout(() => {
        if (status) status.textContent = '';
      }, 2000);
    });
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-gray-900'}`}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/icon-128.png" alt="DemoDojo" className="h-12 w-12" />
            <h1 className={`ml-4 text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              DemoDojo Settings
            </h1>
          </div>
          <Button
            onClick={exampleThemeStorage.toggle}
            theme={theme}
            className="!p-2"
          >
            {isLight ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            )}
          </Button>
        </div>

        {/* Settings Form */}
        <div className="mt-8 space-y-6">
          {/* Recording Quality */}
          <div>
            <label className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
              Video Quality
            </label>
            <select
              value={preferences.videoQuality}
              onChange={(e) => setPreferences(p => ({ ...p, videoQuality: e.target.value as RecordingPreferences['videoQuality'] }))}
              className={`mt-1 block w-full rounded-md border px-3 py-2 ${isLight
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-gray-600 bg-gray-800 text-white'
                }`}
            >
              <option value="high">High (1080p)</option>
              <option value="medium">Medium (720p)</option>
              <option value="low">Low (480p)</option>
            </select>
          </div>

          {/* Countdown Duration */}
          <div>
            <label className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
              Countdown Duration (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={preferences.countdownDuration}
              onChange={(e) => setPreferences(p => ({ ...p, countdownDuration: parseInt(e.target.value) }))}
              className={`mt-1 block w-full rounded-md border px-3 py-2 ${isLight
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-gray-600 bg-gray-800 text-white'
                }`}
            />
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                Default Audio Recording
              </label>
              <button
                onClick={() => setPreferences(p => ({ ...p, defaultAudio: !p.defaultAudio }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.defaultAudio ? 'bg-purple-600' : 'bg-gray-400'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.defaultAudio ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                Show Click Indicator
              </label>
              <button
                onClick={() => setPreferences(p => ({ ...p, showClickIndicator: !p.showClickIndicator }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.showClickIndicator ? 'bg-purple-600' : 'bg-gray-400'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.showClickIndicator ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4">
            <span id="save-status" className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}></span>
            <Button
              onClick={handleSave}
              theme={theme}
              className="px-4 py-2"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div className="p-4">Loading...</div>),
  <div className="p-4 text-red-500">Something went wrong</div>
);

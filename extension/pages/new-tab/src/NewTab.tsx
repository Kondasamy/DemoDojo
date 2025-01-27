import '@src/NewTab.css';
import '@src/NewTab.scss';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import { t } from '@extension/i18n';
import { useState } from 'react';

interface RecentRecording {
  id: string;
  title: string;
  date: string;
  duration: string;
  url: string;
}

const NewTab = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const [recentRecordings] = useState<RecentRecording[]>([
    {
      id: '1',
      title: 'Product Demo',
      date: '2024-01-27',
      duration: '2:30',
      url: '#'
    },
    {
      id: '2',
      title: 'Bug Report',
      date: '2024-01-26',
      duration: '1:45',
      url: '#'
    }
  ]);

  const startNewRecording = async () => {
    try {
      console.log('Starting new recording process...');

      // Create a new tab with a regular webpage
      console.log('Creating new tab...');
      const tab = await new Promise<chrome.tabs.Tab>(resolve => {
        chrome.tabs.create({
          active: true,
          url: 'https://www.google.com' // Start with a regular webpage
        }, tab => {
          console.log('New tab created:', tab);
          resolve(tab);
        });
      });

      if (!tab.id) {
        console.error('No tab id found');
        return;
      }

      // Wait for the tab to load completely
      console.log('Waiting for tab to load...');
      await new Promise<void>((resolve) => {
        const checkTab = () => {
          chrome.tabs.get(tab.id!, (updatedTab) => {
            console.log('Tab status:', updatedTab.status);
            if (updatedTab.status === 'complete') {
              console.log('Tab loaded completely');
              resolve();
            } else {
              setTimeout(checkTab, 100);
            }
          });
        };
        checkTab();
      });

      console.log('Injecting content script...');
      try {
        // Inject the content script
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['/content-runtime/index.iife.js'],
        });
        console.log('Content script injection results:', results);
      } catch (error) {
        console.error('Failed to inject content script:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }

      console.log('Requesting screen capture...');
      // Request screen capture first
      const streamId = await new Promise<string>((resolve, reject) => {
        chrome.desktopCapture.chooseDesktopMedia(
          ['screen', 'window', 'tab'],
          tab,
          (id) => {
            console.log('Screen capture response:', id ? 'Granted' : 'Denied');
            if (!id) {
              reject(new Error('Screen capture permission denied'));
              return;
            }
            resolve(id);
          }
        );
      });

      console.log('Screen capture approved with streamId:', streamId);
      console.log('Sending message to content script...');

      // Send message to start recording
      try {
        const response = await new Promise<any>((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id!, {
            type: 'START_RECORDING',
            settings: {
              audio: true,
              hideBrowserUI: false,
            },
            streamId,
          }, response => {
            console.log('Received response from content script:', response);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });

        console.log('Recording started with response:', response);
      } catch (error) {
        console.error('Failed to communicate with content script:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    } catch (error) {
      console.error('Recording setup failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-gray-900'}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/icon-128.png" alt="DemoDojo" className="h-16 w-16" />
            <h1 className={`ml-4 text-4xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              DemoDojo
            </h1>
          </div>
          <p className={`mt-2 text-lg ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
            Create and share interactive demos effortlessly
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className={`rounded-lg p-6 ${isLight ? 'bg-white shadow-sm' : 'bg-gray-800'}`}>
            <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Start Recording
            </h2>
            <p className={`mt-2 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Create a new screen recording with audio narration
            </p>
            <Button
              className="mt-4 w-full justify-center"
              onClick={startNewRecording}
              theme={theme}
            >
              New Recording
            </Button>
          </div>

          <div className={`rounded-lg p-6 ${isLight ? 'bg-white shadow-sm' : 'bg-gray-800'}`}>
            <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Keyboard Shortcuts
            </h2>
            <div className={`mt-4 space-y-2 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              <p>⌘ + Shift + P: Pause/Resume</p>
              <p>⌘ + Shift + X: Stop Recording</p>
            </div>
          </div>

          <div className={`rounded-lg p-6 ${isLight ? 'bg-white shadow-sm' : 'bg-gray-800'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Settings
              </h2>
              <Button
                className="!p-2"
                onClick={exampleThemeStorage.toggle}
                theme={theme}
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
            <p className={`mt-2 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Customize your recording preferences
            </p>
          </div>
        </div>

        {/* Recent Recordings */}
        <div className="mt-12">
          <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Recent Recordings
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentRecordings.map((recording) => (
              <a
                key={recording.id}
                href={recording.url}
                className={`block rounded-lg p-4 transition hover:opacity-75 ${isLight ? 'bg-white shadow-sm' : 'bg-gray-800'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {recording.title}
                  </h3>
                  <span className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {recording.duration}
                  </span>
                </div>
                <p className={`mt-1 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {recording.date}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(NewTab, <div className="p-4">Loading...</div>),
  <div className="p-4 text-red-500">Something went wrong</div>
);

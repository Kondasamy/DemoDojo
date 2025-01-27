import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { useState, type ComponentPropsWithoutRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface RecordingSettings {
  audio: boolean;
  hideBrowserUI: boolean;
}

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const [settings, setSettings] = useState<RecordingSettings>({
    audio: true,
    hideBrowserUI: false,
  });

  const startRecording = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        toast.error('No active tab found');
        return;
      }

      // Inject the content script for recording UI
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['/content-runtime/index.iife.js'],
        });
      } catch (error) {
        console.error('Failed to inject content script:', error);
        toast.error(`Failed to inject recording script: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }

      // Request screen capture
      try {
        const streamId = await new Promise<string>((resolve, reject) => {
          chrome.desktopCapture.chooseDesktopMedia(
            ['screen', 'window', 'tab'],
            tab,
            (id) => {
              if (!id) {
                reject(new Error('No screen selected'));
                return;
              }
              resolve(id);
            }
          );
        });

        // Send message to content script to start recording
        const response = await chrome.tabs.sendMessage(tab.id, {
          type: 'START_RECORDING',
          settings,
          streamId,
        });

        console.log('Recording started with response:', response);
        window.close(); // Close popup after starting
      } catch (error) {
        console.error('Failed to start screen capture:', error);
        toast.error(
          error instanceof Error
            ? `Screen capture failed: ${error.message}`
            : 'Screen capture was cancelled or failed'
        );
      }
    } catch (error) {
      console.error('Recording setup failed:', error);
      toast.error(
        error instanceof Error
          ? `Setup failed: ${error.message}`
          : 'Failed to setup recording'
      );
    }
  };

  return (
    <div className={`min-h-screen w-80 p-10 ${isLight ? 'bg-white' : 'bg-gray-900'}`}>
      <div className="space-y-6">
        <h1 className={`text-2xl font-bold ${isLight ? 'text-purple-900' : 'text-white text-center'}`}>
          <span className="inline-block w-10 h-10"><img src="/icon-128.png" alt="DemoDojo" className="w-full h-full" /></span>
          <span className="inline-block pl-6">DemoDojo</span>
        </h1>

        <p className={`text-sm text-gray-600 ${isLight ? 'text-gray-900' : 'text-gray-300'}`}>
          Record your screen and create interactive demos.
        </p>

        {/* Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              Record Audio
            </label>
            <button
              onClick={() => setSettings(s => ({ ...s, audio: !s.audio }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full
                ${settings.audio ? 'bg-purple-600' : 'bg-gray-400'}`}>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                  ${settings.audio ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className={`${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              Hide Browser UI
            </label>
            <button
              onClick={() => setSettings(s => ({ ...s, hideBrowserUI: !s.hideBrowserUI }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full
                ${settings.hideBrowserUI ? 'bg-purple-600' : 'bg-gray-400'}`}>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                  ${settings.hideBrowserUI ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {/* Shortcuts Info */}
        <div className={`rounded-lg bg-opacity-10 p-3 ${isLight ? 'bg-gray-100' : 'bg-gray-800'}`}>
          <h3 className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Shortcuts
          </h3>
          <ul className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
            <li>⌘ + Shift + P: Pause/Resume</li>
            <li>⌘ + Shift + X: Stop Recording</li>
          </ul>
        </div>

        {/* Start Recording Button */}
        <button
          onClick={startRecording}
          className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label="Start Recording">
          Start Recording
        </button>

        {/* Theme Toggle */}
        <ToggleButton className="w-full" />
      </div>

      <ToastContainer
        position="bottom-center"
        theme={isLight ? 'light' : 'dark'}
      />
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  return (
    <button
      className={`${props.className} flex items-center justify-center gap-2 rounded-lg border ${isLight
        ? 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
        : 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
        } px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
      onClick={exampleThemeStorage.toggle}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      {isLight ? (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          Dark Mode
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
            />
          </svg>
          Light Mode
        </>
      )}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occurred </div>);

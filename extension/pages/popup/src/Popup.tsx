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

      // Inject the content script for recording UI
      await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ['/content-runtime/index.iife.js'],
      });

      // Request screen capture
      const streamId = await new Promise<string>((resolve) => {
        chrome.desktopCapture.chooseDesktopMedia(
          ['screen', 'window', 'tab'],
          tab,
          (id) => resolve(id)
        );
      });

      // Send message to content script to start recording
      chrome.tabs.sendMessage(tab.id!, {
        type: 'START_RECORDING',
        settings,
        streamId,
      });

      window.close(); // Close popup after starting
    } catch (error) {
      toast.error('Failed to start recording. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen w-80 p-4 ${isLight ? 'bg-white' : 'bg-gray-900'}`}>
      <div className="space-y-6">
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
          DemoDojo Recorder
        </h1>

        {/* Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              Record Audio
            </label>
            <button
              onClick={() => setSettings(s => ({ ...s, audio: !s.audio }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full
                ${settings.audio ? 'bg-blue-600' : 'bg-gray-400'}`}>
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
                ${settings.hideBrowserUI ? 'bg-blue-600' : 'bg-gray-400'}`}>
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
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);

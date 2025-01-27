import { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Recorder from './Recorder';

interface RecordingSettings {
  audio: boolean;
  hideBrowserUI: boolean;
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'paused';

const App = () => {
  const isInitializedRef = useRef(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [settings, setSettings] = useState<RecordingSettings>({
    audio: true,
    hideBrowserUI: false,
  });

  const recorderRef = useRef<Recorder>(new Recorder());

  // Handle message listening and screen capture request
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log('App already initialized, skipping setup');
      return;
    }

    console.log('App component mounted, initializing...');
    isInitializedRef.current = true;

    const handleMessage = async (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      console.log('Message received in content script:', {
        type: message.type,
        streamId: message.streamId,
        settings: message.settings
      });

      if (message.type === 'START_RECORDING') {
        if (!message.streamId) {
          console.error('No streamId provided in START_RECORDING message');
          sendResponse({ success: false, error: 'No streamId provided' });
          return;
        }

        try {
          console.log('Starting recording process...');
          setSettings(message.settings);
          setRecordingState('countdown');
          setCountdown(3);

          await recorderRef.current.start({
            streamId: message.streamId,
            audio: message.settings?.audio ?? true,
            recordingMode: 'desktop',
          }, (url) => {
            console.log('Recording completed, video URL:', url);
            toast.success('Recording saved');
          });

          console.log('Recording initialized successfully');
          sendResponse({ success: true, message: 'Recording initialized' });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to start recording:', error);
          setRecordingState('idle');
          toast.error(`Failed to start recording: ${errorMessage}`);
          sendResponse({ success: false, error: errorMessage });
        }
        return true;
      }
    };

    let messageListener: any = null;

    try {
      messageListener = handleMessage;
      chrome.runtime.onMessage.addListener(messageListener);
      console.log('Message listener added successfully');

      // Request screen capture
      console.log('Requesting screen capture...');
      chrome.runtime.sendMessage({
        type: 'REQUEST_SCREEN_CAPTURE',
        settings: {
          audio: true,
          hideBrowserUI: false
        }
      }, (response) => {
        console.log('Screen capture request response:', response);
        if (!response?.success) {
          const error = response?.error || 'Unknown error';
          console.error('Screen capture request failed:', error);
          toast.error(`Failed to start screen capture: ${error}`);
          setRecordingState('idle');
        }
      });
    } catch (error) {
      console.error('Failed to initialize recording:', error);
      toast.error('Failed to initialize recording');
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up App component...');
      if (messageListener) {
        try {
          chrome.runtime.onMessage.removeListener(messageListener);
          console.log('Message listener removed successfully');
        } catch (error) {
          console.error('Failed to remove message listener:', error);
        }
      }

      if (recorderRef.current) {
        try {
          recorderRef.current.stop();
          console.log('Recorder stopped successfully');
        } catch (error) {
          console.error('Failed to stop recorder:', error);
        }
      }

      isInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (recordingState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (recordingState === 'countdown' && countdown === 0) {
      setRecordingState('recording');
      console.log('Countdown complete, recording started');
    }
  }, [countdown, recordingState]);

  useEffect(() => {
    if (recordingState === 'recording') {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      const handleClick = () => {
        setClickCount((prev) => prev + 1);
      };

      document.addEventListener('click', handleClick);

      return () => {
        clearInterval(timer);
        document.removeEventListener('click', handleClick);
      };
    }
  }, [recordingState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey) {
        if (e.key === 'p') {
          if (recordingState === 'recording') {
            setRecordingState('paused');
            console.log('Recording paused');
          } else if (recordingState === 'paused') {
            setRecordingState('recording');
            console.log('Recording resumed');
          }
        } else if (e.key === 'x') {
          if (recordingState === 'recording' || recordingState === 'paused') {
            setRecordingState('idle');
            recorderRef.current.stop();
            console.log('Recording stopped');
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [recordingState]);

  if (recordingState === 'idle') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-overlay fixed top-4 right-4 z-[2147483647]">
      {recordingState === 'countdown' ? (
        <div className="countdown-overlay flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold text-white shadow-lg">
          {countdown}
        </div>
      ) : (
        <div className="controls-panel rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur dark:bg-gray-800/90">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="recording-indicator h-2 w-2 rounded-full bg-red-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Recording: {formatTime(elapsedTime)}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Clicks: {clickCount}
            </div>
            <div className="flex space-x-2">
              {recordingState === 'recording' ? (
                <button
                  onClick={() => {
                    setRecordingState('paused');
                    console.log('Recording paused');
                  }}
                  className="rounded bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  aria-label="Pause Recording"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={() => {
                    setRecordingState('recording');
                    console.log('Recording resumed');
                  }}
                  className="rounded bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label="Resume Recording"
                >
                  Resume
                </button>
              )}
              <button
                onClick={() => {
                  setRecordingState('idle');
                  recorderRef.current.stop();
                  console.log('Recording stopped');
                }}
                className="rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Stop Recording"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="bottom-right"
        theme="dark"
        toastClassName="!bg-gray-800 !text-white"
      />
    </div>
  );
};

export default App;

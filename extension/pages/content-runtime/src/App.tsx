import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface RecordingSettings {
  audio: boolean;
  hideBrowserUI: boolean;
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'paused';

const App = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [settings, setSettings] = useState<RecordingSettings>({
    audio: true,
    hideBrowserUI: false,
  });

  useEffect(() => {
    const handleMessage = async (message: any) => {
      if (message.type === 'START_RECORDING') {
        setSettings(message.settings);
        setRecordingState('countdown');

        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: message.settings.audio
          });

          const recorder = new MediaRecorder(stream);
          const chunks: BlobPart[] = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            // Handle the recording (e.g., upload to cloud or download)
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording-${new Date().toISOString()}.webm`;
            a.click();
          };

          setMediaRecorder(recorder);
        } catch (error) {
          toast.error('Failed to start recording');
          setRecordingState('idle');
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
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
      mediaRecorder?.start();
    }
  }, [countdown, recordingState, mediaRecorder]);

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
            mediaRecorder?.pause();
          } else if (recordingState === 'paused') {
            setRecordingState('recording');
            mediaRecorder?.resume();
          }
        } else if (e.key === 'x') {
          if (recordingState === 'recording' || recordingState === 'paused') {
            setRecordingState('idle');
            mediaRecorder?.stop();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [recordingState, mediaRecorder]);

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
                    mediaRecorder?.pause();
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
                    mediaRecorder?.resume();
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
                  mediaRecorder?.stop();
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

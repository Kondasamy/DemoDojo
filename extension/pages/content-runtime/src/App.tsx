import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface RecordingSettings {
  audio: boolean;
  hideBrowserUI: boolean;
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'paused';

interface ChromeMediaConstraint {
  mandatory: {
    chromeMediaSource: string;
    chromeMediaSourceId: string;
  };
}

interface ExtendedMediaTrackConstraints extends MediaTrackConstraints {
  mandatory?: {
    chromeMediaSource: string;
    chromeMediaSourceId: string;
  };
}

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
    const handleMessage = async (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      console.log('Content script received message:', message);

      if (message.type === 'START_RECORDING') {
        setSettings(message.settings);
        setRecordingState('countdown');

        try {
          console.log('Getting media stream from streamId:', message.streamId);

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: message.streamId,
                displaySurface: 'browser'
              }
            } as ExtendedMediaTrackConstraints,
            audio: message.settings.audio ? {
              mandatory: {
                chromeMediaSource: 'desktop'
              }
            } as ExtendedMediaTrackConstraints : false
          });

          console.log('Stream obtained successfully');
          console.log('Video tracks:', stream.getVideoTracks().map(track => ({
            kind: track.kind,
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            settings: track.getSettings()
          })));

          // Create a MediaRecorder instance
          console.log('Creating MediaRecorder...');
          const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
          });
          console.log('MediaRecorder created with state:', recorder.state);

          const chunks: BlobPart[] = [];

          recorder.ondataavailable = (e) => {
            console.log('Data available event:', {
              size: e.data.size,
              type: e.data.type,
              timestamp: new Date().toISOString()
            });
            if (e.data.size > 0) {
              chunks.push(e.data);
              console.log('Total chunks:', chunks.length);
            }
          };

          recorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            if (event instanceof Event && 'error' in event) {
              const error = (event as any).error;
              toast.error(`Recording error: ${error?.name || 'Unknown error'}`);
            } else {
              toast.error('An error occurred during recording');
            }
          };

          recorder.onstart = () => {
            console.log('MediaRecorder started');
            toast.success('Recording started');
          };

          recorder.onpause = () => {
            console.log('MediaRecorder paused');
            toast.info('Recording paused');
          };

          recorder.onresume = () => {
            console.log('MediaRecorder resumed');
            toast.info('Recording resumed');
          };

          recorder.onstop = () => {
            console.log('MediaRecorder stopped, creating blob...');
            const blob = new Blob(chunks, { type: 'video/webm' });
            console.log('Blob created:', blob.size, 'bytes');

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording-${new Date().toISOString()}.webm`;
            a.click();

            // Clean up
            stream.getTracks().forEach(track => track.stop());
            URL.revokeObjectURL(url);
            console.log('Recording cleanup completed');
            toast.success('Recording saved');
          };

          // Request data every second
          recorder.start(1000);
          console.log('MediaRecorder started with 1s timeslice');

          setMediaRecorder(recorder);
          sendResponse({ success: true, message: 'Recording initialized' });
        } catch (error) {
          console.error('Recording setup failed:', error);
          setRecordingState('idle');
          sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
        return true; // Keep the message channel open for the response
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

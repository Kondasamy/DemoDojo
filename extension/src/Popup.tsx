import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RecordingSettings } from './components/RecordingSettings';
import { CountdownTimer } from './components/CountdownTimer';
import { RecordingInterface } from './components/RecordingInterface';
import { PostRecordingScreen } from './components/PostRecordingScreen';

interface RecordingSettings {
    audio: boolean;
    hideBrowserUI: boolean;
    microphone: MediaDeviceInfo | null;
}

interface RecordingState {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    clickCount: number;
}

type ScreenState = 'welcome' | 'recording' | 'post-recording';

const initialRecordingState: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    clickCount: 0,
};

const Popup = () => {
    const [isLight, setIsLight] = useState(() => {
        return window.matchMedia('(prefers-color-scheme: light)').matches;
    });
    const [screenState, setScreenState] = useState<ScreenState>('welcome');
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [audioLevel, setAudioLevel] = useState<number>(0);
    const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([]);
    const [recordingState, setRecordingState] = useState<RecordingState>(initialRecordingState);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>('');

    const [settings, setSettings] = useState<RecordingSettings>({
        audio: true,
        hideBrowserUI: false,
        microphone: null,
    });

    // Theme detection
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const handleChange = (e: MediaQueryListEvent) => setIsLight(e.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Initialize microphones
    useEffect(() => {
        const setupMicrophones = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const mics = devices.filter(device => device.kind === 'audioinput');
                setAvailableMicrophones(mics);
                if (mics.length > 0) {
                    setSettings(prev => ({ ...prev, microphone: mics[0] }));
                }
            } catch (error) {
                console.error('Failed to get microphones:', error);
                toast.error('Failed to access microphones');
            }
        };

        setupMicrophones();
    }, []);

    // Monitor audio levels
    useEffect(() => {
        if (!settings.audio || !settings.microphone) return;

        let audioContext: AudioContext;
        let analyser: AnalyserNode;
        let dataArray: Uint8Array;
        let animationFrame: number;

        const measureAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average);
            animationFrame = requestAnimationFrame(measureAudioLevel);
        };

        const setupAudioMonitoring = async () => {
            try {
                if (!settings.microphone?.deviceId) return;

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: settings.microphone.deviceId }
                });

                audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                dataArray = new Uint8Array(analyser.frequencyBinCount);
                measureAudioLevel();
            } catch (error) {
                console.error('Failed to monitor audio:', error);
            }
        };

        setupAudioMonitoring();

        return () => {
            if (audioContext) audioContext.close();
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [settings.audio, settings.microphone]);

    // Recording duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (recordingState.isRecording && !recordingState.isPaused) {
            interval = setInterval(() => {
                setRecordingState(prev => ({
                    ...prev,
                    duration: prev.duration + 1
                }));
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [recordingState.isRecording, recordingState.isPaused]);

    const handleStartRecording = async () => {
        setIsCountingDown(true);

        // Countdown timer
        for (let i = 3; i > 0; i--) {
            setCountdown(i);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setIsCountingDown(false);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab?.id) {
                toast.error('No active tab found');
                return;
            }

            // Check if recording is already in progress
            if (recordingState.isRecording) {
                toast.error('Recording is already in progress');
                return;
            }

            // Inject content script
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['/content-runtime/index.iife.js'],
                });

                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                toast.error('Failed to inject recording script');
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

                // Start recording
                const response = await new Promise<any>((resolve, reject) => {
                    chrome.tabs.sendMessage(tab.id!, {
                        type: 'START_RECORDING',
                        settings,
                        streamId,
                    }, response => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(response);
                        }
                    });
                });

                if (!response?.success) {
                    throw new Error(response?.error || 'Failed to start recording');
                }

                setRecordingState(prev => ({ ...prev, isRecording: true }));
                setScreenState('recording');
                toast.success('Recording started!');
                window.close();
            } catch (error) {
                toast.error('Screen capture was cancelled or failed');
            }
        } catch (error) {
            setIsCountingDown(false);
            toast.error(
                error instanceof Error
                    ? `Setup failed: ${error.message}`
                    : 'Failed to setup recording'
            );
        }
    };

    const handlePauseResume = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;

            const message = recordingState.isPaused ? 'RESUME_RECORDING' : 'PAUSE_RECORDING';
            await chrome.tabs.sendMessage(tab.id, { type: message });

            setRecordingState(prev => ({ ...prev, isPaused: !prev.isPaused }));
            toast.success(recordingState.isPaused ? 'Recording resumed' : 'Recording paused');
        } catch (error) {
            toast.error('Failed to pause/resume recording');
        }
    };

    const handleStopRecording = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;

            const response = await chrome.tabs.sendMessage(tab.id, { type: 'STOP_RECORDING' });
            if (response?.videoUrl) {
                setRecordedVideoUrl(response.videoUrl);
                setScreenState('post-recording');
            }

            setRecordingState(initialRecordingState);
            toast.success('Recording stopped');
        } catch (error) {
            toast.error('Failed to stop recording');
        }
    };

    const handleEditRecording = () => {
        // Implement video editor integration
        toast.info('Video editor coming soon!');
    };

    const handleRestartRecording = () => {
        setRecordedVideoUrl('');
        setRecordingState(initialRecordingState);
        setScreenState('welcome');
    };

    return (
        <div className={`min-h-screen w-80 p-6 ${isLight ? 'bg-white' : 'bg-gray-900'}`}>
            {isCountingDown && <CountdownTimer count={countdown} isLight={isLight} />}

            <div className="space-y-6">
                {screenState === 'welcome' && (
                    <>
                        <WelcomeScreen
                            onStartRecording={handleStartRecording}
                            isLight={isLight}
                        />

                        <RecordingSettings
                            settings={settings}
                            onSettingsChange={setSettings}
                            availableMicrophones={availableMicrophones}
                            audioLevel={audioLevel}
                            isLight={isLight}
                        />
                    </>
                )}

                {screenState === 'recording' && (
                    <RecordingInterface
                        recordingState={recordingState}
                        onPauseResume={handlePauseResume}
                        onStop={handleStopRecording}
                        onFinish={handleStopRecording}
                        isLight={isLight}
                    />
                )}

                {screenState === 'post-recording' && (
                    <PostRecordingScreen
                        videoUrl={recordedVideoUrl}
                        onEdit={handleEditRecording}
                        onRestart={handleRestartRecording}
                        isLight={isLight}
                    />
                )}
            </div>

            <ToastContainer
                position="bottom-center"
                theme={isLight ? 'light' : 'dark'}
            />
        </div>
    );
};

export default Popup; 
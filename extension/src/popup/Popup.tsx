import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { PlayIcon, PauseIcon, StopIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';

interface RecordingState {
    isRecording: boolean;
    isPaused: boolean;
    clickCount: number;
}

const Popup: React.FC = () => {
    const [recordingState, setRecordingState] = useState<RecordingState>({
        isRecording: false,
        isPaused: false,
        clickCount: 0,
    });

    const [darkMode, setDarkMode] = useState(false);

    const handleStartRecording = async () => {
        try {
            chrome.runtime.sendMessage({ action: 'START_RECORDING' }, (response) => {
                if (response.success) {
                    setRecordingState(prev => ({ ...prev, isRecording: true }));
                    toast.success('Recording started!');
                } else {
                    toast.error('Failed to start recording');
                }
            });
        } catch (error) {
            toast.error('Error starting recording');
        }
    };

    const handlePauseRecording = () => {
        chrome.runtime.sendMessage({ action: 'PAUSE_RECORDING' }, (response) => {
            if (response.success) {
                setRecordingState(prev => ({ ...prev, isPaused: !prev.isPaused }));
                toast.info(recordingState.isPaused ? 'Recording resumed' : 'Recording paused');
            }
        });
    };

    const handleStopRecording = () => {
        chrome.runtime.sendMessage({ action: 'STOP_RECORDING' }, (response) => {
            if (response.success) {
                setRecordingState({
                    isRecording: false,
                    isPaused: false,
                    clickCount: 0,
                });
                toast.success('Recording completed!');
            }
        });
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">DemoDojo</h1>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? '🌞' : '🌙'}
                </button>
            </header>

            <main className="flex-1">
                {!recordingState.isRecording ? (
                    <div className="flex flex-col items-center gap-6">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={handleStartRecording}
                                        className="w-32 h-32 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors"
                                        aria-label="Start recording"
                                    >
                                        <PlayIcon className="w-12 h-12" />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content className="bg-gray-800 text-white px-3 py-1 rounded">
                                    Start Recording
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Alt + R</kbd> to start/stop recording
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-lg font-semibold">
                            Recording in Progress
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                {recordingState.clickCount} clicks
                            </span>
                        </div>

                        <div className="flex gap-4">
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            onClick={handlePauseRecording}
                                            className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            aria-label={recordingState.isPaused ? "Resume recording" : "Pause recording"}
                                        >
                                            {recordingState.isPaused ? (
                                                <PlayIcon className="w-6 h-6" />
                                            ) : (
                                                <PauseIcon className="w-6 h-6" />
                                            )}
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content className="bg-gray-800 text-white px-3 py-1 rounded">
                                        {recordingState.isPaused ? "Resume" : "Pause"}
                                    </Tooltip.Content>
                                </Tooltip.Root>

                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            onClick={handleStopRecording}
                                            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white"
                                            aria-label="Stop recording"
                                        >
                                            <StopIcon className="w-6 h-6" />
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content className="bg-gray-800 text-white px-3 py-1 rounded">
                                        Stop Recording
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </Tooltip.Provider>
                        </div>
                    </div>
                )}
            </main>

            <footer className="mt-auto pt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd> to cancel recording
            </footer>
        </div>
    );
};

export default Popup; 
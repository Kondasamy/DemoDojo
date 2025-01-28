import React from 'react';
import { PauseIcon, PlayIcon, StopIcon, CheckIcon } from '@heroicons/react/24/outline';

interface RecordingInterfaceProps {
    recordingState: {
        isRecording: boolean;
        isPaused: boolean;
        duration: number;
        clickCount: number;
    };
    onPauseResume: () => void;
    onStop: () => void;
    onFinish: () => void;
    isLight: boolean;
}

export const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
    recordingState,
    onPauseResume,
    onStop,
    onFinish,
    isLight,
}) => {
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`space-y-4 rounded-lg p-4 ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
            {/* Recording Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="flex h-3 w-3 items-center">
                        <div className={`
                            h-3 w-3 rounded-full
                            ${recordingState.isPaused
                                ? 'bg-yellow-500'
                                : 'animate-pulse bg-red-500'
                            }
                        `} />
                    </div>
                    <span className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {recordingState.isPaused ? 'Recording Paused' : 'Recording in Progress'}
                    </span>
                </div>
                <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    {formatDuration(recordingState.duration)}
                </span>
            </div>

            {/* Click Counter */}
            <div className={`rounded-md bg-opacity-50 p-2 ${isLight ? 'bg-gray-100' : 'bg-gray-700'
                }`}>
                <p className={`text-center text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    <span className="font-bold">{recordingState.clickCount}</span> Clicks Recorded
                </p>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onPauseResume}
                    onKeyDown={(e) => e.key === 'Enter' && onPauseResume()}
                    className={`
                        flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium
                        transition-colors duration-200
                        ${isLight
                            ? 'bg-white text-gray-700 hover:bg-gray-100'
                            : 'bg-gray-700 text-white hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    tabIndex={0}
                    aria-label={recordingState.isPaused ? 'Resume Recording' : 'Pause Recording'}
                >
                    {recordingState.isPaused ? (
                        <PlayIcon className="h-5 w-5" />
                    ) : (
                        <PauseIcon className="h-5 w-5" />
                    )}
                    <span>{recordingState.isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                    onClick={onStop}
                    onKeyDown={(e) => e.key === 'Enter' && onStop()}
                    className={`
                        flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium text-white
                        transition-colors duration-200 bg-red-500 hover:bg-red-600
                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    `}
                    tabIndex={0}
                    aria-label="Stop Recording"
                >
                    <StopIcon className="h-5 w-5" />
                    <span>Stop</span>
                </button>

                <button
                    onClick={onFinish}
                    onKeyDown={(e) => e.key === 'Enter' && onFinish()}
                    className={`
                        flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium text-white
                        transition-colors duration-200 bg-green-500 hover:bg-green-600
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    `}
                    tabIndex={0}
                    aria-label="Finish Recording"
                >
                    <CheckIcon className="h-5 w-5" />
                    <span>Finish</span>
                </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className={`mt-4 text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                <p className="text-center">
                    Press <kbd className={`rounded-md border px-2 py-0.5 ${isLight ? 'border-gray-300 bg-gray-100' : 'border-gray-600 bg-gray-800'
                        }`}>Space</kbd> to pause/resume,{' '}
                    <kbd className={`rounded-md border px-2 py-0.5 ${isLight ? 'border-gray-300 bg-gray-100' : 'border-gray-600 bg-gray-800'
                        }`}>Esc</kbd> to stop
                </p>
            </div>
        </div>
    );
}; 
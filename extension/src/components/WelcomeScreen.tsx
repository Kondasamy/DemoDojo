import React from 'react';

interface WelcomeScreenProps {
    onStartRecording: () => void;
    isLight: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartRecording, isLight }) => {
    return (
        <div className={`space-y-6 text-center ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <h1 className="text-2xl font-bold"> <img src="src/assets/icon32.png" alt="DemoDojo" className="w-16 h-16 mx-auto" /> Welcome to DemoDojo</h1>

            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                Create beautiful screen recordings with just a few clicks
            </p>

            <button
                onClick={onStartRecording}
                onKeyDown={(e) => e.key === 'Enter' && onStartRecording()}
                className={`
                    w-full rounded-lg bg-purple-600 px-4 py-3 text-white shadow-lg
                    transition-all duration-200 ease-in-out
                    hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                    active:bg-purple-800
                `}
                tabIndex={0}
                aria-label="Start Recording"
                role="button"
            >
                Start Recording
            </button>

            <div className="space-y-2">
                <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
                <div className={`space-y-1 text-xs ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    <p>
                        <kbd className={`rounded-md border px-2 py-0.5 ${isLight
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-gray-600 bg-gray-800'
                            }`}>
                            Space
                        </kbd>
                        {' '}Pause/Resume recording
                    </p>
                    <p>
                        <kbd className={`rounded-md border px-2 py-0.5 ${isLight
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-gray-600 bg-gray-800'
                            }`}>
                            Esc
                        </kbd>
                        {' '}Stop recording
                    </p>
                </div>
            </div>
        </div>
    );
}; 
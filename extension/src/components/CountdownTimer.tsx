import React from 'react';

interface CountdownTimerProps {
    count: number;
    isLight: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ count, isLight }) => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            role="alert"
            aria-live="assertive"
        >
            <div
                className={`
                    flex h-32 w-32 items-center justify-center rounded-full 
                    ${isLight ? 'bg-gray-600 text-gray-900' : 'bg-white text-gray-900'}
                    shadow-lg transition-all duration-300 ease-in-out
                `}
            >
                <span
                    className="text-6xl font-bold"
                    aria-label={`Recording starts in ${count} seconds`}
                >
                    {count}
                </span>
            </div>
        </div>
    );
}; 
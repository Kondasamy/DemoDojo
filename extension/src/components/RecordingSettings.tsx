import React from 'react';
import { Switch } from '@headlessui/react';
import { MicrophoneIcon, SpeakerWaveIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface RecordingSettingsProps {
    settings: {
        audio: boolean;
        hideBrowserUI: boolean;
        microphone: MediaDeviceInfo | null;
    };
    onSettingsChange: (settings: any) => void;
    availableMicrophones: MediaDeviceInfo[];
    audioLevel: number;
    isLight: boolean;
}

export const RecordingSettings: React.FC<RecordingSettingsProps> = ({
    settings,
    onSettingsChange,
    availableMicrophones,
    audioLevel,
    isLight
}) => {
    const handleToggleAudio = () => {
        onSettingsChange({ ...settings, audio: !settings.audio });
    };

    const handleToggleBrowserUI = () => {
        onSettingsChange({ ...settings, hideBrowserUI: !settings.hideBrowserUI });
    };

    const handleMicrophoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMic = availableMicrophones.find(mic => mic.deviceId === event.target.value) || null;
        onSettingsChange({ ...settings, microphone: selectedMic });
    };

    return (
        <div className={`space-y-6 rounded-lg p-4 ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
            <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Recording Settings
            </h2>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <SpeakerWaveIcon className={`h-5 w-5 ${isLight ? 'text-gray-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                        Record Audio
                    </span>
                </div>
                <Switch
                    checked={settings.audio}
                    onChange={handleToggleAudio}
                    className={`
                        ${settings.audio ? 'bg-purple-600' : isLight ? 'bg-gray-200' : 'bg-gray-600'}
                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500
                        focus:ring-offset-2
                    `}
                >
                    <span className="sr-only">Enable audio recording</span>
                    <span
                        className={`
                            ${settings.audio ? 'translate-x-5' : 'translate-x-0'}
                            pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow
                            ring-0 transition duration-200 ease-in-out
                        `}
                    />
                </Switch>
            </div>

            {/* Microphone Selection */}
            {settings.audio && (
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <MicrophoneIcon className={`h-5 w-5 ${isLight ? 'text-gray-600' : 'text-gray-300'}`} />
                        <label
                            htmlFor="microphone-select"
                            className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-200'}`}
                        >
                            Select Microphone
                        </label>
                    </div>
                    <select
                        id="microphone-select"
                        value={settings.microphone?.deviceId || ''}
                        onChange={handleMicrophoneChange}
                        className={`
                            w-full rounded-md border px-3 py-2 text-sm
                            ${isLight
                                ? 'border-gray-300 bg-white text-gray-900 focus:border-purple-500'
                                : 'border-gray-600 bg-gray-700 text-white focus:border-purple-400'}
                            focus:outline-none focus:ring-2 focus:ring-purple-500
                        `}
                    >
                        <option value="">Select a microphone</option>
                        {availableMicrophones.map(mic => (
                            <option key={mic.deviceId} value={mic.deviceId}>
                                {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                            </option>
                        ))}
                    </select>

                    {/* Audio Level Indicator */}
                    {settings.microphone && (
                        <div className="mt-2 space-y-1">
                            <span className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                                Audio Level
                            </span>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-full bg-purple-600 transition-all duration-150"
                                    style={{ width: `${Math.min(100, (audioLevel / 255) * 100)}%` }}
                                    role="progressbar"
                                    aria-valuenow={Math.round((audioLevel / 255) * 100)}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Browser UI Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ComputerDesktopIcon className={`h-5 w-5 ${isLight ? 'text-gray-600' : 'text-gray-300'}`} />
                    <span className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                        Hide Browser Toolbars
                    </span>
                </div>
                <Switch
                    checked={settings.hideBrowserUI}
                    onChange={handleToggleBrowserUI}
                    className={`
                        ${settings.hideBrowserUI ? 'bg-purple-600' : isLight ? 'bg-gray-200' : 'bg-gray-600'}
                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500
                        focus:ring-offset-2
                    `}
                >
                    <span className="sr-only">Hide browser UI during recording</span>
                    <span
                        className={`
                            ${settings.hideBrowserUI ? 'translate-x-5' : 'translate-x-0'}
                            pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow
                            ring-0 transition duration-200 ease-in-out
                        `}
                    />
                </Switch>
            </div>
        </div>
    );
}; 
import React from "react"
import { Button } from "./ui/Button"

interface RecordingInterfaceProps {
    isPaused: boolean
    clickCount: number
    duration: number
    onPauseResume: () => void
    onStop: () => void
    onCancel: () => void
}

export const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
    isPaused,
    clickCount,
    duration,
    onPauseResume,
    onStop,
    onCancel
}) => {
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    return (
        <div className="plasmo-fixed plasmo-top-4 plasmo-right-4 plasmo-bg-white dark:plasmo-bg-gray-800 plasmo-rounded-lg plasmo-shadow-lg plasmo-p-4 plasmo-w-64">
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-4">
                <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
                    <div className="plasmo-w-3 plasmo-h-3 plasmo-rounded-full plasmo-bg-red-500 plasmo-animate-pulse" />
                    <span className="plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 dark:plasmo-text-gray-300">
                        Recording
                    </span>
                </div>
                <span className="plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 dark:plasmo-text-gray-300">
                    {formatTime(duration)}
                </span>
            </div>

            <div className="plasmo-mb-4">
                <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-sm plasmo-text-gray-600 dark:plasmo-text-gray-400">
                    <svg
                        className="plasmo-w-4 plasmo-h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                    </svg>
                    <span>{clickCount} Clicks Recorded</span>
                </div>
            </div>

            <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
                <Button
                    onClick={onPauseResume}
                    variant="secondary"
                    size="sm"
                    className="plasmo-flex-1">
                    {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button onClick={onStop} variant="primary" size="sm" className="plasmo-flex-1">
                    Stop
                </Button>
                <Button
                    onClick={onCancel}
                    variant="danger"
                    size="sm"
                    className="plasmo-flex-1">
                    Cancel
                </Button>
            </div>

            <div className="plasmo-mt-4 plasmo-text-xs plasmo-text-gray-500 dark:plasmo-text-gray-400">
                <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
                    <span>Shortcuts:</span>
                    <kbd className="plasmo-px-2 plasmo-py-1 plasmo-bg-gray-100 dark:plasmo-bg-gray-700 plasmo-rounded">
                        Space
                    </kbd>
                    <span>to pause/resume</span>
                </div>
                <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mt-1">
                    <kbd className="plasmo-px-2 plasmo-py-1 plasmo-bg-gray-100 dark:plasmo-bg-gray-700 plasmo-rounded">
                        Esc
                    </kbd>
                    <span>to stop recording</span>
                </div>
            </div>
        </div>
    )
} 
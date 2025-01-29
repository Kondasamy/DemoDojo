import React from "react"
import { PauseIcon, PlayIcon, StopIcon, CheckIcon } from "@heroicons/react/24/outline"

interface RecordingInterfaceProps {
    state: "recording" | "paused"
    duration: number
    clickCount: number
    onPauseResume: () => void
    onStop: () => void
    onFinish: () => void
    isLight?: boolean
}

export const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
    state,
    duration,
    clickCount,
    onPauseResume,
    onStop,
    onFinish,
    isLight = true
}) => {
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`
    }

    const isPaused = state === "paused"

    return (
        <div className="plasmo-fixed plasmo-inset-0 plasmo-flex plasmo-items-center plasmo-justify-center">
            <div
                className={`plasmo-w-[360px] plasmo-space-y-4 plasmo-rounded-lg plasmo-p-4 plasmo-backdrop-blur plasmo-shadow-lg ${isLight
                    ? "plasmo-bg-white/90 plasmo-shadow-gray-200/50"
                    : "plasmo-bg-gray-900/90 plasmo-shadow-gray-900/50"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Recording Status */}
                <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
                    <div className="plasmo-flex plasmo-items-center plasmo-space-x-2">
                        <div className="plasmo-flex plasmo-h-3 plasmo-w-3 plasmo-items-center">
                            <div className={`
                                plasmo-h-3 plasmo-w-3 plasmo-rounded-full plasmo-shadow-sm
                                ${isPaused
                                    ? "plasmo-bg-amber-400 plasmo-animate-pulse"
                                    : "plasmo-bg-red-500 plasmo-animate-pulse"
                                }
                            `} />
                        </div>
                        <span className={`plasmo-text-sm plasmo-font-medium ${isLight ? "plasmo-text-gray-700" : "plasmo-text-gray-100"
                            }`}>
                            {isPaused ? "Recording Paused" : "Recording in Progress"}
                        </span>
                    </div>
                    <span className={`plasmo-text-sm ${isLight ? "plasmo-text-gray-600" : "plasmo-text-gray-200"
                        }`}>
                        {formatDuration(duration)}
                    </span>
                </div>

                {/* Click Counter */}
                <div className={`plasmo-rounded-md plasmo-p-2 plasmo-backdrop-blur-sm ${isLight
                    ? "plasmo-bg-gray-50"
                    : "plasmo-bg-gray-800"
                    }`}>
                    <p className={`plasmo-text-center plasmo-text-sm ${isLight ? "plasmo-text-gray-600" : "plasmo-text-gray-200"
                        }`}>
                        <span className="plasmo-font-bold">{clickCount}</span>{" "}
                        Clicks Recorded
                    </p>
                </div>

                {/* Control Buttons */}
                <div className="plasmo-grid plasmo-grid-cols-3 plasmo-gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onStop();
                        }}
                        onKeyDown={(e) => e.key === "Enter" && onStop()}
                        className={`
                            plasmo-flex plasmo-items-center plasmo-justify-center plasmo-space-x-2 plasmo-rounded-md plasmo-px-3 plasmo-py-2 
                            plasmo-text-sm plasmo-font-medium plasmo-transition-all plasmo-duration-200 plasmo-border
                            ${isLight
                                ? "plasmo-bg-red-50 plasmo-text-red-700 hover:plasmo-bg-red-100 plasmo-border-red-200"
                                : "plasmo-bg-red-500/10 plasmo-text-red-500 hover:plasmo-bg-red-500/20 plasmo-border-red-500/30"
                            }
                            focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-red-500 focus:plasmo-ring-offset-1
                        `}
                        tabIndex={0}
                        aria-label="Cancel Recording">
                        <StopIcon className="plasmo-h-5 plasmo-w-5" />
                        <span>Cancel</span>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPauseResume();
                        }}
                        onKeyDown={(e) => e.key === "Enter" && onPauseResume()}
                        className={`
                            plasmo-flex plasmo-items-center plasmo-justify-center plasmo-space-x-2 plasmo-rounded-md plasmo-px-3 plasmo-py-2 
                            plasmo-text-sm plasmo-font-medium plasmo-transition-all plasmo-duration-200 plasmo-border
                            ${isLight
                                ? "plasmo-bg-blue-50 plasmo-text-blue-700 hover:plasmo-bg-blue-100 plasmo-border-blue-200"
                                : "plasmo-bg-blue-500/10 plasmo-text-blue-500 hover:plasmo-bg-blue-500/20 plasmo-border-blue-500/30"
                            }
                            focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-ring-offset-1
                        `}
                        tabIndex={0}
                        aria-label={isPaused ? "Resume Recording" : "Pause Recording"}>
                        {isPaused ? (
                            <PlayIcon className="plasmo-h-5 plasmo-w-5" />
                        ) : (
                            <PauseIcon className="plasmo-h-5 plasmo-w-5" />
                        )}
                        <span>{isPaused ? "Resume" : "Pause"}</span>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFinish();
                        }}
                        onKeyDown={(e) => e.key === "Enter" && onFinish()}
                        className={`
                            plasmo-flex plasmo-items-center plasmo-justify-center plasmo-space-x-2 plasmo-rounded-md plasmo-px-3 plasmo-py-2 
                            plasmo-text-sm plasmo-font-medium plasmo-text-white plasmo-transition-all plasmo-duration-200
                            plasmo-bg-green-500 hover:plasmo-bg-green-600
                            focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-green-500 focus:plasmo-ring-offset-1
                        `}
                        tabIndex={0}
                        aria-label="Finish Recording">
                        <CheckIcon className="plasmo-h-5 plasmo-w-5" />
                        <span>Finish</span>
                    </button>
                </div>

                {/* Keyboard Shortcuts */}
                <div className={`plasmo-mt-4 plasmo-text-xs ${isLight ? "plasmo-text-gray-500" : "plasmo-text-gray-400"
                    }`}>
                    <p className="plasmo-text-center">
                        Press{" "}
                        <kbd className={`plasmo-rounded-md plasmo-border plasmo-px-2 plasmo-py-0.5 ${isLight
                            ? "plasmo-border-gray-200 plasmo-bg-gray-50"
                            : "plasmo-border-gray-700 plasmo-bg-gray-800"
                            }`}>
                            Space
                        </kbd>{" "}
                        to pause/resume,{" "}
                        <kbd className={`plasmo-rounded-md plasmo-border plasmo-px-2 plasmo-py-0.5 ${isLight
                            ? "plasmo-border-gray-200 plasmo-bg-gray-50"
                            : "plasmo-border-gray-700 plasmo-bg-gray-800"
                            }`}>
                            Esc
                        </kbd>{" "}
                        to stop
                    </p>
                </div>
            </div>
        </div>
    )
} 
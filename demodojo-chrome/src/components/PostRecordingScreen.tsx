import React from "react"
import { Button } from "./ui/Button"

interface PostRecordingScreenProps {
    videoUrl: string
    onEdit: () => void
    onRestart: () => void
    onSave: () => void
}

export const PostRecordingScreen: React.FC<PostRecordingScreenProps> = ({
    videoUrl,
    onEdit,
    onRestart,
    onSave
}) => {
    return (
        <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-p-6 plasmo-min-w-[400px] plasmo-min-h-[300px] plasmo-bg-white dark:plasmo-bg-gray-900">
            <h2 className="plasmo-text-xl plasmo-font-bold plasmo-mb-4 plasmo-text-gray-900 dark:plasmo-text-white">
                Recording Complete!
            </h2>

            <div className="plasmo-w-full plasmo-aspect-video plasmo-mb-6 plasmo-rounded-lg plasmo-overflow-hidden plasmo-bg-gray-100 dark:plasmo-bg-gray-800">
                <video
                    src={videoUrl}
                    controls
                    className="plasmo-w-full plasmo-h-full"
                    autoPlay
                    muted
                />
            </div>

            <div className="plasmo-flex plasmo-items-center plasmo-gap-4">
                <Button
                    onClick={onEdit}
                    variant="secondary"
                    className="plasmo-flex plasmo-items-center plasmo-gap-2">
                    <svg
                        className="plasmo-w-4 plasmo-h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                    </svg>
                    Edit
                </Button>

                <Button
                    onClick={onRestart}
                    variant="secondary"
                    className="plasmo-flex plasmo-items-center plasmo-gap-2">
                    <svg
                        className="plasmo-w-4 plasmo-h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Record Again
                </Button>

                <Button
                    onClick={onSave}
                    variant="primary"
                    className="plasmo-flex plasmo-items-center plasmo-gap-2">
                    <svg
                        className="plasmo-w-4 plasmo-h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                    </svg>
                    Save
                </Button>
            </div>
        </div>
    )
} 
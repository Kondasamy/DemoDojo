import React from "react"
import { ArrowPathIcon, PencilIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"

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
        <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-p-6 plasmo-min-w-[400px] plasmo-min-h-[300px] plasmo-bg-white/90 dark:plasmo-bg-gray-900/90">
            <h2 className="plasmo-text-xl plasmo-font-bold plasmo-mb-4 plasmo-text-gray-900 dark:plasmo-text-white">
                Recording Complete!
            </h2>

            <div className="plasmo-w-full plasmo-aspect-video plasmo-mb-6 plasmo-rounded-lg plasmo-overflow-hidden plasmo-bg-gray-50 dark:plasmo-bg-gray-800 plasmo-shadow-lg">
                <video
                    src={videoUrl}
                    controls
                    className="plasmo-w-full plasmo-h-full"
                    autoPlay
                    muted
                />
            </div>

            <div className="plasmo-grid plasmo-grid-cols-3 plasmo-gap-2">
                <button
                    onClick={onRestart}
                    className={`
                        plasmo-flex plasmo-items-center plasmo-justify-center plasmo-space-x-2 plasmo-rounded-md plasmo-px-3 plasmo-py-2 
                        plasmo-text-sm plasmo-font-medium plasmo-transition-all plasmo-duration-200
                        plasmo-bg-blue-100 plasmo-text-blue-700 hover:plasmo-bg-blue-200 dark:plasmo-bg-blue-500 dark:plasmo-text-white dark:hover:plasmo-bg-blue-600
                        focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-blue-500 focus:plasmo-ring-offset-1
                    `}>
                    <ArrowPathIcon className="plasmo-h-5 plasmo-w-5" />
                    <span>Restart</span>
                </button>

                <button
                    onClick={onEdit}
                    className={`
                        plasmo-flex plasmo-items-center plasmo-justify-center plasmo-space-x-2 plasmo-rounded-md plasmo-px-3 plasmo-py-2 
                        plasmo-text-sm plasmo-font-medium plasmo-text-white plasmo-transition-all plasmo-duration-200
                        plasmo-bg-purple-500 hover:plasmo-bg-purple-600
                        focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-purple-500 focus:plasmo-ring-offset-1
                    `}>
                    <PencilIcon className="plasmo-h-5 plasmo-w-5" />
                    <span>Edit</span>
                </button>

                <button
                    onClick={onSave}
                    className={`
                        plasmo-flex plasmo-items-center plasmo-justify-center plasmo-space-x-2 plasmo-rounded-md plasmo-px-3 plasmo-py-2 
                        plasmo-text-sm plasmo-font-medium plasmo-text-white plasmo-transition-all plasmo-duration-200
                        plasmo-bg-green-500 hover:plasmo-bg-green-600
                        focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-green-500 focus:plasmo-ring-offset-1
                    `}>
                    <ArrowDownTrayIcon className="plasmo-h-5 plasmo-w-5" />
                    <span>Save</span>
                </button>
            </div>
        </div>
    )
} 
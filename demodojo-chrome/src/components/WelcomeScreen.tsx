import React from "react"
import { Button } from "./ui/Button"
import logo from "data-base64:~assets/icon.png"

interface WelcomeScreenProps {
    onStartRecording: () => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartRecording }) => {
    return (
        <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-p-6 plasmo-min-w-[400px] plasmo-min-h-[300px] plasmo-bg-white dark:plasmo-bg-gray-900">
            <div className="plasmo-mb-8">
                <img
                    src={logo}
                    alt="DemoDojo Logo"
                    className="plasmo-w-24 plasmo-h-24"
                />
            </div>
            <h1 className="plasmo-text-2xl plasmo-font-bold plasmo-mb-4 plasmo-text-gray-900 dark:plasmo-text-white">
                Welcome to DemoDojo
            </h1>
            <p className="plasmo-text-gray-600 dark:plasmo-text-gray-300 plasmo-mb-8 plasmo-text-center">
                Create beautiful screen recordings with just a few clicks
            </p>
            <Button
                onClick={onStartRecording}
                className="plasmo-bg-purple-600 plasmo-text-white plasmo-px-6 plasmo-py-3 plasmo-rounded-lg plasmo-flex plasmo-items-center plasmo-gap-2 hover:plasmo-bg-purple-700 focus:plasmo-ring-2 focus:plasmo-ring-purple-500 focus:plasmo-ring-offset-2">
                <svg
                    className="plasmo-w-5 plasmo-h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                </svg>
                Start Recording
            </Button>
        </div>
    )
} 
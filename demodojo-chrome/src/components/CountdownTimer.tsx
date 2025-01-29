import React, { useEffect, useState } from "react"

interface CountdownTimerProps {
    duration?: number // in seconds
    onComplete: () => void
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
    duration = 3,
    onComplete
}) => {
    const [count, setCount] = useState(duration)

    useEffect(() => {
        if (count === 0) {
            onComplete()
            return
        }

        const timer = setTimeout(() => {
            setCount((prev) => prev - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [count, onComplete])

    return (
        <div className="plasmo-fixed plasmo-inset-0 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-bg-black/50 plasmo-z-50">
            <div className="plasmo-bg-white dark:plasmo-bg-gray-800 plasmo-rounded-full plasmo-w-32 plasmo-h-32 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-shadow-lg">
                <span className="plasmo-text-6xl plasmo-font-bold plasmo-text-purple-600 dark:plasmo-text-purple-400">
                    {count}
                </span>
            </div>
        </div>
    )
} 
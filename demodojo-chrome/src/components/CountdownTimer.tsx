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
        console.log("[DemoDojo] Starting countdown from", duration)

        const timer = setTimeout(() => {
            if (count <= 1) {
                console.log("[DemoDojo] Countdown complete, triggering onComplete")
                setCount(0)
                onComplete()
                return
            }

            console.log("[DemoDojo] Countdown tick:", count - 1)
            setCount(count - 1)
        }, 1000)

        return () => {
            console.log("[DemoDojo] Cleaning up countdown timer")
            clearTimeout(timer)
        }
    }, [count, onComplete, duration])

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
import { useState, useEffect, useCallback } from "react"
import { sendToBackground } from "@plasmohq/messaging"

type RecordingState = "idle" | "selecting" | "countdown" | "recording" | "paused" | "completed"

export function useRecording() {
    const [state, setState] = useState<RecordingState>("idle")
    const [clickCount, setClickCount] = useState(0)
    const [duration, setDuration] = useState(0)
    const [videoUrl, setVideoUrl] = useState<string>("")
    const [stream, setStream] = useState<MediaStream | null>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (state === "recording") {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1)
            }, 1000)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [state])

    const startScreenSelection = useCallback(async () => {
        try {
            setState("selecting")
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            })
            setStream(mediaStream)
            setState("countdown")
        } catch (error) {
            console.error("Failed to get screen:", error)
            setState("idle")
        }
    }, [])

    const startRecording = useCallback(async () => {
        if (!stream) {
            setState("idle")
            return
        }

        try {
            const track = stream.getVideoTracks()[0]
            const sourceId = track.getSettings().deviceId

            const response = await sendToBackground({
                name: "recording",
                body: {
                    type: "START_RECORDING",
                    data: {
                        sourceId,
                        audio: true,
                        tabId: await getCurrentTabId()
                    }
                }
            })

            if (response.success) {
                setState("recording")
            } else {
                throw new Error(response.error)
            }
        } catch (error) {
            console.error("Failed to start recording:", error)
            setState("idle")
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
                setStream(null)
            }
        }
    }, [stream])

    const stopRecording = useCallback(async () => {
        try {
            const response = await sendToBackground({
                name: "recording",
                body: {
                    type: "STOP_RECORDING"
                }
            })

            if (response.success) {
                setState("completed")
                if (response.url) setVideoUrl(response.url)
            } else {
                throw new Error(response.error)
            }
        } catch (error) {
            console.error("Failed to stop recording:", error)
        } finally {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
                setStream(null)
            }
        }
    }, [stream])

    const pauseRecording = useCallback(async () => {
        try {
            const response = await sendToBackground({
                name: "recording",
                body: {
                    type: "PAUSE_RECORDING"
                }
            })

            if (response.success) {
                setState("paused")
            } else {
                throw new Error(response.error)
            }
        } catch (error) {
            console.error("Failed to pause recording:", error)
        }
    }, [])

    const resumeRecording = useCallback(async () => {
        try {
            const response = await sendToBackground({
                name: "recording",
                body: {
                    type: "RESUME_RECORDING"
                }
            })

            if (response.success) {
                setState("recording")
            } else {
                throw new Error(response.error)
            }
        } catch (error) {
            console.error("Failed to resume recording:", error)
        }
    }, [])

    const reset = useCallback(() => {
        setState("idle")
        setClickCount(0)
        setDuration(0)
        setVideoUrl("")
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }, [stream])

    return {
        state,
        clickCount,
        duration,
        videoUrl,
        startScreenSelection,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        reset
    }
}

async function getCurrentTabId(): Promise<number> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return tab.id
} 
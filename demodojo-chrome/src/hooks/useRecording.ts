import { useState, useEffect, useCallback } from "react"
import { sendToBackground } from "@plasmohq/messaging"

type RecordingState = "idle" | "selecting" | "countdown" | "recording" | "paused" | "completed"

// Setup logging
const log = {
    debug: (...args: any[]) => console.debug("[DemoDojo:Hook]", ...args),
    info: (...args: any[]) => console.info("[DemoDojo:Hook]", ...args),
    warn: (...args: any[]) => console.warn("[DemoDojo:Hook]", ...args),
    error: (...args: any[]) => console.error("[DemoDojo:Hook]", ...args)
}

const getCurrentTabId = async (): Promise<number> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return tab?.id
}

export function useRecording() {
    const [state, setState] = useState<RecordingState>("idle")
    const [clickCount, setClickCount] = useState(0)
    const [duration, setDuration] = useState(0)
    const [videoUrl, setVideoUrl] = useState<string>("")
    const [stream, setStream] = useState<MediaStream | null>(null)

    // Log state changes
    useEffect(() => {
        log.info("Recording state changed:", state)
    }, [state])

    // Handle tab visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            log.debug("Tab visibility changed:", document.visibilityState)
            if (document.visibilityState === "visible" && state === "recording") {
                log.info("Tab visible, re-rendering recording interface")
                setState("paused")
                setTimeout(() => setState("recording"), 0)
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [state])

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (state === "recording") {
            console.log("[DemoDojo] Starting duration timer")
            interval = setInterval(() => {
                setDuration((prev) => prev + 1)
            }, 1000)
        }

        return () => {
            if (interval) {
                console.log("[DemoDojo] Cleaning up duration timer")
                clearInterval(interval)
            }
        }
    }, [state])

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

    const startScreenSelection = useCallback(async () => {
        try {
            log.info("Starting screen selection")
            setState("selecting")

            // Request screen share with optimized settings
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })

            log.info("Screen selected successfully")

            // Validate stream
            if (!mediaStream || !mediaStream.getVideoTracks()[0]) {
                throw new Error("No video track available")
            }

            // Configure video track to prevent stopping on clicks
            const videoTrack = mediaStream.getVideoTracks()[0]
            videoTrack.contentHint = "motion"
            videoTrack.enabled = true

            // Keep track of whether we initiated the stop
            let isStoppingIntentionally = false

            // Handle track ending
            videoTrack.addEventListener('ended', (event) => {
                log.info("Track ended event received", { isStoppingIntentionally })
                if (!isStoppingIntentionally) {
                    // If we didn't initiate the stop, try to restart the track
                    event.preventDefault()
                    event.stopPropagation()
                    log.info("Attempting to prevent unintended track stop")
                    return
                }
                stopRecording()
            })

            // Override the stop method
            const originalStop = videoTrack.stop.bind(videoTrack)
            videoTrack.stop = function customStop() {
                log.info("Stop called on video track")
                // Only allow stop if we're intentionally stopping
                if (isStoppingIntentionally) {
                    originalStop()
                } else {
                    log.info("Prevented unintended track stop")
                }
            }

            setStream(mediaStream)

            // Get current tab ID before starting recording
            const tabId = await getCurrentTabId()
            if (!tabId) {
                throw new Error("Could not get current tab ID")
            }

            log.info("Starting recording with tabId:", tabId)

            // Create MediaRecorder instance
            const mediaRecorder = new MediaRecorder(mediaStream, {
                mimeType: "video/webm;codecs=vp9"
            })

            let recordedChunks: Blob[] = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                log.info("Recording stopped, creating blob")
                const blob = new Blob(recordedChunks, { type: "video/webm" })
                const url = URL.createObjectURL(blob)
                setVideoUrl(url)
                setState("completed")
            }

            // Start recording
            mediaRecorder.start(1000) // Record in 1-second chunks
            log.info("Recording started successfully")
            setState("recording")

            // Store mediaRecorder and control flag in stream object
            // @ts-ignore - Adding custom properties to stream
            mediaStream.recorder = mediaRecorder
            // @ts-ignore - Adding custom properties to stream
            mediaStream.setStoppingIntentionally = (value: boolean) => {
                isStoppingIntentionally = value
            }

        } catch (error) {
            log.error("Failed to get screen or start recording:", error)
            setState("idle")
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
                setStream(null)
            }
        }
    }, [reset])

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
            if (stream) {
                // Set the flag to indicate this is an intentional stop
                // @ts-ignore - Accessing custom property
                stream.setStoppingIntentionally(true)

                // @ts-ignore - Accessing stored mediaRecorder
                const mediaRecorder = stream.recorder
                if (mediaRecorder && mediaRecorder.state !== "inactive") {
                    mediaRecorder.stop()
                }
                stream.getTracks().forEach(track => track.stop())
                setStream(null)
            }
        } catch (error) {
            log.error("Failed to stop recording:", error)
            setState("idle")
        }
    }, [stream])

    const pauseRecording = useCallback(async () => {
        try {
            if (stream) {
                // @ts-ignore - Accessing stored mediaRecorder
                const mediaRecorder = stream.recorder
                if (mediaRecorder && mediaRecorder.state === "recording") {
                    mediaRecorder.pause()
                    setState("paused")
                }
            }
        } catch (error) {
            log.error("Failed to pause recording:", error)
        }
    }, [stream])

    const resumeRecording = useCallback(async () => {
        try {
            if (stream) {
                // @ts-ignore - Accessing stored mediaRecorder
                const mediaRecorder = stream.recorder
                if (mediaRecorder && mediaRecorder.state === "paused") {
                    mediaRecorder.resume()
                    setState("recording")
                }
            }
        } catch (error) {
            log.error("Failed to resume recording:", error)
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
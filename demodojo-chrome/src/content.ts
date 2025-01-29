import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"

// Enable logging for development
const isDev = process.env.NODE_ENV === "development"

// Setup logging
const log = {
    debug: (...args: any[]) => isDev && console.debug("[DemoDojo:Content]", ...args),
    info: (...args: any[]) => isDev && console.info("[DemoDojo:Content]", ...args),
    warn: (...args: any[]) => isDev && console.warn("[DemoDojo:Content]", ...args),
    error: (...args: any[]) => isDev && console.error("[DemoDojo:Content]", ...args)
}

// Track recording state
let isRecording = false
let isPaused = false

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log.debug("Received message:", message)

    try {
        switch (message.type) {
            case "START_RECORDING":
                isRecording = true
                isPaused = false
                log.info("Started click tracking")
                sendResponse({ success: true })
                break

            case "STOP_RECORDING":
                isRecording = false
                isPaused = false
                log.info("Stopped click tracking")
                sendResponse({ success: true })
                break

            case "PAUSE_RECORDING":
                isPaused = true
                log.info("Paused click tracking")
                sendResponse({ success: true })
                break

            case "RESUME_RECORDING":
                isPaused = false
                log.info("Resumed click tracking")
                sendResponse({ success: true })
                break

            default:
                log.warn("Unknown message type:", message.type)
                sendResponse({ success: false, error: "Unknown message type" })
        }
    } catch (error) {
        log.error("Error handling message:", error)
        sendResponse({ success: false, error: error.message })
    }

    return true // Keep the message channel open for async responses
})

// Track clicks
document.addEventListener("click", async (event) => {
    if (!isRecording || isPaused) return

    try {
        const target = event.target as HTMLElement
        log.debug("Click detected:", {
            x: event.clientX,
            y: event.clientY,
            element: target.tagName,
            id: target.id,
            className: target.className
        })

        // Send click event to background
        const response = await sendToBackground({
            name: "recording",
            body: {
                type: "UPDATE_CLICK_COUNT",
                data: {
                    x: event.clientX,
                    y: event.clientY,
                    element: target.tagName,
                    id: target.id,
                    className: target.className
                }
            }
        })

        if (!response.success) {
            throw new Error(response.error)
        }

        log.debug("Click recorded successfully")
    } catch (error) {
        log.error("Failed to record click:", error)
    }
}, true)

// Track keyboard shortcuts
document.addEventListener("keydown", async (event) => {
    if (!isRecording) return

    // Prevent handling shortcuts in input elements
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement) {
        return
    }

    try {
        // Space to pause/resume
        if (event.code === "Space" && !event.repeat) {
            event.preventDefault()
            const response = await sendToBackground({
                name: "recording",
                body: {
                    type: isPaused ? "RESUME_RECORDING" : "PAUSE_RECORDING"
                }
            })

            if (!response.success) {
                throw new Error(response.error)
            }

            isPaused = !isPaused
            log.info(`Recording ${isPaused ? "paused" : "resumed"} via keyboard shortcut`)
        }

        // Escape to stop
        if (event.code === "Escape" && !event.repeat) {
            event.preventDefault()
            const response = await sendToBackground({
                name: "recording",
                body: {
                    type: "STOP_RECORDING"
                }
            })

            if (!response.success) {
                throw new Error(response.error)
            }

            isRecording = false
            isPaused = false
            log.info("Recording stopped via keyboard shortcut")
        }
    } catch (error) {
        log.error("Failed to handle keyboard shortcut:", error)
    }
}, true)

// Export Plasmo configuration
export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    all_frames: true
}

import type { PlasmoMessaging } from "@plasmohq/messaging"

// Enable logging for development
const isDev = process.env.NODE_ENV === "development"

// Setup logging
const log = {
    debug: (...args: any[]) => isDev && console.debug("[DemoDojo:BG]", ...args),
    info: (...args: any[]) => isDev && console.info("[DemoDojo:BG]", ...args),
    warn: (...args: any[]) => isDev && console.warn("[DemoDojo:BG]", ...args),
    error: (...args: any[]) => isDev && console.error("[DemoDojo:BG]", ...args)
}

let mediaRecorder: MediaRecorder = null
let recordedChunks: Blob[] = []
let stream: MediaStream = null
let clickCount = 0
let recordingTabId: number = null

// Handler for recording messages
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const { type, data } = req.body
    log.debug("Received recording message:", { type, data })

    try {
        switch (type) {
            case "START_RECORDING":
                log.info("Starting recording with data:", data)
                const { sourceId, audio, tabId } = data

                if (!sourceId) {
                    throw new Error("No sourceId provided")
                }

                stream = await navigator.mediaDevices.getUserMedia({
                    audio: audio ? {
                        //@ts-ignore
                        mandatory: {
                            chromeMediaSource: "desktop"
                        }
                    } : false,
                    video: {
                        //@ts-ignore
                        mandatory: {
                            chromeMediaSource: "desktop",
                            chromeMediaSourceId: sourceId
                        }
                    }
                })

                log.info("Media stream obtained successfully")

                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: "video/webm;codecs=vp9"
                })

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data)
                    }
                }

                mediaRecorder.onstop = () => {
                    log.info("Recording stopped, creating blob")
                    const blob = new Blob(recordedChunks, { type: "video/webm" })
                    const url = URL.createObjectURL(blob)
                    res.send({ success: true, url })
                }

                recordingTabId = tabId
                mediaRecorder.start(1000) // Record in 1-second chunks
                log.info("Recording started successfully")
                return res.send({ success: true })

            case "STOP_RECORDING":
                if (mediaRecorder && mediaRecorder.state !== "inactive") {
                    mediaRecorder.stop()
                    stream.getTracks().forEach((track) => track.stop())
                    recordedChunks = []
                    clickCount = 0
                    recordingTabId = null
                }
                return res.send({ success: true })

            case "PAUSE_RECORDING":
                if (mediaRecorder && mediaRecorder.state === "recording") {
                    mediaRecorder.pause()
                    return res.send({ success: true })
                }
                return res.send({ success: false, error: "Not recording" })

            case "RESUME_RECORDING":
                if (mediaRecorder && mediaRecorder.state === "paused") {
                    mediaRecorder.resume()
                    return res.send({ success: true })
                }
                return res.send({ success: false, error: "Not paused" })

            default:
                return res.send({ success: false, error: "Unknown command" })
        }
    } catch (error) {
        log.error("Error handling recording message:", error)
        return res.send({ success: false, error: error.message })
    }
}

// Export the handler for Plasmo messaging
export default handler

log.info("Background service worker initialized")

// Listen for runtime messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log.debug("Received message:", message, "from:", sender)
}) 

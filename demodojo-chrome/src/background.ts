import type { PlasmoMessaging } from "@plasmohq/messaging"

let mediaRecorder: MediaRecorder = null
let recordedChunks: Blob[] = []
let stream: MediaStream = null
let clickCount = 0
let recordingTabId: number = null

export const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const { type, data } = req.body

    switch (type) {
        case "START_RECORDING":
            try {
                const { sourceId, audio } = data
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

                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: "video/webm;codecs=vp9"
                })

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data)
                    }
                }

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: "video/webm" })
                    const url = URL.createObjectURL(blob)
                    res.send({ success: true, url })
                }

                recordingTabId = data.tabId
                mediaRecorder.start()
                res.send({ success: true })
            } catch (error) {
                res.send({ success: false, error: error.message })
            }
            break

        case "STOP_RECORDING":
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop()
                stream.getTracks().forEach((track) => track.stop())
                recordedChunks = []
                clickCount = 0
                recordingTabId = null
            }
            res.send({ success: true })
            break

        case "PAUSE_RECORDING":
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.pause()
                res.send({ success: true })
            } else {
                res.send({ success: false, error: "Not recording" })
            }
            break

        case "RESUME_RECORDING":
            if (mediaRecorder && mediaRecorder.state === "paused") {
                mediaRecorder.resume()
                res.send({ success: true })
            } else {
                res.send({ success: false, error: "Not paused" })
            }
            break

        case "UPDATE_CLICK_COUNT":
            clickCount++
            res.send({ success: true, clickCount })
            break

        default:
            res.send({ success: false, error: "Unknown command" })
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_CLICK_COUNT") {
        sendResponse({ clickCount })
        return true
    }
}) 

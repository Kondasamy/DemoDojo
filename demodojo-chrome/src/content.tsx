import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import React from "react"
import { RecordingInterface } from "./components/RecordingInterface"

// Export config for content script
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

let isRecording = false
let clickCount = 0
let duration = 0

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "START_RECORDING":
      isRecording = true
      sendResponse({ success: true })
      break

    case "STOP_RECORDING":
      isRecording = false
      clickCount = 0
      duration = 0
      sendResponse({ success: true })
      break

    case "PAUSE_RECORDING":
      isRecording = false
      sendResponse({ success: true })
      break

    case "RESUME_RECORDING":
      isRecording = true
      sendResponse({ success: true })
      break
  }
  return true
})

document.addEventListener("click", () => {
  if (isRecording) {
    clickCount++
    chrome.runtime.sendMessage({ type: "UPDATE_CLICK_COUNT" })
  }
})

// Handle keyboard shortcuts
document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (!isRecording) return

  if (event.code === "Space" && !event.repeat) {
    event.preventDefault()
    chrome.runtime.sendMessage({ type: "PAUSE_RECORDING" })
  } else if (event.code === "Escape" && !event.repeat) {
    event.preventDefault()
    chrome.runtime.sendMessage({ type: "STOP_RECORDING" })
  }
})

const PlasmoOverlay = () => {
  return (
    <div className="plasmo-fixed plasmo-top-4 plasmo-right-4 plasmo-z-50">
      {isRecording && (
        <RecordingInterface
          state={isRecording ? "recording" : "paused"}
          duration={duration}
          clickCount={clickCount}
          onPauseResume={() => chrome.runtime.sendMessage({ type: isRecording ? "PAUSE_RECORDING" : "RESUME_RECORDING" })}
          onStop={() => chrome.runtime.sendMessage({ type: "STOP_RECORDING" })}
          onFinish={() => chrome.runtime.sendMessage({ type: "STOP_RECORDING" })}
          isLight={true}
        />
      )}
    </div>
  )
}

export default PlasmoOverlay

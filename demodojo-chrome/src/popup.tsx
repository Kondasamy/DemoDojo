import React from "react"
import { WelcomeScreen } from "./components/WelcomeScreen"
import { CountdownTimer } from "./components/CountdownTimer"
import { RecordingInterface } from "./components/RecordingInterface"
import { PostRecordingScreen } from "./components/PostRecordingScreen"
import { useRecording } from "./hooks/useRecording"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "~style.css"

function IndexPopup() {
  const {
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
  } = useRecording()

  const handleStartRecording = () => {
    try {
      startScreenSelection()
    } catch (error) {
      toast.error("Failed to start screen selection")
    }
  }

  const handleCountdownComplete = () => {
    startRecording()
  }

  const handlePauseResume = () => {
    if (state === "paused") {
      resumeRecording()
    } else {
      pauseRecording()
    }
  }

  const handleStop = () => {
    stopRecording()
  }

  const handleEdit = () => {
    toast.info("Edit functionality coming soon!")
  }

  const handleSave = () => {
    const a = document.createElement("a")
    a.href = videoUrl
    a.download = `recording-${new Date().toISOString()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success("Recording saved!")
  }

  return (
    <div className="plasmo-w-[400px] plasmo-min-h-[300px] plasmo-bg-gradient-to-br plasmo-from-white plasmo-to-gray-50 dark:plasmo-from-gray-900 dark:plasmo-to-gray-800 plasmo-rounded-xl plasmo-shadow-lg plasmo-backdrop-blur-sm plasmo-bg-opacity-95 dark:plasmo-bg-opacity-90 plasmo-p-4">
      {state === "idle" && (
        <WelcomeScreen onStartRecording={startScreenSelection} />
      )}

      {state === "countdown" && (
        <CountdownTimer onComplete={handleCountdownComplete} />
      )}

      {(state === "recording" || state === "paused") && (
        <RecordingInterface
          state={state}
          duration={duration}
          clickCount={clickCount}
          onPauseResume={handlePauseResume}
          onStop={stopRecording}
          onFinish={stopRecording}
          isLight={true}
        />
      )}

      {state === "completed" && videoUrl && (
        <PostRecordingScreen
          videoUrl={videoUrl}
          onEdit={handleEdit}
          onRestart={reset}
          onSave={handleSave}
        />
      )}

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default IndexPopup

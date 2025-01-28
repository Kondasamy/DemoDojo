interface RecordingSettings {
    audio: boolean;
    hideBrowserUI: boolean;
    microphone: MediaDeviceInfo | null;
}

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let clickCount = 0;
let stream: MediaStream | null = null;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.type) {
        case 'START_RECORDING':
            handleStartRecording(message.settings, message.streamId)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep the message channel open for async response

        case 'PAUSE_RECORDING':
            if (mediaRecorder?.state === 'recording') {
                mediaRecorder.pause();
                sendResponse({ success: true });
            }
            break;

        case 'RESUME_RECORDING':
            if (mediaRecorder?.state === 'paused') {
                mediaRecorder.resume();
                sendResponse({ success: true });
            }
            break;

        case 'STOP_RECORDING':
            handleStopRecording()
                .then(videoUrl => sendResponse({ success: true, videoUrl }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep the message channel open for async response
    }
});

// Track clicks
document.addEventListener('click', () => {
    if (mediaRecorder?.state === 'recording') {
        clickCount++;
        // Send click count update to popup
        chrome.runtime.sendMessage({
            type: 'UPDATE_CLICK_COUNT',
            count: clickCount
        });
    }
});

async function handleStartRecording(settings: RecordingSettings, streamId: string) {
    try {
        // Set up screen capture
        const screenStream = await (navigator.mediaDevices as any).getUserMedia({
            video: {
                // Using any type here because Chrome's desktop capture API is not standard
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId
            }
        });

        // Set up audio if enabled
        let audioStream: MediaStream | null = null;
        if (settings.audio && settings.microphone?.deviceId) {
            audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: settings.microphone.deviceId
                }
            });
        }

        // Combine streams if needed
        const tracks = [...screenStream.getTracks()];
        if (audioStream) {
            tracks.push(...audioStream.getAudioTracks());
        }

        stream = new MediaStream(tracks);

        // Initialize MediaRecorder
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Reset click counter
        clickCount = 0;

        // Start recording
        mediaRecorder.start(1000); // Collect data every second

        // Hide browser UI if requested
        if (settings.hideBrowserUI) {
            document.documentElement.requestFullscreen();
        }
    } catch (error) {
        console.error('Failed to start recording:', error);
        throw error;
    }
}

async function handleStopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
            reject(new Error('No recording in progress'));
            return;
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            // Clean up
            recordedChunks = [];
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            mediaRecorder = null;
            clickCount = 0;

            // Exit fullscreen if needed
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }

            resolve(url);
        };

        mediaRecorder.stop();
    });
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (!mediaRecorder) return;

    if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
            chrome.runtime.sendMessage({ type: 'RECORDING_PAUSED' });
        } else if (mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
            chrome.runtime.sendMessage({ type: 'RECORDING_RESUMED' });
        }
    } else if (event.code === 'Escape' && !event.repeat) {
        event.preventDefault();
        handleStopRecording()
            .then(videoUrl => {
                chrome.runtime.sendMessage({
                    type: 'RECORDING_STOPPED',
                    videoUrl
                });
            })
            .catch(console.error);
    }
}); 
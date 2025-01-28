console.log('[DemoDojo] Content script loaded');

type RecordingSettings = {
    audio: boolean;
    hideBrowserUI: boolean;
    microphone: MediaDeviceInfo | null;
};

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let clickCount = 0;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('[DemoDojo] Content script received message:', message);

    if (message.type === 'START_RECORDING') {
        console.log('[DemoDojo] Starting recording with settings:', message.settings);
        console.log('[DemoDojo] Stream ID:', message.streamId);

        startRecording(message.streamId, message.settings)
            .then(() => {
                console.log('[DemoDojo] Recording started successfully');
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('[DemoDojo] Failed to start recording:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep the message channel open for the async response
    }

    if (message.type === 'STOP_RECORDING') {
        console.log('[DemoDojo] Stopping recording');
        stopRecording()
            .then((videoUrl) => {
                console.log('[DemoDojo] Recording stopped, video URL created');
                sendResponse({ success: true, videoUrl });
            })
            .catch((error) => {
                console.error('[DemoDojo] Failed to stop recording:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }

    if (message.type === 'PAUSE_RECORDING') {
        console.log('[DemoDojo] Pausing recording');
        if (mediaRecorder?.state === 'recording') {
            mediaRecorder.pause();
            sendResponse({ success: true });
        } else {
            console.warn('[DemoDojo] Cannot pause - recorder state:', mediaRecorder?.state);
            sendResponse({ success: false, error: 'Recorder not in recording state' });
        }
        return true;
    }

    if (message.type === 'RESUME_RECORDING') {
        console.log('[DemoDojo] Resuming recording');
        if (mediaRecorder?.state === 'paused') {
            mediaRecorder.resume();
            sendResponse({ success: true });
        } else {
            console.warn('[DemoDojo] Cannot resume - recorder state:', mediaRecorder?.state);
            sendResponse({ success: false, error: 'Recorder not in paused state' });
        }
        return true;
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

async function startRecording(streamId: string, settings: RecordingSettings) {
    try {
        console.log('[DemoDojo] Getting media stream with ID:', streamId);

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: settings.audio ? {
                deviceId: settings.microphone?.deviceId
            } : false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: streamId,
                }
            } as any
        });

        console.log('[DemoDojo] Media stream obtained:', stream.getTracks().map(t => ({
            kind: t.kind,
            label: t.label,
            enabled: t.enabled,
            state: t.readyState
        })));

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        console.log('[DemoDojo] MediaRecorder created with state:', mediaRecorder.state);

        mediaRecorder.ondataavailable = (event) => {
            console.log('[DemoDojo] Data available event, size:', event.data.size);
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstart = () => {
            console.log('[DemoDojo] MediaRecorder started');
        };

        mediaRecorder.onpause = () => {
            console.log('[DemoDojo] MediaRecorder paused');
        };

        mediaRecorder.onresume = () => {
            console.log('[DemoDojo] MediaRecorder resumed');
        };

        mediaRecorder.onstop = () => {
            console.log('[DemoDojo] MediaRecorder stopped');
            stream.getTracks().forEach(track => {
                console.log('[DemoDojo] Stopping track:', track.kind, track.label);
                track.stop();
            });
        };

        mediaRecorder.onerror = (event) => {
            console.error('[DemoDojo] MediaRecorder error:', event);
        };

        mediaRecorder.start(1000); // Collect data every second

        // Hide browser UI if requested
        if (settings.hideBrowserUI) {
            document.documentElement.requestFullscreen();
        }

        return true;
    } catch (error) {
        console.error('[DemoDojo] Error in startRecording:', error);
        throw error;
    }
}

async function stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log('[DemoDojo] Stopping recording, recorder state:', mediaRecorder?.state);

        if (!mediaRecorder) {
            const error = 'No MediaRecorder instance found';
            console.error('[DemoDojo]', error);
            reject(new Error(error));
            return;
        }

        mediaRecorder.onstop = () => {
            try {
                console.log('[DemoDojo] Creating blob from chunks:', recordedChunks.length);
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                console.log('[DemoDojo] Blob URL created:', url);
                resolve(url);
            } catch (error) {
                console.error('[DemoDojo] Error creating blob:', error);
                reject(error);
            }
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
        stopRecording()
            .then(videoUrl => {
                chrome.runtime.sendMessage({
                    type: 'RECORDING_STOPPED',
                    videoUrl
                });
            })
            .catch(console.error);
    }
});

// Log any unhandled errors
window.addEventListener('error', (event) => {
    console.error('[DemoDojo] Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[DemoDojo] Unhandled promise rejection:', event.reason);
}); 
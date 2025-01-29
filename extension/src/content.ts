console.log('[DemoDojo] Content script loaded');

interface RecordingSettings {
    audio: boolean;
    hideBrowserUI: boolean;
    microphone: MediaDeviceInfo | null;
    recordingMode: 'tab' | 'desktop' | 'area'
}

interface Message {
    type: string;
    settings?: RecordingSettings;
    streamId?: string;
    videoUrl?: string;
    width?: number;
    height?: number;
}

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let clickCount = 0;

// Listen for messages from the popup and offscreen
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
    console.log('[DemoDojo] Content script received message:', message);

    if (message.type === 'START_RECORDING' && message.settings) {
        console.log('[DemoDojo] Starting recording with settings:', message.settings);
        chrome.runtime.sendMessage({
            type: 'start-recording',
            target: 'background',
            data: message.settings
        });
        sendResponse({ success: true });
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
    if (message.type === 'recording-started') {
        console.log('[DemoDojo] Recording started from offscreen');
        chrome.runtime.sendMessage({ type: 'RECORDING_STARTED_CONTENT' });
    }

    if (message.type === 'recording-completed') {
        console.log('[DemoDojo] Recording completed from offscreen', message.videoUrl);
        chrome.runtime.sendMessage({ type: 'RECORDING_COMPLETED_CONTENT', videoUrl: message.videoUrl });
    }
    if (message.type === 'PAUSE_RECORDING') {
        console.log('[DemoDojo] Pausing recording');
        if (mediaRecorder) {
            if ((mediaRecorder as MediaRecorder).state === 'recording') {
                (mediaRecorder as MediaRecorder).pause();
                sendResponse({ success: true });
            } else {
                console.warn('[DemoDojo] Cannot pause - recorder state:', (mediaRecorder as MediaRecorder)?.state);
                sendResponse({ success: false, error: 'Recorder not in recording state' });
            }
        } else {
            console.warn('[DemoDojo] Cannot pause - recorder instance is null');
            sendResponse({ success: false, error: 'MediaRecorder not initialized' });
        }
        return true;
    }

    if (message.type === 'RESUME_RECORDING') {
        console.log('[DemoDojo] Resuming recording');
        if (mediaRecorder) {
            if ((mediaRecorder as MediaRecorder).state === 'paused') {
                (mediaRecorder as MediaRecorder).resume();
                sendResponse({ success: true });
            } else {
                console.warn('[DemoDojo] Cannot resume - recorder state:', (mediaRecorder as MediaRecorder)?.state);
                sendResponse({ success: false, error: 'Recorder not in paused state' });
            }
        } else {
            console.warn('[DemoDojo] Cannot resume - recorder instance is null');
            sendResponse({ success: false, error: 'MediaRecorder not initialized' });
        }
        return true;
    }
});

// Track clicks
document.addEventListener('click', () => {
    if (mediaRecorder) {
        if ((mediaRecorder as MediaRecorder).state === 'recording') {
            clickCount++;
            // Send click count update to popup
            chrome.runtime.sendMessage({
                type: 'UPDATE_CLICK_COUNT',
                count: clickCount
            });
        }
    }
});

async function stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log('[DemoDojo] Stopping recording...');
        if (!mediaRecorder) {
            console.error('[DemoDojo] No MediaRecorder instance found');
            reject(new Error('No active recording'));
            return;
        }
        mediaRecorder.onstop = () => {
            console.log('[DemoDojo] Creating blob from', recordedChunks.length, 'chunks');
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            console.log('[DemoDojo] Created video URL:', url);
            resolve(url);
        };

        mediaRecorder.onerror = (event) => {
            console.error('[DemoDojo] Error while stopping:', event);
            reject(new Error('Failed to stop recording'));
        };

        console.log('[DemoDojo] Calling stop on MediaRecorder');
        mediaRecorder.stop();
        // Clean up tracks
        mediaRecorder.stream.getTracks().forEach(track => {
            console.log('[DemoDojo] Stopping track:', track.kind, track.label);
            track.stop();
        });

    });
}



// Handle keyboard shortcuts
document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!mediaRecorder) return;

    if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        if ((mediaRecorder as MediaRecorder).state === 'recording') {
            (mediaRecorder as MediaRecorder).pause();
            chrome.runtime.sendMessage({ type: 'RECORDING_PAUSED' });
        } else if ((mediaRecorder as MediaRecorder).state === 'paused') {
            (mediaRecorder as MediaRecorder).resume();
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
window.addEventListener('error', (event: ErrorEvent) => {
    console.error('[DemoDojo] Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    console.error('[DemoDojo] Unhandled promise rejection:', event.reason);
});
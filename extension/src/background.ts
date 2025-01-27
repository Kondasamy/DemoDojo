let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let stream: MediaStream | null = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'START_RECORDING':
            handleStartRecording(sendResponse);
            return true;
        case 'PAUSE_RECORDING':
            handlePauseRecording(sendResponse);
            return true;
        case 'STOP_RECORDING':
            handleStopRecording(sendResponse);
            return true;
        default:
            return false;
    }
});

export const handleStartRecording = async (sendResponse: (response: any) => void) => {
    try {
        // Request screen capture access
        const streamId = await new Promise<string>((resolve) => {
            chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'],
                (streamId) => resolve(streamId));
        });

        // Get the stream using the streamId
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: streamId
                }
            } as any,
            audio: false
        });

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, {
                type: 'video/webm'
            });

            const url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: `demodojo-recording-${Date.now()}.webm`,
                saveAs: true
            });

            stream?.getTracks().forEach(track => track.stop());
            stream = null;
            mediaRecorder = null;
            recordedChunks = [];
        };

        mediaRecorder.start();
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error starting recording:', error);
        sendResponse({ success: false, error: (error as Error).message });
    }
};

const handlePauseRecording = (sendResponse: (response: any) => void) => {
    try {
        if (!mediaRecorder) {
            throw new Error('No active recording');
        }

        if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
        } else if (mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
        }

        sendResponse({ success: true });
    } catch (error) {
        console.error('Error toggling pause:', error);
        sendResponse({ success: false, error: (error as Error).message });
    }
};

const handleStopRecording = (sendResponse: (response: any) => void) => {
    try {
        if (!mediaRecorder) {
            throw new Error('No active recording');
        }

        mediaRecorder.stop();
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error stopping recording:', error);
        sendResponse({ success: false, error: (error as Error).message });
    }
}; 
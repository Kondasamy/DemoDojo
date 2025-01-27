let clickCount = 0;
let countdownOverlay: HTMLDivElement | null = null;
let recordingOverlay: HTMLDivElement | null = null;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'START_RECORDING':
            handleStartRecording();
            break;
        case 'STOP_RECORDING':
            handleStopRecording();
            break;
    }
});

export const handleStartRecording = () => {
    showCountdown(() => {
        startClickTracking();
        showRecordingOverlay();
    });
};

export const handleStopRecording = () => {
    stopClickTracking();
    removeRecordingOverlay();
};

const showCountdown = (callback: () => void) => {
    countdownOverlay = document.createElement('div');
    countdownOverlay.className = 'demodojo-countdown-overlay';
    countdownOverlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 48px;
    padding: 20px 40px;
    border-radius: 10px;
    z-index: 999999;
    `;

    document.body.appendChild(countdownOverlay);

    let count = 3;
    const updateCount = () => {
        if (countdownOverlay) {
            countdownOverlay.textContent = count.toString();
        }

        if (count > 0) {
            count--;
            setTimeout(updateCount, 1000);
        } else {
            countdownOverlay?.remove();
            countdownOverlay = null;
            callback();
        }
    };

    updateCount();
};

const showRecordingOverlay = () => {
    recordingOverlay = document.createElement('div');
    recordingOverlay.className = 'demodojo-recording-overlay';
    recordingOverlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 999999;
    `;

    const recordingDot = document.createElement('div');
    recordingDot.style.cssText = `
    width: 8px;
    height: 8px;
    background-color: #ff4444;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
    `;

    const style = document.createElement('style');
    style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
        }
    `;

    document.head.appendChild(style);
    recordingOverlay.appendChild(recordingDot);
    recordingOverlay.appendChild(document.createTextNode('Recording'));
    document.body.appendChild(recordingOverlay);
};

const removeRecordingOverlay = () => {
    recordingOverlay?.remove();
    recordingOverlay = null;
};

const startClickTracking = () => {
    clickCount = 0;
    document.addEventListener('click', handleClick);
};

const stopClickTracking = () => {
    document.removeEventListener('click', handleClick);
    clickCount = 0;
};

const handleClick = (event: MouseEvent) => {
    clickCount++;
    chrome.runtime.sendMessage({
        action: 'UPDATE_CLICK_COUNT',
        count: clickCount
    });

    // Create click ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'demodojo-click-ripple';
    ripple.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid #ff4444;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: ripple 0.5s linear;
    z-index: 999999;
    `;

    const style = document.createElement('style');
    style.textContent = `
    @keyframes ripple {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
    }
    `;

    document.head.appendChild(style);
    ripple.style.left = event.clientX + 'px';
    ripple.style.top = event.clientY + 'px';

    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
}; 
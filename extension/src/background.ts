// Listen for messages from content script
chrome.runtime.onMessage.addListener((message) => {
    switch (message.type) {
        case 'UPDATE_CLICK_COUNT':
            // Forward click count to popup
            chrome.runtime.sendMessage({
                type: 'CLICK_COUNT_UPDATED',
                count: message.count
            });
            break;

        case 'RECORDING_PAUSED':
        case 'RECORDING_RESUMED':
        case 'RECORDING_STOPPED':
            // Forward recording state changes to popup
            chrome.runtime.sendMessage(message);
            break;
    }
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Set default settings
        chrome.storage.sync.set({
            settings: {
                audio: true,
                hideBrowserUI: false,
                microphone: null
            }
        });
    }
}); 
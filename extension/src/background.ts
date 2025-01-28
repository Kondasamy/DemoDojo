/// <reference types="vite/client" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

console.log('[DemoDojo] Service worker initializing');

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[DemoDojo] Extension installed:', details);
    if (details.reason === 'install') {
        // Set default settings
        chrome.storage.local.set({
            settings: {
                theme: 'light',
                notifications: true,
            },
        }).catch(error => {
            console.error('[DemoDojo] Failed to save settings:', error);
        });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[DemoDojo] Received message:', { message, from: sender?.tab?.id });

    switch (message.type) {
        case 'UPDATE_CLICK_COUNT':
            // Forward click count to popup
            chrome.runtime.sendMessage({
                type: 'CLICK_COUNT_UPDATED',
                count: message.count
            }).catch(error => {
                console.error('[DemoDojo] Error forwarding click count:', error);
            });
            break;

        case 'RECORDING_PAUSED':
        case 'RECORDING_RESUMED':
        case 'RECORDING_STOPPED':
            // Forward recording state changes to popup
            chrome.runtime.sendMessage(message).catch(error => {
                console.error('[DemoDojo] Error forwarding recording state:', error);
            });
            break;

        case 'GET_TAB_INFO':
            // Get active tab info
            chrome.tabs.query({ active: true, currentWindow: true })
                .then(tabs => {
                    sendResponse({ tab: tabs[0] });
                })
                .catch(error => {
                    console.error('[DemoDojo] Failed to get tab info:', error);
                    sendResponse({ error: error.message });
                });
            return true; // Will respond asynchronously

        case 'FROM_CONTENT':
            console.log('[DemoDojo] Content script message:', message.data);
            sendResponse({ status: 'received' });
            break;
    }
});

// Handle errors in service worker context
self.addEventListener('error', (event) => {
    console.error('[DemoDojo] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[DemoDojo] Service worker unhandled rejection:', event.reason);
}); 
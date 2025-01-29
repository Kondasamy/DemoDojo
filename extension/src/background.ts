/// <reference types="vite/client" />
/// <reference lib="webworker" />
/// <reference types="chrome" />

declare const self: ServiceWorkerGlobalScope;

type Message = {
    type: string;
    count?: number;
    data?: any;
    videoUrl?: string;
};

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
        }).catch((error) => {
            console.error('[DemoDojo] Failed to save settings:', error);
        });
    }
});

function getMediaStreamId(tabId: number): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(streamId);
        });
    });
}
// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) {
        console.error('[DemoDojo] Tab ID is undefined.');
        return;
    }

    const existingContexts = await chrome.runtime.getContexts({});

    const offscreenDocument = existingContexts.find(
        (c) => c.contextType === chrome.runtime.ContextType.OFFSCREEN_DOCUMENT
    );

    // If an offscreen document is not already open, create one
    if (!offscreenDocument) {
        await chrome.offscreen.createDocument({
            url: 'src/offscreen.html',
            reasons: [chrome.offscreen.Reason.USER_MEDIA],
            justification: 'Recording from chrome.tabCapture API',
        });
    }

    try {
        const streamId = await getMediaStreamId(tab.id);

        const tabInfo = await chrome.tabs.get(tab.id);

        // Send the stream ID to the offscreen document to start recording
        chrome.runtime.sendMessage({
            type: 'start-recording',
            target: 'offscreen',
            data: {
                streamId,
                width: tabInfo.width,
                height: tabInfo.height,
            }

        });

    } catch (error) {
        console.error('[DemoDojo] Failed to get media stream ID or tab info:', error);
    }

});


// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
        console.log('[DemoDojo] Received message:', { message, from: sender?.tab?.id });

        switch (message.type) {
            case 'FROM_CONTENT':
                console.log('[DemoDojo] Content script message:', message.data);
                sendResponse({ status: 'received' });
                break;
            case 'recording-started':
            case 'recording-completed':
                // Forward recording state changes to popup
                chrome.runtime.sendMessage(message).catch((error) => {
                    console.error('[DemoDojo] Error forwarding recording state:', error);
                });
                break;
            case 'GET_TAB_INFO':
                chrome.tabs
                    .query({ active: true, currentWindow: true })
                    .then((tabs) => {
                        sendResponse({ tab: tabs[0] });
                    })
                    .catch((error) => {
                        console.error('[DemoDojo] Failed to get tab info:', error);
                        sendResponse({ error: error.message });
                    });
                return true;
            case 'start-recording':
                console.log('[DemoDojo] Content script message start recording:', message);
                // Forward start recording message to content script
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs && tabs.length > 0) {
                        chrome.tabs.sendMessage(tabs[0].id!, message).catch((error) => {
                            console.error('[DemoDojo] Error forwarding start recording to content:', error);
                        });
                    }
                });

                break;
            default:
                console.warn('[DemoDojo] Unknown message type:', message.type);
        }
    }
);

// Handle errors in service worker context
self.addEventListener('error', (event: ErrorEvent) => {
    console.error('[DemoDojo] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    console.error('[DemoDojo] Service worker unhandled rejection:', event.reason);
});
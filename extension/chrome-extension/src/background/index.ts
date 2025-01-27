import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

console.log('Background script loaded');

// Handle screen capture request
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.type === 'REQUEST_SCREEN_CAPTURE') {
    console.log('Processing screen capture request');

    chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], sender.tab!, (streamId) => {
      console.log('Screen capture response received:', { streamId });

      if (!streamId) {
        console.error('Screen capture was denied or failed');
        sendResponse({ success: false, error: 'Screen capture was denied' });
        return;
      }

      console.log('Screen capture approved, sending to content script');
      chrome.tabs.sendMessage(sender.tab!.id!, {
        type: 'START_RECORDING',
        streamId: streamId,
        settings: message.settings
      }, (response) => {
        console.log('Content script response:', response);
        sendResponse(response);
      });
    });

    return true; // Keep the message channel open for the async response
  }
});

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

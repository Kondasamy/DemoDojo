declare namespace Chrome {
    export interface Runtime {
        sendMessage: (message: any, callback?: (response: any) => void) => void;
        onMessage: {
            addListener: (
                callback: (
                    message: any,
                    sender: any,
                    sendResponse: (response?: any) => void
                ) => void | boolean
            ) => void;
        };
    }

    export interface Downloads {
        download: (options: {
            url: string;
            filename: string;
            saveAs?: boolean;
        }) => void;
    }
}

declare const chrome: {
    runtime: Chrome.Runtime;
    downloads: Chrome.Downloads;
};

interface Window {
    chrome: typeof chrome;
} 
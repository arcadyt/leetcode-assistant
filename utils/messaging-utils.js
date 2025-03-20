/**
 * messaging-utils.js
 * Utilities for handling Chrome messaging in a consistent way
 */

const MessagingUtils = (() => {
    /**
     * Sets up a standardized message listener
     *
     * @param {Object} handlers Object mapping action names to handler functions
     * @param {Function} defaultHandler Optional handler for unknown actions
     * @returns {Function} The listener function registered with Chrome
     */
    const createMessageListener = (handlers, defaultHandler) => {
        // The actual listener function
        const listener = (message, sender, sendResponse) => {
            console.log(`Received message: ${message.action}`);

            const handleMessage = async () => {
                try {
                    // If we have a handler for this action, use it
                    if (message.action && handlers[message.action]) {
                        return await handlers[message.action](message, sender);
                    }

                    // Otherwise use the default handler or return an error
                    if (defaultHandler) {
                        return await defaultHandler(message, sender);
                    }

                    return {
                        success: false,
                        error: `Unknown action: ${message.action}`
                    };
                } catch (error) {
                    console.error('Error handling message:', error);
                    return {
                        success: false,
                        error: error.message || 'Unknown error',
                        data: { requestType: message.requestType }
                    };
                }
            };

            // Process the message and send the response
            handleMessage().then(sendResponse);

            // Return true to indicate we'll respond asynchronously
            return true;
        };

        // Register the listener with Chrome
        chrome.runtime.onMessage.addListener(listener);

        return listener;
    };

    /**
     * Sends a message and returns a promise for the response
     *
     * @param {Object} message The message to send
     * @param {number} tabId Optional tab ID to send to (content scripts)
     * @returns {Promise<any>} Promise that resolves with the response
     */
    const sendMessage = (message, tabId) => {
        return new Promise((resolve, reject) => {
            try {
                const sendFn = tabId ?
                    (msg, callback) => chrome.tabs.sendMessage(tabId, msg, callback) :
                    (msg, callback) => chrome.runtime.sendMessage(msg, callback);

                sendFn(message, response => {
                    const error = chrome.runtime.lastError;
                    if (error) {
                        reject(new Error(error.message));
                    } else {
                        resolve(response);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    // Public API
    return {
        createMessageListener,
        sendMessage
    };
})();

// Make it available in the global scope
if (typeof window !== 'undefined') {
    window.MessagingUtils = MessagingUtils;
} else if (typeof self !== 'undefined') {
    self.MessagingUtils = MessagingUtils;
}

// Support CommonJS modules if available
if (typeof module !== 'undefined') {
    module.exports = {
        MessagingUtils
    };
}
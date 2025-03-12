/**
 * storage-utils.js
 * Utilities for interacting with Chrome storage
 */

const StorageUtils = (() => {
    // Default settings
    const DEFAULT_SETTINGS = {
        aiService: 'openai',
        apiKey: '',
        endpoint: '',
        solutionLanguage: 'auto',
        minimizedByDefault: false
    };

    /**
     * Get settings from Chrome storage, with defaults applied
     * @returns {Promise<Object>} Settings object
     */
    const getSettings = () => {
        return new Promise((resolve) => {
            chrome.storage.local.get(['settings'], (result) => {
                const settings = result.settings || {};
                // Apply defaults for any missing settings
                resolve({
                    ...DEFAULT_SETTINGS,
                    ...settings
                });
            });
        });
    };

    /**
     * Save settings to Chrome storage
     * @param {Object} settings Settings to save
     * @returns {Promise<void>} Promise that resolves when settings are saved
     */
    const saveSettings = (settings) => {
        return new Promise((resolve) => {
            chrome.storage.local.set({ settings }, () => {
                resolve();
            });
        });
    };

    /**
     * Save problem data to Chrome storage
     * @param {String} problemSlug Unique problem identifier
     * @param {Object} problemData Problem data to save
     * @returns {Promise<void>} Promise that resolves when data is saved
     */
    const saveProblemData = (problemSlug, problemData) => {
        return new Promise((resolve) => {
            const key = `problem_${problemSlug}`;
            chrome.storage.local.set({ [key]: problemData }, () => {
                resolve();
            });
        });
    };

    /**
     * Get problem data from Chrome storage
     * @param {String} problemSlug Unique problem identifier
     * @returns {Promise<Object|null>} Problem data or null if not found
     */
    const getProblemData = (problemSlug) => {
        return new Promise((resolve) => {
            const key = `problem_${problemSlug}`;
            chrome.storage.local.get([key], (result) => {
                resolve(result[key] || null);
            });
        });
    };

    /**
     * Save AI response to Chrome storage
     * @param {String} problemSlug Unique problem identifier
     * @param {Object} responseData AI response data to save
     * @returns {Promise<void>} Promise that resolves when data is saved
     */
    const saveAiResponse = (problemSlug, responseData) => {
        return new Promise((resolve) => {
            const key = `ai_response_${problemSlug}`;
            chrome.storage.local.set({
                [key]: {
                    ...responseData,
                    timestamp: new Date().toISOString()
                }
            }, () => {
                resolve();
            });
        });
    };

    /**
     * Get AI response from Chrome storage
     * @param {String} problemSlug Unique problem identifier
     * @returns {Promise<Object|null>} AI response data or null if not found
     */
    const getAiResponse = (problemSlug) => {
        return new Promise((resolve) => {
            const key = `ai_response_${problemSlug}`;
            chrome.storage.local.get([key], (result) => {
                resolve(result[key] || null);
            });
        });
    };

    // Public API
    return {
        getSettings,
        saveSettings,
        saveProblemData,
        getProblemData,
        saveAiResponse,
        getAiResponse,
        DEFAULT_SETTINGS
    };
})();

// Make it available in the global scope for other modules
window.StorageUtils = StorageUtils;
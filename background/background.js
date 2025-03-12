/**
 * background.js
 * Background script for the extension that handles API communication
 */

// Load service scripts in correct order
try {
    importScripts(
        '../services/base-adapter.js',
        '../services/openai-adapter.js',
        '../services/anthropic-adapter.js',
        '../services/gemini-adapter.js',
        '../services/custom-adapter.js',
        '../services/adapter-factory.js',
        '../services/prompt-builder.js',
        '../services/ai-service.js'
    );
    console.log('Successfully loaded service scripts');
} catch (e) {
    console.error('Error loading service scripts:', e);
}

// Cache for AI responses
const responseCache = new Map();

// Constants
const MAX_CACHE_SIZE = 20;  // Maximum number of cached responses
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;  // Cache expiry time (24 hours)

/**
 * Handles the AI assistance request
 * @param {Object} problemData Problem data
 * @param {string} apiKey API key for the service
 * @returns {Promise<Object>} AI response
 */
async function getAiAssistance(problemData, apiKey) {
    if (!problemData) {
        throw new Error("Invalid problem data");
    }

    const { title, description, difficulty, preferredLanguage, settings } = problemData;
    const language = preferredLanguage || 'python';

    // Check if we have a cached response
    const cacheKey = `${problemData.problemSlug}_${language}`;
    if (responseCache.has(cacheKey)) {
        const cachedResponse = responseCache.get(cacheKey);
        // Check if the cache is still valid
        if (Date.now() - cachedResponse.timestamp < CACHE_EXPIRY) {
            return cachedResponse;
        }
        // Remove expired cache
        responseCache.delete(cacheKey);
    }

    try {
        // Service type from settings or default to openai
        const serviceType = settings?.aiService || 'openai';

        // Build options object for the service
        const options = {};

        // Add endpoint for custom service
        if (serviceType === 'custom' && settings?.endpoint) {
            options.endpoint = settings.endpoint;
        }

        // Get the prompt using AiService
        const prompt = AiService.constructPrompt(title, description, language);

        // Call the AI service
        const response = await AiService.callService(serviceType, prompt, apiKey, options);

        // Format the response data
        const responseData = {
            content: response,
            language: language,
            timestamp: Date.now()
        };

        // Cache the response
        cacheResponse(cacheKey, responseData);

        return responseData;
    } catch (error) {
        console.error('Error calling AI service:', error);
        throw error;
    }
}

/**
 * Caches the AI response
 * @param {string} key Cache key
 * @param {Object} responseData Response data to cache
 */
function cacheResponse(key, responseData) {
    // Maintain cache size
    if (responseCache.size >= MAX_CACHE_SIZE) {
        // Remove the oldest entry
        const oldestKey = responseCache.keys().next().value;
        responseCache.delete(oldestKey);
    }

    // Add new response to cache
    responseCache.set(key, responseData);
}

/**
 * Handles user feedback
 * @param {Object} feedback Feedback data
 */
function handleFeedback(feedback) {
    // Log feedback for now, in a production extension this would send the feedback to a server
    console.log('User feedback received:', feedback);

    // Could implement additional logic here to improve AI responses based on feedback
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background script received message:', message.action);

    switch (message.action) {
        case 'PROBLEM_DETECTED':
            // Problem detected, we could pre-fetch AI response if we want
            console.log('Problem detected:', message.problemData?.title);
            // Send immediate response
            sendResponse({ success: true });
            break;

        case 'GET_AI_HELP':
            // Get AI assistance for the problem
            getAiAssistance(message.problemData, message.apiKey)
                .then(response => {
                    sendResponse({ success: true, data: response });
                })
                .catch(error => {
                    console.error('Error getting AI assistance:', error);
                    sendResponse({
                        success: false,
                        error: error.message || "Failed to get AI assistance. Please check your API key and try again."
                    });
                });
            // Return true to indicate we'll respond asynchronously
            return true;

        case 'SUBMIT_FEEDBACK':
            // Handle user feedback
            handleFeedback(message.feedback);
            sendResponse({ success: true });
            break;

        default:
            console.warn('Unknown message action:', message.action);
            sendResponse({ success: false, error: 'Unknown action' });
    }
});

console.log('AI Coding Helper background script loaded');
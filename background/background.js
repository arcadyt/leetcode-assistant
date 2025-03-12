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
        '../services/ollama-adapter.js',
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
 * @param {Object} message Message containing request details
 * @returns {Promise<Object>} AI response
 */
async function getAiAssistance(message) {
    if (!message.problemData) {
        throw new Error("Invalid request data");
    }

    const { title, description, problemSlug } = message.problemData;
    const requestType = message.requestType || 'solution';
    const language = message.language || 'python';
    const apiKey = message.apiKey;
    const settings = message.settings || {};

    // Generate cache key
    const cacheKey = `${problemSlug}_${requestType}_${language}`;

    // Check for cached response
    if (responseCache.has(cacheKey)) {
        const cachedResponse = responseCache.get(cacheKey);
        if (Date.now() - cachedResponse.timestamp < CACHE_EXPIRY) {
            return cachedResponse;
        }
        responseCache.delete(cacheKey);
    }

    try {
        // Get service type and options
        const serviceType = settings.aiService || 'openai';
        const options = {};

        // Set endpoint for Ollama
        if (serviceType === 'ollama' && settings.endpoint) {
            options.endpoint = settings.endpoint;
        }

        // Build the appropriate prompt based on request type
        const prompt = AiService.constructPrompt(
            title,
            description,
            language,
            requestType
        );

        // Call the AI service
        const response = await AiService.callService(serviceType, prompt, apiKey, options);

        // Format the response data
        const responseData = {
            content: response,
            language: language,
            requestType: requestType,
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
            getAiAssistance(message)
                .then(response => {
                    sendResponse({ success: true, data: response });
                })
                .catch(error => {
                    console.error('Error getting AI assistance:', error);
                    sendResponse({
                        success: false,
                        error: error.message || "Failed to get AI assistance. Please check your settings and try again."
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
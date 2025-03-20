/**
 * background.js
 * Background script for the extension that handles API communication
 */

// Load service scripts
try {
    importScripts(
        '../utils/messaging-utils.js',
        '../services/base-adapter.js',
        '../services/openai-adapter.js',
        '../services/anthropic-adapter.js',
        '../services/gemini-adapter.js',
        '../services/ollama-adapter.js',
        '../services/adapter-factory.js',
        '../services/prompt-builder.js',
        '../services/ai-service.js'
    );
    console.log('Service scripts loaded');
} catch (e) {
    console.error('Error loading scripts:', e);
}

// Cache for AI responses
const responseCache = new Map();
const MAX_CACHE_SIZE = 20;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;  // 24 hours

/**
 * Gets AI assistance for a problem
 */
async function getAiAssistance(message) {
    if (!message.problemData) {
        throw new Error("Invalid request: missing problem data");
    }

    const { title, description, problemSlug } = message.problemData;
    const requestType = message.requestType || 'solution';
    const language = message.language || 'python';
    const apiKey = message.apiKey;
    const settings = message.settings || {};

    // Check cache
    const cacheKey = `${problemSlug}_${requestType}_${language}`;
    if (responseCache.has(cacheKey)) {
        const cachedResponse = responseCache.get(cacheKey);
        if (Date.now() - cachedResponse.timestamp < CACHE_EXPIRY) {
            return cachedResponse;
        }
        responseCache.delete(cacheKey);
    }

    try {
        // Prepare options
        const serviceType = settings.aiService || 'openai';
        const options = {
            model: settings.model
        };

        // Set endpoint for Ollama
        if (serviceType === 'ollama' && settings.endpoint) {
            options.endpoint = settings.endpoint;
        }

        // Build prompt
        const prompt = AiService.constructPrompt(
            title,
            description,
            language,
            requestType
        );

        // Call service
        const response = await AiService.callService(serviceType, prompt, apiKey, options);

        // Format and cache response
        const responseData = {
            content: response,
            language: language,
            requestType: requestType,
            timestamp: Date.now()
        };

        cacheResponse(cacheKey, responseData);
        return responseData;
    } catch (error) {
        console.error('AI service error:', error);
        throw error;
    }
}

/**
 * Caches a response
 */
function cacheResponse(key, data) {
    // Maintain cache size
    if (responseCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = responseCache.keys().next().value;
        responseCache.delete(oldestKey);
    }

    responseCache.set(key, data);
}

/**
 * Logs user feedback
 */
function handleFeedback(feedback) {
    console.log('User feedback received:', feedback);
    // In a production extension, this would send feedback to a server
}

// Set up message handlers
MessagingUtils.createMessageListener({
    // Handle problem detection
    "PROBLEM_DETECTED": (message) => {
        console.log('Problem detected:', message.problemData?.title);
        return { success: true };
    },

    // Handle AI assistance requests
    "GET_AI_HELP": async (message) => {
        try {
            const response = await getAiAssistance(message);
            return { success: true, data: response };
        } catch (error) {
            return {
                success: false,
                error: error.message || "Failed to get AI assistance",
                data: { requestType: message.requestType }
            };
        }
    },

    // Handle feedback
    "SUBMIT_FEEDBACK": (message) => {
        handleFeedback(message.feedback);
        return { success: true };
    }
});

console.log('LeetCode Assistant background script loaded');
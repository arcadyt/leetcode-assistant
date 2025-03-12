/**
 * adapter-factory.js
 * Factory for creating appropriate AI service adapters
 */

class AiAdapterFactory {
    /**
     * Creates an appropriate adapter based on the service type
     * @param {string} serviceType Type of AI service ('openai', 'anthropic', 'gemini', 'custom')
     * @param {string} apiKey API key for the service
     * @param {Object} options Additional options (model, endpoint, etc.)
     * @returns {BaseAiAdapter} The appropriate adapter instance
     * @throws {Error} If the service type is not supported
     */
    static createAdapter(serviceType, apiKey, options = {}) {
        switch (serviceType.toLowerCase()) {
            case 'openai':
                return new OpenAiAdapter(apiKey, options);
            case 'anthropic':
                return new AnthropicAdapter(apiKey, options);
            case 'gemini':
                return new GeminiAdapter(apiKey, options);
            case 'custom':
                return new CustomAdapter(apiKey, options);
            default:
                throw new Error(`Unsupported AI service: ${serviceType}`);
        }
    }
}

// Make available in current context (works in both service worker and browser)
if (typeof self !== 'undefined') {
    self.AiAdapterFactory = AiAdapterFactory;
}
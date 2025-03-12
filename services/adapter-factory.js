/**
 * adapter-factory.js
 * Factory for creating appropriate AI service adapters
 */

class AiAdapterFactory {
    /**
     * Creates an appropriate adapter based on the service type
     * @param {string} serviceType Type of AI service ('openai', 'anthropic', 'gemini', 'ollama')
     * @param {string} apiKey API key for the service (not required for ollama)
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
            case 'ollama':
                return new OllamaAdapter('', options); // API key not required for Ollama
            default:
                throw new Error(`Unsupported AI service: ${serviceType}`);
        }
    }
}

// Make available in current context (works in both service worker and browser)
if (typeof self !== 'undefined') {
    self.AiAdapterFactory = AiAdapterFactory;
}
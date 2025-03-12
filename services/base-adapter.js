/**
 * base-adapter.js
 * Base class for AI service adapters following SOLID principles
 */

class BaseAiAdapter {
    /**
     * Creates a new adapter instance
     * @param {string} apiKey The API key for the service (optional for some adapters)
     * @param {Object} options Additional options for the adapter
     */
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.options = options;
    }

    /**
     * Call the AI service with the given prompt
     * @param {string} prompt The prompt to send
     * @returns {Promise<string>} The AI response
     * @throws {Error} If the implementation doesn't override this method
     */
    async callService(prompt) {
        throw new Error("Method 'callService' must be implemented by subclasses");
    }

    /**
     * Format the error response from the API
     * @param {Object} error The error object
     * @returns {string} Formatted error message
     */
    formatError(error) {
        return `API error: ${error.message || 'Unknown error'}`;
    }
}
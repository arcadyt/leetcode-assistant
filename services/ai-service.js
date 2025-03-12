/**
 * ai-service.js
 * Main interface for all AI service interactions
 */

const AiService = (() => {
    /**
     * Calls the specified AI service
     * @param {string} service AI service to use ('openai', 'anthropic', 'gemini', 'custom')
     * @param {string} prompt The prompt to send
     * @param {string} apiKey API key for the service
     * @param {Object} options Additional options (endpoint, model, etc.)
     * @returns {Promise<string>} AI response
     */
    const callService = async (service, prompt, apiKey, options = {}) => {
        try {
            const adapter = AiAdapterFactory.createAdapter(service, apiKey, options);
            return await adapter.callService(prompt);
        } catch (error) {
            console.error(`Error calling ${service} service:`, error);
            throw error;
        }
    };

    /**
     * Constructs a prompt for the AI based on problem details and requested action
     * @param {string} title Problem title
     * @param {string} description Problem description
     * @param {string} language Target programming language
     * @param {string} requestType Type of request ('rephrase', 'hints', 'solution')
     * @returns {string} Formatted prompt
     */
    const constructPrompt = (title, description, language, requestType = 'solution') => {
        switch(requestType) {
            case 'rephrase':
                return PromptBuilder.buildRephrasePrompt(title, description);
            case 'hints':
                return PromptBuilder.buildHintPrompt(title, description, language);
            case 'solution':
            default:
                return PromptBuilder.buildSolutionPrompt(title, description, language);
        }
    };

    // Public API
    return {
        callService,
        constructPrompt
    };
})();

// Make it available in a way that works in both browser and service worker contexts
if (typeof window !== 'undefined') {
    // Browser context (content scripts)
    window.AiService = AiService;
} else if (typeof self !== 'undefined') {
    // Service worker context
    self.AiService = AiService;
}

// Support CommonJS modules if available
if (typeof module !== 'undefined') {
    module.exports = {
        AiService
    };
}
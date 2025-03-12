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
     * Constructs a prompt for the AI based on problem details
     * @param {string} title Problem title
     * @param {string} description Problem description
     * @param {string} language Target programming language
     * @param {string} promptType Type of prompt ('solution', 'hint')
     * @returns {string} Formatted prompt
     */
    const constructPrompt = (title, description, language, promptType = 'solution') => {
        return promptType === 'hint'
            ? PromptBuilder.buildHintPrompt(title, description, language)
            : PromptBuilder.buildCodingPrompt(title, description, language);
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
    window.AiAdapterFactory = AiAdapterFactory;
    window.PromptBuilder = PromptBuilder;
} else if (typeof self !== 'undefined') {
    // Service worker context
    self.AiService = AiService;
    self.AiAdapterFactory = AiAdapterFactory;
    self.PromptBuilder = PromptBuilder;
}

// Support CommonJS modules if available
if (typeof module !== 'undefined') {
    module.exports = {
        AiService,
        AiAdapterFactory,
        PromptBuilder,
        BaseAiAdapter,
        OpenAiAdapter,
        AnthropicAdapter,
        GeminiAdapter,
        CustomAdapter
    };
}
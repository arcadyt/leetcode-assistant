/**
 * ollama-adapter.js
 * Adapter for DeepSeek on Ollama local API
 */

class OllamaAdapter extends BaseAiAdapter {
    /**
     * Calls the Ollama API
     * @param {string} prompt The prompt to send
     * @returns {Promise<string>} AI response
     */
    async callService(prompt) {
        if (!this.options.endpoint) {
            throw new Error("Ollama endpoint URL is required");
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        // Construct request body for Ollama API
        const body = JSON.stringify({
            model: 'deepseek', // Default to deepseek model
            prompt: prompt,
            stream: false,
            options: {
                temperature: this.options.temperature || 0.7,
                num_predict: this.options.maxTokens || 2000
            }
        });

        try {
            const response = await fetch(this.options.endpoint, {
                method: 'POST',
                headers: headers,
                body: body
            });

            if (!response.ok) {
                throw new Error(this.formatError({
                    message: `Response status: ${response.status} ${response.statusText}`
                }));
            }

            const data = await response.json();

            // Handle Ollama response format
            if (data.response) {
                return data.response;
            } else {
                throw new Error("Unexpected response format from Ollama API");
            }
        } catch (error) {
            console.error("Ollama API error:", error);
            throw error;
        }
    }

    /**
     * Format Ollama-specific error messages
     * @param {Object} error The error object
     * @returns {string} Formatted error message
     */
    formatError(error) {
        return `DeepSeek on Ollama error: ${error.message || 'Unknown error'}`;
    }
}

// Make available in current context (works in both service worker and browser)
if (typeof self !== 'undefined') {
    self.OllamaAdapter = OllamaAdapter;
}
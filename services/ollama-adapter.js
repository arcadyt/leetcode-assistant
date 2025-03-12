/**
 * ollama-adapter.js
 * Adapter for Ollama local API with precise response text extraction
 */

class OllamaAdapter extends BaseAiAdapter {
    /**
     * Calls the Ollama API with exact payload specification
     * @param {string} prompt The prompt to send
     * @returns {Promise<string>} AI response
     */
    async callService(prompt) {
        // Validate endpoint configuration
        if (!this.options.endpoint) {
            throw new Error("Ollama endpoint URL is required. Please set it in the settings.");
        }

        // Sanitize and validate endpoint URL
        const endpoint = this.sanitizeEndpoint(this.options.endpoint);

        // Prepare request configuration matching Ollama's exact payload structure
        const requestConfig = {
            model: this.options.model || 'deepseek-r1:14b',
            prompt: prompt,
            stream: false
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestConfig)
            });

            // Comprehensive error handling
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorBody}`);
            }

            const data = await response.json();

            // Validate response structure
            if (!data || !data.response) {
                throw new Error("Invalid response format from Ollama API");
            }

            // Extract and clean the response text
            return this.extractResponseText(data.response);
        } catch (error) {
            console.error("Ollama API call failed:", error);
            throw this.formatError(error);
        }
    }

    /**
     * Extracts clean response text
     * @param {string} rawResponse Raw response from Ollama
     * @returns {string} Cleaned response text
     */
    extractResponseText(rawResponse) {
        // Remove everything up to and including </think> and consecutive newlines
        const cleanedResponse = rawResponse.replace(/.*<\/think>\n*/s, '');
        return cleanedResponse.trim();
    }

    /**
     * Sanitizes and validates the Ollama endpoint URL
     * @param {string} endpoint Raw endpoint URL
     * @returns {string} Sanitized endpoint URL
     */
    sanitizeEndpoint(endpoint) {
        // Remove trailing slashes and add default generate path if missing
        let sanitizedUrl = endpoint.trim().replace(/\/+$/, '');

        // If no path specified, append default generate path
        if (!sanitizedUrl.includes('/api/generate')) {
            sanitizedUrl += '/api/generate';
        }

        return sanitizedUrl;
    }

    /**
     * Format Ollama-specific error messages
     * @param {Error} error The error object
     * @returns {string} Formatted error message
     */
    formatError(error) {
        // Provide more context about potential configuration issues
        if (error.message.includes('fetch failed')) {
            return `Ollama connection error. Check your endpoint URL and ensure Ollama is running. Details: ${error.message}`;
        }

        return `Ollama API error: ${error.message || 'Unknown connection issue'}`;
    }
}

// Make available in current context (works in both service worker and browser)
if (typeof self !== 'undefined') {
    self.OllamaAdapter = OllamaAdapter;
}
/**
 * ollama-adapter.js
 * Adapter for Ollama local API
 */

class OllamaAdapter extends BaseAiAdapter {
    /**
     * Calls the Ollama API
     * @param {string} prompt The prompt to send
     * @returns {Promise<string>} AI response
     */
    async callService(prompt) {
        // Validate endpoint configuration
        if (!this.options.endpoint) {
            throw new Error("Ollama endpoint URL is required");
        }

        // Sanitize and validate endpoint URL
        const endpoint = this.sanitizeEndpoint(this.options.endpoint);
        console.log("Calling Ollama at:", endpoint);

        // Use the correct model for deepseek on Ollama
        const model = this.options.model || 'deepseek-r1:14b';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
            }

            const data = await response.json();

            // Validate response structure
            if (!data || !data.response) {
                throw new Error("Invalid response format from Ollama API");
            }

            return data.response;
        } catch (error) {
            console.error("Ollama request failed:", error);
            throw this.formatError(error);
        }
    }

    /**
     * Format Ollama-specific error messages
     */
    formatError(error) {
        // Connection issues
        if (error.message.includes('fetch failed') ||
            error.message.includes('Failed to fetch')) {
            return `Connection to Ollama failed. Check that Ollama is running and the endpoint URL is correct.`;
        }

        return `Ollama API error: ${error.message}`;
    }

    /**
     * Sanitizes and validates the Ollama endpoint URL
     */
    sanitizeEndpoint(endpoint) {
        // Remove trailing slashes and whitespace
        let url = endpoint.trim().replace(/\/+$/, '');

        // Ensure URL has a protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }

        // Add API path if missing
        if (!url.includes('/api/generate')) {
            url += '/api/generate';
        }

        return url;
    }
}

// Make available in global scope
if (typeof self !== 'undefined') {
    self.OllamaAdapter = OllamaAdapter;
}
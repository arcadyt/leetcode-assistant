/**
 * custom-adapter.js
 * Adapter for custom endpoints, including Ollama and other local or custom APIs
 */

class CustomAdapter extends BaseAiAdapter {
    /**
     * Calls a custom API endpoint
     * @param {string} prompt The prompt to send
     * @returns {Promise<string>} AI response
     */
    async callService(prompt) {
        if (!this.options.endpoint) {
            throw new Error("Custom endpoint URL is required");
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        // Add API key to headers if provided
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        // Determine the request body format based on endpoint type
        let body;

        // Check if it's an Ollama-style endpoint
        if (this.options.endpoint.includes('ollama')) {
            body = JSON.stringify({
                model: this.options.model || 'llama2',
                prompt: prompt,
                stream: false,
                options: {
                    temperature: this.options.temperature || 0.7,
                    num_predict: this.options.maxTokens || 2000
                }
            });
        } else {
            // Default format for custom endpoints
            body = JSON.stringify({
                prompt: prompt,
                max_tokens: this.options.maxTokens || 2000,
                temperature: this.options.temperature || 0.7
            });
        }

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

        // Handle different response formats - this is flexible for various APIs
        if (data.choices && data.choices[0]?.text) {
            return data.choices[0].text;
        } else if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        } else if (data.response) {
            return data.response;
        } else if (data.output) {
            return data.output;
        } else if (data.result) {
            return data.result;
        } else if (data.content) {
            return data.content;
        } else if (data.message) {
            return data.message;
        } else if (data.generation) {
            return data.generation;
        } else {
            // If we can't determine a standard format, return the entire response as a string
            return JSON.stringify(data);
        }
    }

    /**
     * Format custom endpoint error messages
     * @param {Object} error The error object
     * @returns {string} Formatted error message
     */
    formatError(error) {
        return `Custom API error: ${error.message || 'Unknown error'}`;
    }
}

// Make available in current context (works in both service worker and browser)
if (typeof self !== 'undefined') {
    self.CustomAdapter = CustomAdapter;
}
/**
 * anthropic-adapter.js
 * Adapter for Anthropic's Claude API
 */

class AnthropicAdapter extends BaseAiAdapter {
    /**
     * Calls Anthropic's API
     * @param {string} prompt The prompt to send
     * @returns {Promise<string>} AI response
     */
    async callService(prompt) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.options.model || 'claude-3-sonnet-20240229',
                max_tokens: this.options.maxTokens || 2000,
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(this.formatError({
                message: error.error?.message || response.statusText
            }));
        }

        const data = await response.json();
        return data.content[0].text;
    }

    /**
     * Format Anthropic-specific error messages
     * @param {Object} error The error object
     * @returns {string} Formatted error message
     */
    formatError(error) {
        return `Anthropic API error: ${error.message || 'Unknown error'}`;
    }
}

// Make available in current context (works in both service worker and browser)
if (typeof self !== 'undefined') {
    self.AnthropicAdapter = AnthropicAdapter;
}
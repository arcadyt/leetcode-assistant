/**
 * openai-adapter.js
 * Adapter for OpenAI's API
 */

class OpenAiAdapter extends BaseAiAdapter {
    /**
     * Calls OpenAI's API
     * @param {string} prompt The prompt to send
     * @returns {Promise<string>} AI response
     */
    async callService(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.options.model || 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful coding assistant specializing in algorithm problems. Provide clear explanations and efficient solutions.' },
                    { role: 'user', content: prompt }
                ],
                temperature: this.options.temperature || 0.7,
                max_tokens: this.options.maxTokens || 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(this.formatError({
                message: error.error?.message || response.statusText
            }));
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * Format OpenAI-specific error messages
     * @param {Object} error The error object
     * @returns {string} Formatted error message
     */
    formatError(error) {
        return `OpenAI API error: ${error.message || 'Unknown error'}`;
    }
}
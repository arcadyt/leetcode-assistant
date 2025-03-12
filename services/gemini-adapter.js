/**
 * gemini-adapter.js
 * Adapter for Google's Gemini API
 */

class GeminiAdapter extends BaseAiAdapter {
    /**
     * Calls Google's Gemini API
     * @param {string} prompt The prompt to send
     * @returns {Promise<string>} AI response
     */
    async callService(prompt) {
        const apiKey = this.apiKey;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: prompt }] }
                ],
                generationConfig: {
                    temperature: this.options.temperature || 0.7,
                    maxOutputTokens: this.options.maxTokens || 2000
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(this.formatError({
                message: error.error?.message || response.statusText
            }));
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    /**
     * Format Gemini-specific error messages
     * @param {Object} error The error object
     * @returns {string} Formatted error message
     */
    formatError(error) {
        return `Gemini API error: ${error.message || 'Unknown error'}`;
    }
}
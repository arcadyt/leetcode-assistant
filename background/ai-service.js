/**
 * ai-service.js
 * Handles communication with different AI service APIs
 */

const AiService = (() => {
    /**
     * Calls OpenAI's API
     * @param {string} prompt The prompt to send
     * @param {string} apiKey OpenAI API key
     * @returns {Promise<string>} AI response
     */
    const callOpenAI = async (prompt, apiKey) => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful coding assistant specializing in algorithm problems. Provide clear explanations and efficient solutions.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    };

    /**
     * Calls Anthropic's API
     * @param {string} prompt The prompt to send
     * @param {string} apiKey Anthropic API key
     * @returns {Promise<string>} AI response
     */
    const callAnthropic = async (prompt, apiKey) => {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;
    };

    /**
     * Calls Google's Gemini API
     * @param {string} prompt The prompt to send
     * @param {string} apiKey Google API key
     * @returns {Promise<string>} AI response
     */
    const callGemini = async (prompt, apiKey) => {
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
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    };

    /**
     * Calls a custom API endpoint
     * @param {string} prompt The prompt to send
     * @param {string} apiKey API key (may be optional depending on the endpoint)
     * @param {string} endpoint Custom API endpoint URL
     * @returns {Promise<string>} AI response
     */
    const callCustomEndpoint = async (prompt, apiKey, endpoint) => {
        if (!endpoint) {
            throw new Error("Custom endpoint URL is required");
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        // Add API key to headers if provided
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`Custom API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different response formats - this may need adjustment based on the specific API
        if (data.choices && data.choices[0]?.text) {
            return data.choices[0].text;
        } else if (data.response) {
            return data.response;
        } else if (data.output) {
            return data.output;
        } else if (data.result) {
            return data.result;
        } else if (data.content) {
            return data.content;
        } else {
            // Return the entire response as a string if we can't determine the format
            return JSON.stringify(data);
        }
    };

    /**
     * Calls the specified AI service
     * @param {string} service AI service to use ('openai', 'anthropic', 'gemini', 'custom')
     * @param {string} prompt The prompt to send
     * @param {string} apiKey API key for the service
     * @param {string} endpoint Custom endpoint URL (for 'custom' service)
     * @returns {Promise<string>} AI response
     */
    const callService = async (service, prompt, apiKey, endpoint) => {
        switch (service) {
            case 'openai':
                return await callOpenAI(prompt, apiKey);
            case 'anthropic':
                return await callAnthropic(prompt, apiKey);
            case 'gemini':
                return await callGemini(prompt, apiKey);
            case 'custom':
                return await callCustomEndpoint(prompt, apiKey, endpoint);
            default:
                throw new Error(`Unsupported AI service: ${service}`);
        }
    };

    /**
     * Constructs a prompt for the AI based on problem details
     * @param {string} title Problem title
     * @param {string} description Problem description
     * @param {string} language Target programming language
     * @returns {string} Formatted prompt
     */
    const constructPrompt = (title, description, language) => {
        return `
I'm solving the following LeetCode problem:

Title: ${title}

${description}

Please provide:
1. A brief explanation of the problem
2. An approach to solve it in ${language}
3. Time and space complexity analysis
4. A code solution in ${language}
    `;
    };

    // Public API
    return {
        callService,
        constructPrompt
    };
})();

// Make it available for the background script
if (typeof module !== 'undefined') {
    module.exports = AiService;
} else {
    window.AiService = AiService;
}
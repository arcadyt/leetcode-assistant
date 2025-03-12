/**
 * prompt-builder.js
 * Responsible for building prompts for AI services
 */

class PromptBuilder {
    /**
     * Constructs a prompt for the AI based on problem details
     * @param {string} title Problem title
     * @param {string} description Problem description
     * @param {string} language Target programming language
     * @param {string} difficulty Problem difficulty (optional)
     * @returns {string} Formatted prompt
     */
    static buildCodingPrompt(title, description, language, difficulty = '') {
        return `
I'm solving the following LeetCode problem:

Title: ${title}
${difficulty ? `Difficulty: ${difficulty}` : ''}

${description}

Please provide:
1. A brief explanation of the problem
2. An approach to solve it in ${language}
3. Time and space complexity analysis
4. A code solution in ${language}
        `;
    }

    /**
     * Builds a prompt for getting hints without a full solution
     * @param {string} title Problem title
     * @param {string} description Problem description
     * @param {string} language Target programming language
     * @returns {string} Formatted prompt for hints
     */
    static buildHintPrompt(title, description, language) {
        return `
I'm solving the following LeetCode problem and would like some hints without the complete solution:

Title: ${title}

${description}

Please provide:
1. A brief explanation of the problem
2. Key insights or patterns to notice
3. A high-level approach (pseudocode only)
4. Common pitfalls to avoid when implementing in ${language}
        `;
    }
}
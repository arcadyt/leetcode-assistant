/**
 * prompt-builder.js
 * Responsible for building prompts for AI services
 */

class PromptBuilder {
    /**
     * Builds a prompt for rephrasing and explaining the problem
     * @param {string} title Problem title
     * @param {string} description Problem description
     * @returns {string} Formatted prompt
     */
    static buildRephrasePrompt(title, description) {
        return `
Explain this LeetCode problem in simpler terms:

Title: ${title}
${description}

Simply rephrase the problem concisely, clarify any confusing parts, and provide one small example.
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
Give hints for this LeetCode problem without revealing the full solution:

Title: ${title}
${description}

Provide:
1. Key insights to notice
2. A high-level approach (no complete code)
3. Common pitfalls when implementing in ${language}
        `;
    }

    /**
     * Builds a prompt for a complete solution
     * @param {string} title Problem title
     * @param {string} description Problem description
     * @param {string} language Target programming language
     * @returns {string} Formatted prompt for full solution
     */
    static buildSolutionPrompt(title, description, language) {
        return `
Solve this LeetCode problem:

Title: ${title}
${description}

Provide:
1. Your approach to solving it in ${language}
2. Time and space complexity analysis
3. Complete code solution in ${language}
        `;
    }
}

// Make available in current context (works in both service worker and browser)
if (typeof self !== 'undefined') {
    self.PromptBuilder = PromptBuilder;
}
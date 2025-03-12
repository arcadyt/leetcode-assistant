/**
 * text-processor.js
 * Utilities for processing and formatting text
 */

const TextProcessor = (() => {
    /**
     * Cleans and formats the problem description text
     * @param {string} description Raw description from meta tag
     * @returns {string} Cleaned description
     */
    const cleanDescription = (description) => {
        return description
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '  ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    };

    /**
     * Formats the AI response text with markdown-like syntax for HTML display
     * @param {string} text The AI response text
     * @returns {string} Formatted HTML
     */
    const formatAiResponse = (text) => {
        if (!text) return '';

        // Basic markdown-like formatting
        return text
            // Code blocks with language
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<div class="ai-code-block"><pre><code class="language-$1">$2</code></pre></div>')
            // Code blocks without language specification
            .replace(/```([\s\S]*?)```/g, '<div class="ai-code-block"><pre><code>$1</code></pre></div>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Headers
            .replace(/^### (.*$)/gm, '<h5>$1</h5>')
            .replace(/^## (.*$)/gm, '<h4>$1</h4>')
            .replace(/^# (.*$)/gm, '<h3>$1</h3>')
            // Lists - first convert list items
            .replace(/^\s*[\*\-]\s(.+)$/gm, '<li>$1</li>')
            .replace(/^\s*(\d+)\.\s(.+)$/gm, '<li>$2</li>')
            // Then wrap lists with proper tags - unordered
            .replace(/(<li>.*<\/li>)(?!\s*<li>)/gs, '<ul>$1</ul>')
            // Line breaks - careful with this
            .replace(/\n\n/g, '<br><br>')
            // Clean up any dangling list items
            .replace(/<\/ul><ul>/g, '');
    };

    /**
     * Truncates text to a maximum length with ellipsis
     * @param {string} text The text to truncate
     * @param {number} maxLength Maximum length
     * @returns {string} Truncated text
     */
    const truncateText = (text, maxLength = 100) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    /**
     * Constructs prompt for the AI service based on problem data
     * @param {Object} problemData The problem data
     * @param {string} language The target programming language
     * @returns {string} Formatted prompt for AI service
     */
    const constructPrompt = (problemData, language) => {
        if (!problemData) return '';

        const { title, description, difficulty } = problemData;

        return `
I'm solving the following LeetCode problem:

Title: ${title}
Difficulty: ${difficulty || 'Unknown'}

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
        cleanDescription,
        formatAiResponse,
        truncateText,
        constructPrompt
    };
})();

// Make it available in the global scope for other modules
window.TextProcessor = TextProcessor;
/**
 * problem-detector.js
 * Detects and extracts problem details from LeetCode pages
 */

const ProblemDetector = (() => {
    // Constants
    const LEETCODE_PROBLEM_PATTERN = /^https:\/\/leetcode\.com\/problems\/([^\/]+)\/([^\/]*)/;
    let currentProblemData = null;

    /**
     * Checks if the current page is a LeetCode problem page
     * @returns {boolean} True if it's a LeetCode problem page
     */
    const isLeetCodeProblemPage = () => {
        return LEETCODE_PROBLEM_PATTERN.test(window.location.href);
    };

    /**
     * Gets the problem slug from the URL
     * @returns {string} Problem slug or empty string if not found
     */
    const getProblemSlug = () => {
        const url = window.location.href;
        const match = url.match(LEETCODE_PROBLEM_PATTERN);
        return match ? match[1] : '';
    };

    /**
     * Extracts problem data from the page, with retry
     * @returns {Promise<Object>} Problem data object
     */
    const extractProblemData = async () => {
        // Give the page some time to load completely
        return new Promise((resolve, reject) => {
            // First attempt immediately
            attemptExtraction()
                .then(data => {
                    currentProblemData = data;
                    resolve(data);
                })
                .catch(() => {
                    // If first attempt fails, retry after a short delay
                    setTimeout(() => {
                        attemptExtraction()
                            .then(data => {
                                currentProblemData = data;
                                resolve(data);
                            })
                            .catch(err => reject(err));
                    }, 2000);
                });
        });
    };

    /**
     * Attempts to extract problem data from the current state of the DOM
     * @returns {Promise<Object>} Problem data object
     */
    const attemptExtraction = async () => {
        return new Promise((resolve, reject) => {
            try {
                // Extract problem title
                const titleElement = document.querySelector('title');
                const title = titleElement ? titleElement.textContent.replace(' - LeetCode', '').trim() : '';

                // Extract problem description
                // LeetCode stores the problem description in a meta tag
                const descriptionMeta = document.querySelector('meta[name="description"]');
                let description = '';

                if (descriptionMeta) {
                    description = descriptionMeta.getAttribute('content') || '';
                    // Extract the actual problem description part from the meta content
                    const match = description.match(/Can you solve this real interview question\? .+ - (.+)/s);
                    if (match && match[1]) {
                        description = match[1];
                    }
                }

                // Extract problem difficulty from DOM content
                let difficulty = '';
                const difficultyElements = document.querySelectorAll('.css-10o4wqw');
                difficultyElements.forEach(el => {
                    if (el.textContent.includes('Easy') || el.textContent.includes('Medium') || el.textContent.includes('Hard')) {
                        difficulty = el.textContent.trim();
                    }
                });

                // If we couldn't get difficulty from the DOM, try to infer it from the meta description
                if (!difficulty && description.includes('Difficulty:')) {
                    const diffMatch = description.match(/Difficulty: (Easy|Medium|Hard)/i);
                    if (diffMatch && diffMatch[1]) {
                        difficulty = diffMatch[1];
                    }
                }

                // Get current URL as a unique identifier
                const url = window.location.href;
                const problemSlug = getProblemSlug();

                // Get the code section (language and default code)
                const codeEditor = document.querySelector('.CodeMirror');
                let code = '';
                let language = '';

                if (codeEditor) {
                    // Get code editor content
                    code = codeEditor.CodeMirror ? codeEditor.CodeMirror.getValue() : '';

                    // Try to determine the language
                    const langSelector = document.querySelector('[data-cy="lang-select"]');
                    if (langSelector) {
                        language = langSelector.textContent.trim();
                    }
                }

                // If we have a problem title and description, consider it a success
                if (title && description) {
                    const problemData = {
                        title,
                        description: TextProcessor.cleanDescription(description),
                        difficulty,
                        url,
                        problemSlug,
                        language,
                        defaultCode: code,
                        timestamp: new Date().toISOString()
                    };

                    // Cache the data for later use
                    StorageUtils.saveProblemData(problemSlug, problemData);

                    resolve(problemData);
                } else {
                    reject(new Error("Could not extract complete problem data"));
                }

            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * Gets the current problem data
     * @returns {Object|null} Current problem data or null if not available
     */
    const getCurrentProblemData = () => {
        return currentProblemData;
    };

    // Public API
    return {
        isLeetCodeProblemPage,
        extractProblemData,
        getProblemSlug,
        getCurrentProblemData
    };
})();

// Make it available in the global scope for other modules
window.ProblemDetector = ProblemDetector;
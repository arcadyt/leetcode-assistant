/**
 * content-main.js
 * Main entry point for content script
 * Coordinates between the different modules
 */

(function() {
    /**
     * Initializes the extension
     */
    async function initialize() {
        // Check if we're on a LeetCode problem page
        if (!ProblemDetector.isLeetCodeProblemPage()) {
            return;
        }

        console.log("AI Coding Helper: LeetCode problem detected");

        try {
            // Extract problem data
            const problemData = await ProblemDetector.extractProblemData();
            console.log("Problem data extracted:", problemData);

            // Create UI
            const panel = await UIManager.createAIHelperPanel();

            // Set up event listeners for the UI
            setupEventListeners();

            // Notify background script about the detected problem
            chrome.runtime.sendMessage({
                action: "PROBLEM_DETECTED",
                problemData: problemData
            });
        } catch (error) {
            console.error("Error initializing AI Coding Helper:", error);
        }
    }

    /**
     * Sets up event listeners for user interactions
     */
    function setupEventListeners() {
        // Use event delegation for all button clicks in the panel
        document.addEventListener('click', function(event) {
            // Find the closest button that was clicked
            const button = event.target.closest('button');
            if (!button) return;

            // Handle different button clicks based on ID
            switch (button.id) {
                case 'rephrase-problem-btn':
                    requestProblemRephrase();
                    break;
                case 'get-hints-btn':
                    requestHints();
                    break;
                case 'full-solution-btn':
                    requestFullSolution();
                    break;

                // No default action needed
            }
        });
    }

    /**
     * Handles the request for problem rephrasing
     */
    async function requestProblemRephrase() {
        const problemData = ProblemDetector.getCurrentProblemData();
        if (!problemData) {
            console.error("No problem data available");
            return;
        }

        // Get user settings
        const settings = await StorageUtils.getSettings();

        // Check if API key is set (except for custom endpoints)
        if (!settings.apiKey && settings.aiService !== 'custom') {
            UIManager.showApiKeyError();
            return;
        }

        // Show loading state
        UIManager.showLoading("Rephrasing problem...");

        // Get the target language for context
        const targetLanguage = await SettingsManager.getTargetLanguage(problemData);

        // Request AI assistance
        chrome.runtime.sendMessage({
            action: "GET_AI_HELP",
            requestType: "rephrase",
            problemData: {
                title: problemData.title,
                description: problemData.description,
                problemSlug: problemData.problemSlug
            },
            settings: {
                aiService: settings.aiService || 'openai',
                endpoint: settings.endpoint || ''
            },
            apiKey: settings.apiKey
        }, handleAiResponse);
    }

    /**
     * Handles the request for hints
     */
    async function requestHints() {
        const problemData = ProblemDetector.getCurrentProblemData();
        if (!problemData) {
            console.error("No problem data available");
            return;
        }

        // Get user settings
        const settings = await StorageUtils.getSettings();

        // Check if API key is set (except for custom endpoints)
        if (!settings.apiKey && settings.aiService !== 'custom') {
            UIManager.showApiKeyError();
            return;
        }

        // Show loading state
        UIManager.showLoading("Getting hints...");

        // Get the target language
        const targetLanguage = await SettingsManager.getTargetLanguage(problemData);

        // Request AI assistance
        chrome.runtime.sendMessage({
            action: "GET_AI_HELP",
            requestType: "hints",
            problemData: {
                title: problemData.title,
                description: problemData.description,
                problemSlug: problemData.problemSlug
            },
            language: targetLanguage,
            settings: {
                aiService: settings.aiService || 'openai',
                endpoint: settings.endpoint || ''
            },
            apiKey: settings.apiKey
        }, handleAiResponse);
    }

    /**
     * Handles the request for full solution
     */
    async function requestFullSolution() {
        const problemData = ProblemDetector.getCurrentProblemData();
        if (!problemData) {
            console.error("No problem data available");
            return;
        }

        // Get user settings
        const settings = await StorageUtils.getSettings();

        // Check if API key is set (except for custom endpoints)
        if (!settings.apiKey && settings.aiService !== 'custom') {
            UIManager.showApiKeyError();
            return;
        }

        // Show loading state
        UIManager.showLoading("Getting full solution...");

        // Get the target language
        const targetLanguage = await SettingsManager.getTargetLanguage(problemData);

        // Request AI assistance
        chrome.runtime.sendMessage({
            action: "GET_AI_HELP",
            requestType: "solution",
            problemData: {
                title: problemData.title,
                description: problemData.description,
                problemSlug: problemData.problemSlug
            },
            language: targetLanguage,
            settings: {
                aiService: settings.aiService || 'openai',
                endpoint: settings.endpoint || ''
            },
            apiKey: settings.apiKey
        }, handleAiResponse);
    }

    /**
     * Handles the AI response from the background script
     * @param {Object} response The response from the background script
     */
    function handleAiResponse(response) {
        if (response && response.success) {
            // Save response to cache
            const problemSlug = ProblemDetector.getProblemSlug();
            StorageUtils.saveAiResponse(problemSlug, response.data);

            // Display the response
            UIManager.displayAiResponse(response.data);
        } else {
            // Display error message
            UIManager.showError(
                response ? response.error : "Failed to get AI assistance",
                () => {
                    // Determine which function to retry based on the request type
                    if (response && response.data && response.data.requestType) {
                        switch (response.data.requestType) {
                            case 'rephrase':
                                requestProblemRephrase();
                                break;
                            case 'hints':
                                requestHints();
                                break;
                            case 'solution':
                                requestFullSolution();
                                break;
                            default:
                                // Default to menu if type not recognized
                                UIManager.showInitialHelp();
                        }
                    } else {
                        // Return to menu if request type not available
                        UIManager.showInitialHelp();
                    }
                }
            );
        }
    }

    // Listen for messages from the background script or popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "UPDATE_AI_RESPONSE" && message.data) {
            UIManager.displayAiResponse(message.data);
        }
        else if (message.action === "SETTINGS_UPDATED" && message.settings) {
            // Update the UI when settings are updated from the popup
            UIManager.showInitialHelp();
        }

        // Always return true for async response
        return true;
    });

    // Initialize when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
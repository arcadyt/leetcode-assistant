/**
 * content-main.js
 * Main entry point for content script
 */

(function() {
    /**
     * Initializes the extension
     */
    async function initialize() {
        if (!ProblemDetector.isLeetCodeProblemPage()) {
            return;
        }

        console.log("LeetCode problem detected");

        try {
            // Extract problem data
            const problemData = await ProblemDetector.extractProblemData();

            // Create UI
            await UIManager.createAIHelperPanel();

            // Set up event listeners
            setupEventListeners();

            // Notify background script
            MessagingUtils.sendMessage({
                action: "PROBLEM_DETECTED",
                problemData: problemData
            });
        } catch (error) {
            console.error("Initialization error:", error);
        }
    }

    /**
     * Sets up event listeners for user interactions
     */
    function setupEventListeners() {
        // Use event delegation for button clicks
        document.addEventListener('click', function(event) {
            const button = event.target.closest('button');
            if (!button) return;

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
            }
        });
    }

    /**
     * Common function to prepare and send AI requests
     */
    async function makeAiRequest(requestType, loadingMessage) {
        const problemData = ProblemDetector.getCurrentProblemData();
        if (!problemData) {
            console.error("No problem data available");
            return;
        }

        const settings = await StorageUtils.getSettings();

        // Validate settings
        if (settings.aiService === 'ollama' && !settings.endpoint) {
            UIManager.showError("Endpoint URL is required for Ollama");
            return;
        }

        if (settings.aiService !== 'ollama' && !settings.apiKey) {
            UIManager.showApiKeyError();
            return;
        }

        // Show loading state
        UIManager.showLoading(loadingMessage);

        // Get target language
        const targetLanguage = await SettingsManager.getTargetLanguage(problemData);

        try {
            // Send request to background script
            const response = await MessagingUtils.sendMessage({
                action: "GET_AI_HELP",
                requestType: requestType,
                problemData: {
                    title: problemData.title,
                    description: problemData.description,
                    problemSlug: problemData.problemSlug
                },
                language: targetLanguage,
                settings: {
                    aiService: settings.aiService,
                    endpoint: settings.endpoint,
                    model: 'deepseek-r1:14b' // Correct model for Ollama
                },
                apiKey: settings.apiKey
            });

            handleAiResponse(response);
        } catch (error) {
            UIManager.showError(error.message);
        }
    }

    // Request functions
    function requestProblemRephrase() {
        makeAiRequest("rephrase", "Rephrasing problem...");
    }

    function requestHints() {
        makeAiRequest("hints", "Getting hints...");
    }

    function requestFullSolution() {
        makeAiRequest("solution", "Getting full solution...");
    }

    /**
     * Handles the AI response
     */
    function handleAiResponse(response) {
        if (response && response.success) {
            // Save to cache
            const problemSlug = ProblemDetector.getProblemSlug();
            StorageUtils.saveAiResponse(problemSlug, response.data);

            // Display response
            UIManager.displayAiResponse(response.data);
        } else {
            // Show error with retry
            UIManager.showError(
                response?.error || "Failed to get AI assistance",
                () => {
                    if (response?.data?.requestType) {
                        switch (response.data.requestType) {
                            case 'rephrase': requestProblemRephrase(); break;
                            case 'hints': requestHints(); break;
                            case 'solution': requestFullSolution(); break;
                            default: UIManager.showInitialHelp(); break;
                        }
                    } else {
                        UIManager.showInitialHelp();
                    }
                }
            );
        }
    }

    // Set up message listener
    MessagingUtils.createMessageListener({
        "UPDATE_AI_RESPONSE": (message) => {
            if (message.data) {
                UIManager.displayAiResponse(message.data);
            }
            return { success: true };
        },
        "SETTINGS_UPDATED": (message) => {
            if (message.settings) {
                UIManager.showInitialHelp();
            }
            return { success: true };
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
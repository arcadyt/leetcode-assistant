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

            // Update the language badge with the current setting
            updateLanguageBadgeFromSettings();

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
        // Event listener for 'Get AI Help' button
        const helpButton = document.getElementById('get-ai-help-btn');
        if (helpButton) {
            helpButton.addEventListener('click', requestAiHelp);
        }
    }

    /**
     * Updates the language badge based on current settings
     */
    async function updateLanguageBadgeFromSettings() {
        const settings = await StorageUtils.getSettings();
        const language = settings.solutionLanguage || 'auto';
        UIManager.updateLanguageBadge(language);
    }

    /**
     * Handles the request for AI assistance
     */
    async function requestAiHelp() {
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

        // Get the target language
        const targetLanguage = await SettingsManager.getTargetLanguage(problemData);

        // Update UI to show language and loading state
        UIManager.updateLanguageBadge(targetLanguage);
        UIManager.showLoading();

        // Check if we have a cached response
        const cachedResponse = await StorageUtils.getAiResponse(problemData.problemSlug);
        if (cachedResponse) {
            // Check if the cached response is for the same language and is recent (less than 1 hour old)
            const cacheTime = new Date(cachedResponse.timestamp).getTime();
            const currentTime = new Date().getTime();
            const oneHour = 60 * 60 * 1000;

            if (cachedResponse.language === targetLanguage && (currentTime - cacheTime < oneHour)) {
                console.log("Using cached AI response");
                UIManager.displayAiResponse(cachedResponse);
                return;
            }
        }

        // Prepare enriched problem data with settings
        const enrichedProblemData = {
            ...problemData,
            preferredLanguage: targetLanguage,
            settings: {
                aiService: settings.aiService || 'openai',
                endpoint: settings.endpoint || ''
            }
        };

        // Request AI assistance from background script
        chrome.runtime.sendMessage({
            action: "GET_AI_HELP",
            problemData: enrichedProblemData,
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
                requestAiHelp // Pass the requestAiHelp function as retry callback
            );
        }
    }

    // Listen for messages from the background script or popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "UPDATE_AI_RESPONSE" && message.data) {
            UIManager.displayAiResponse(message.data);
        }
        else if (message.action === "SETTINGS_UPDATED" && message.settings) {
            // Update the language badge when settings are updated from the popup
            const language = message.settings.solutionLanguage || 'auto';
            UIManager.updateLanguageBadge(language);
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
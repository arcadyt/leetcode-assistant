/**
 * ui-manager.js
 * Manages the UI components of the extension
 */

const UIManager = (() => {
    // Reference to the main panel
    let aiHelperPanel = null;

    /**
     * Creates and injects the AI Helper Panel UI
     * @returns {HTMLElement} The created panel
     */
    const createAIHelperPanel = async () => {
        // Check if panel already exists
        if (document.getElementById('ai-helper-panel')) {
            return document.getElementById('ai-helper-panel');
        }

        // Create the panel container
        aiHelperPanel = document.createElement('div');
        aiHelperPanel.id = 'ai-helper-panel';
        aiHelperPanel.className = 'ai-helper-panel card';

        // Create header
        const header = createPanelHeader();

        // Create content area
        const content = document.createElement('div');
        content.className = 'card-body p-3 overflow-auto';
        content.style.maxHeight = '400px';

        // Create loading indicator
        const loading = createLoadingIndicator();
        content.appendChild(loading);

        // Create settings section
        const settingsSection = createSettingsSection();

        // Create actions footer
        const actions = createActionFooter();

        // Assemble panel
        aiHelperPanel.appendChild(header);
        aiHelperPanel.appendChild(content);
        aiHelperPanel.appendChild(settingsSection);
        aiHelperPanel.appendChild(actions);

        // Create toggle button for minimized state
        const toggleBtn = createToggleButton();

        // Inject components into the page
        document.body.appendChild(aiHelperPanel);
        document.body.appendChild(toggleBtn);

        // Add Bootstrap JS for collapse functionality if needed
        ensureBootstrapJsLoaded();

        // Initialize settings from storage
        const settings = await StorageUtils.getSettings();
        if (settings.minimizedByDefault) {
            aiHelperPanel.classList.add('minimized');
        }

        // After a delay, hide the loading and show initial help
        setTimeout(() => {
            loading.style.display = 'none';
            showInitialHelp();
        }, 1000);

        return aiHelperPanel;
    };

    /**
     * Creates the panel header with title and close button
     * @returns {HTMLElement} The header element
     */
    const createPanelHeader = () => {
        const header = document.createElement('div');
        header.className = 'card-header d-flex justify-content-between align-items-center';

        const title = document.createElement('h5');
        title.className = 'mb-0';
        title.textContent = 'AI Coding Helper';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-close btn-close-white';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.addEventListener('click', () => {
            aiHelperPanel.classList.add('minimized');
        });

        header.appendChild(title);
        header.appendChild(closeBtn);

        return header;
    };

    /**
     * Creates a loading indicator
     * @returns {HTMLElement} The loading indicator element
     */
    const createLoadingIndicator = () => {
        const loading = document.createElement('div');
        loading.className = 'text-center my-4';
        loading.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Analyzing problem...</p>';
        return loading;
    };

    /**
     * Creates the settings section with collapsible content
     * @returns {HTMLElement} The settings section element
     */
    const createSettingsSection = () => {
        const settingsSection = document.createElement('div');
        settingsSection.className = 'mb-3 px-3';

        const settingsToggle = document.createElement('button');
        settingsToggle.className = 'btn btn-sm btn-outline-secondary w-100 mb-2';
        settingsToggle.textContent = 'Settings';
        settingsToggle.setAttribute('data-bs-toggle', 'collapse');
        settingsToggle.setAttribute('data-bs-target', '#aiHelperSettings');
        settingsToggle.setAttribute('aria-expanded', 'false');
        settingsToggle.setAttribute('aria-controls', 'aiHelperSettings');

        const settingsContent = document.createElement('div');
        settingsContent.className = 'collapse';
        settingsContent.id = 'aiHelperSettings';

        // Create all settings elements
        const settingsElements = SettingsManager.createSettingsElements();

        // Add elements to settings content
        settingsContent.appendChild(settingsElements.aiServiceGroup);
        settingsContent.appendChild(settingsElements.apiKeyGroup);
        settingsContent.appendChild(settingsElements.endpointGroup);
        settingsContent.appendChild(settingsElements.langGroup);
        settingsContent.appendChild(settingsElements.saveSettingsBtn);

        // Load saved settings into form
        SettingsManager.loadSettingsIntoForm(settingsElements);

        // Set up event listeners
        SettingsManager.setupSettingsListeners(settingsElements, () => {
            SettingsManager.showSaveSuccess(settingsContent);
        });

        settingsSection.appendChild(settingsToggle);
        settingsSection.appendChild(settingsContent);

        return settingsSection;
    };

    /**
     * Creates the action footer with language badge and get help button
     * @returns {HTMLElement} The action footer element
     */
    const createActionFooter = () => {
        const actions = document.createElement('div');
        actions.className = 'card-footer d-flex justify-content-between';

        const langBadge = document.createElement('span');
        langBadge.id = 'current-lang-badge';
        langBadge.className = 'badge bg-secondary align-self-center';
        langBadge.textContent = 'auto';

        const getHelpBtn = document.createElement('button');
        getHelpBtn.textContent = 'Get AI Help';
        getHelpBtn.className = 'btn btn-primary';
        getHelpBtn.id = 'get-ai-help-btn';

        actions.appendChild(langBadge);
        actions.appendChild(getHelpBtn);

        return actions;
    };

    /**
     * Creates the toggle button for minimized state
     * @returns {HTMLElement} The toggle button element
     */
    const createToggleButton = () => {
        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'ai-helper-toggle';
        toggleBtn.className = 'ai-helper-toggle';
        toggleBtn.textContent = 'AI';
        toggleBtn.addEventListener('click', () => {
            if (aiHelperPanel) {
                aiHelperPanel.classList.remove('minimized');
            }
        });

        return toggleBtn;
    };

    /**
     * Ensures Bootstrap JS is loaded for interactive components
     */
    const ensureBootstrapJsLoaded = () => {
        if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
            const bootstrapScript = document.createElement('script');
            bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
            bootstrapScript.integrity = 'sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz';
            bootstrapScript.crossOrigin = 'anonymous';
            document.body.appendChild(bootstrapScript);
        }
    };

    /**
     * Shows initial help content in the panel
     */
    const showInitialHelp = () => {
        const content = aiHelperPanel.querySelector('.card-body');
        if (!content) return;

        content.innerHTML = '';

        const helpText = document.createElement('div');
        helpText.className = 'p-2';
        helpText.innerHTML = `
      <h4 class="h5 mb-3">How can AI help you with this problem?</h4>
      <ul class="list-group list-group-flush mb-3">
        <li class="list-group-item bg-transparent">Understand the problem statement</li>
        <li class="list-group-item bg-transparent">Get hints without full solutions</li>
        <li class="list-group-item bg-transparent">See implementation strategies</li>
        <li class="list-group-item bg-transparent">Debug your approach</li>
      </ul>
      <p class="text-center mb-0">Click "Get AI Help" to start.</p>
    `;

        content.appendChild(helpText);
    };

    /**
     * Shows loading state in the panel
     * @param {string} message Loading message to display
     */
    const showLoading = (message = 'Getting AI assistance...') => {
        const content = aiHelperPanel.querySelector('.card-body');
        if (!content) return;

        content.innerHTML = '';

        const loading = document.createElement('div');
        loading.className = 'text-center my-4';
        loading.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">${message}</p>
    `;

        content.appendChild(loading);
    };

    /**
     * Shows error message in the panel
     * @param {string} errorMsg Error message to display
     * @param {Function} retryCallback Function to call when retry is clicked
     */
    const showError = (errorMsg, retryCallback) => {
        const content = aiHelperPanel.querySelector('.card-body');
        if (!content) return;

        content.innerHTML = '';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mx-3 my-4';
        errorDiv.innerHTML = `
      <h5 class="alert-heading">Error</h5>
      <p>${errorMsg || "An error occurred while getting AI assistance."}</p>
    `;

        if (retryCallback && typeof retryCallback === 'function') {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn btn-outline-danger mt-2';
            retryBtn.textContent = 'Try Again';
            retryBtn.addEventListener('click', retryCallback);
            errorDiv.appendChild(retryBtn);
        }

        content.appendChild(errorDiv);
    };

    /**
     * Shows API key missing error and focuses on settings
     */
    const showApiKeyError = () => {
        const content = aiHelperPanel.querySelector('.card-body');
        if (!content) return;

        content.innerHTML = '';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-warning mx-3 my-4';
        errorDiv.innerHTML = `
      <h5 class="alert-heading">API Key Required</h5>
      <p>Please set your API key in the settings section below.</p>
    `;
        content.appendChild(errorDiv);

        // Auto-expand settings
        const settingsToggle = document.querySelector('[data-bs-target="#aiHelperSettings"]');
        const settingsContent = document.getElementById('aiHelperSettings');

        if (settingsToggle && settingsContent) {
            settingsContent.classList.add('show');
            settingsToggle.setAttribute('aria-expanded', 'true');
        }
    };

    /**
     * Displays the AI response in the panel
     * @param {Object} responseData The AI response data
     */
    const displayAiResponse = (responseData) => {
        if (!aiHelperPanel) return;

        const content = aiHelperPanel.querySelector('.card-body');
        if (!content) return;

        content.innerHTML = '';

        // Create response container
        const responseContainer = document.createElement('div');
        responseContainer.className = 'ai-response';

        // Format and display the AI response
        responseContainer.innerHTML = `
      <h4 class="h5 mb-3">AI Assistant</h4>
      <div class="ai-response-content mb-3">${TextProcessor.formatAiResponse(responseData.content)}</div>
    `;

        // Add copy buttons for code blocks
        const codeBlocks = responseContainer.querySelectorAll('.ai-code-block');
        codeBlocks.forEach(block => {
            const code = block.querySelector('code');
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-sm btn-outline-light copy-code-btn';
            copyBtn.innerHTML = '<small>Copy</small>';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(code.textContent)
                    .then(() => {
                        copyBtn.innerHTML = '<small>Copied!</small>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<small>Copy</small>';
                        }, 2000);
                    });
            });

            block.appendChild(copyBtn);
        });

        content.appendChild(responseContainer);

        // Add feedback buttons
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'border-top mt-4 pt-3 text-center';
        feedbackDiv.innerHTML = `
      <p class="mb-2">Was this helpful?</p>
      <div class="d-flex justify-content-center gap-2">
        <button class="btn btn-sm btn-outline-success feedback-btn" data-value="helpful">👍 Yes</button>
        <button class="btn btn-sm btn-outline-danger feedback-btn" data-value="not-helpful">👎 No</button>
      </div>
    `;

        // Add event listeners to feedback buttons
        feedbackDiv.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.target.getAttribute('data-value');

                // Send feedback message to background script
                chrome.runtime.sendMessage({
                    action: "SUBMIT_FEEDBACK",
                    feedback: {
                        value: value,
                        problemSlug: ProblemDetector.getProblemSlug(),
                        timestamp: new Date().toISOString()
                    }
                });

                // Update UI to show feedback was recorded
                feedbackDiv.innerHTML = '<p class="my-2 text-success">Thanks for your feedback!</p>';
            });
        });

        content.appendChild(feedbackDiv);
    };

    /**
     * Updates the language badge with current language
     * @param {string} language Language to display
     */
    const updateLanguageBadge = (language) => {
        const badge = document.getElementById('current-lang-badge');
        if (badge) {
            badge.textContent = language || 'auto';
        }
    };

    /**
     * Gets the AI helper panel element
     * @returns {HTMLElement|null} The panel element or null if not created
     */
    const getPanel = () => {
        return aiHelperPanel;
    };

    // Public API
    return {
        createAIHelperPanel,
        showLoading,
        showError,
        showApiKeyError,
        displayAiResponse,
        updateLanguageBadge,
        getPanel
    };
})();

// Make it available in the global scope for other modules
window.UIManager = UIManager;
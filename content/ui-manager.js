/**
 * ui-manager.js
 * Manages the UI components of the extension following SOLID principles
 */

const UIManager = (() => {
    // Reference to the main panel
    let aiHelperPanel = null;

    /**
     * Creates and injects the AI Helper Panel UI
     * @returns {Promise<HTMLElement>} The created panel
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

        // Create actions footer
        const actions = createActionFooter();

        // Get the settings form elements and load settings
        const settings = await createAndLoadSettings();

        // Assemble panel
        aiHelperPanel.appendChild(header);
        aiHelperPanel.appendChild(content);
        aiHelperPanel.appendChild(settings);
        aiHelperPanel.appendChild(actions);

        // Create toggle button for minimized state
        const toggleBtn = createToggleButton();

        // Inject components into the page
        document.body.appendChild(aiHelperPanel);
        document.body.appendChild(toggleBtn);

        // Initialize settings from storage
        const userSettings = await StorageUtils.getSettings();
        if (userSettings.minimizedByDefault) {
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
     * Creates and configures settings section
     * @returns {Promise<HTMLElement>} Settings section element
     */
    const createAndLoadSettings = async () => {
        const settingsSection = document.createElement('div');
        settingsSection.className = 'p-3 border-top';

        // Simple panel that's always visible
        const settingsHeader = document.createElement('h6');
        settingsHeader.className = 'mb-3';
        settingsHeader.textContent = 'Settings';

        // Create inline form with simpler layout
        const form = document.createElement('form');
        form.className = 'settings-form';

        // Create form elements
        const formElements = createSettingsFormElements();

        // Add all form elements to the form
        Object.values(formElements.groups).forEach(group => {
            form.appendChild(group);
        });

        // Add save button
        form.appendChild(formElements.saveSettingsBtn);

        // Add form to settings section
        settingsSection.appendChild(settingsHeader);
        settingsSection.appendChild(form);

        // Load saved settings
        const settings = await StorageUtils.getSettings();
        updateFormWithSettings(formElements, settings);

        // Set up event handlers
        setupSettingsEventHandlers(formElements);

        return settingsSection;
    };

    /**
     * Creates the settings form elements
     * @returns {Object} Object containing form elements and groups
     */
    const createSettingsFormElements = () => {
        // AI Service Selection
        const aiServiceGroup = document.createElement('div');
        aiServiceGroup.className = 'mb-2';

        const aiServiceLabel = document.createElement('label');
        aiServiceLabel.className = 'form-label d-block mb-1';
        aiServiceLabel.setAttribute('for', 'ai-service-select');
        aiServiceLabel.textContent = 'AI Service';

        const aiServiceSelect = document.createElement('select');
        aiServiceSelect.className = 'form-select form-select-sm';
        aiServiceSelect.id = 'ai-service-select';

        // Add AI service options
        SettingsManager.AI_SERVICES.forEach(service => {
            const option = document.createElement('option');
            option.value = service.value;
            option.textContent = service.label;
            aiServiceSelect.appendChild(option);
        });

        aiServiceGroup.appendChild(aiServiceLabel);
        aiServiceGroup.appendChild(aiServiceSelect);

        // API Key input
        const apiKeyGroup = document.createElement('div');
        apiKeyGroup.className = 'mb-2';

        const apiKeyLabel = document.createElement('label');
        apiKeyLabel.className = 'form-label d-block mb-1';
        apiKeyLabel.setAttribute('for', 'ai-api-key');
        apiKeyLabel.textContent = 'API Key';

        const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'password';
        apiKeyInput.className = 'form-control form-control-sm';
        apiKeyInput.id = 'ai-api-key';
        apiKeyInput.placeholder = 'Enter your API key';

        apiKeyGroup.appendChild(apiKeyLabel);
        apiKeyGroup.appendChild(apiKeyInput);

        // Custom endpoint input
        const endpointGroup = document.createElement('div');
        endpointGroup.className = 'mb-2';
        endpointGroup.id = 'custom-endpoint-group';
        endpointGroup.style.display = 'none';

        const endpointLabel = document.createElement('label');
        endpointLabel.className = 'form-label d-block mb-1';
        endpointLabel.setAttribute('for', 'ai-endpoint');
        endpointLabel.textContent = 'Custom Endpoint';

        const endpointInput = document.createElement('input');
        endpointInput.type = 'text';
        endpointInput.className = 'form-control form-control-sm';
        endpointInput.id = 'ai-endpoint';
        endpointInput.placeholder = 'https://your-api-endpoint.com';

        endpointGroup.appendChild(endpointLabel);
        endpointGroup.appendChild(endpointInput);

        // Language selection
        const langGroup = document.createElement('div');
        langGroup.className = 'mb-2';

        const langLabel = document.createElement('label');
        langLabel.className = 'form-label d-block mb-1';
        langLabel.setAttribute('for', 'solution-lang-select');
        langLabel.textContent = 'Solution Language';

        const langSelect = document.createElement('select');
        langSelect.className = 'form-select form-select-sm';
        langSelect.id = 'solution-lang-select';

        // Add programming language options
        SettingsManager.PROGRAMMING_LANGUAGES.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.value;
            option.textContent = lang.label;
            langSelect.appendChild(option);
        });

        langGroup.appendChild(langLabel);
        langGroup.appendChild(langSelect);

        // Save button
        const saveSettingsBtn = document.createElement('button');
        saveSettingsBtn.type = 'button';
        saveSettingsBtn.className = 'btn btn-primary btn-sm w-100 mt-2';
        saveSettingsBtn.id = 'save-settings-btn';
        saveSettingsBtn.textContent = 'Save Settings';

        return {
            groups: {
                aiServiceGroup,
                apiKeyGroup,
                endpointGroup,
                langGroup
            },
            elements: {
                aiServiceSelect,
                apiKeyInput,
                endpointInput,
                langSelect
            },
            saveSettingsBtn
        };
    };

    /**
     * Updates form elements with saved settings
     * @param {Object} formElements Form elements
     * @param {Object} settings Settings object
     */
    const updateFormWithSettings = (formElements, settings) => {
        const { elements } = formElements;

        if (elements.aiServiceSelect && settings.aiService) {
            elements.aiServiceSelect.value = settings.aiService;

            // Show/hide custom endpoint based on selected service
            if (settings.aiService === 'custom') {
                formElements.groups.endpointGroup.style.display = 'block';
            } else {
                formElements.groups.endpointGroup.style.display = 'none';
            }
        }

        if (elements.apiKeyInput && settings.apiKey) {
            elements.apiKeyInput.value = settings.apiKey;
        }

        if (elements.endpointInput && settings.endpoint) {
            elements.endpointInput.value = settings.endpoint;
        }

        if (elements.langSelect && settings.solutionLanguage) {
            elements.langSelect.value = settings.solutionLanguage;
        }
    };

    /**
     * Sets up event handlers for settings form
     * @param {Object} formElements Form elements
     */
    const setupSettingsEventHandlers = (formElements) => {
        const { elements, saveSettingsBtn } = formElements;

        // Toggle custom endpoint visibility
        elements.aiServiceSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                formElements.groups.endpointGroup.style.display = 'block';
            } else {
                formElements.groups.endpointGroup.style.display = 'none';
            }
        });

        // Save settings button
        saveSettingsBtn.addEventListener('click', async () => {
            const settings = {
                aiService: elements.aiServiceSelect.value,
                apiKey: elements.apiKeyInput.value,
                endpoint: elements.aiServiceSelect.value === 'custom' ? elements.endpointInput.value : '',
                solutionLanguage: elements.langSelect.value,
                minimizedByDefault: false // Default value
            };

            // Save settings
            await StorageUtils.saveSettings(settings);

            // Show success message
            showSettingsSaveSuccess(saveSettingsBtn);
        });
    };

    /**
     * Shows success message after settings save
     * @param {HTMLElement} element Element to show success message near
     */
    const showSettingsSaveSuccess = (element) => {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success mt-2 py-1 small';
        successMessage.textContent = 'Settings saved!';

        // Add to DOM after the element
        element.parentNode.insertBefore(successMessage, element.nextSibling);

        // Remove after delay
        setTimeout(() => {
            successMessage.remove();
        }, 2000);
    };

    /**
     * Creates the action footer with language badge and get help button
     * @returns {HTMLElement} The action footer element
     */
    const createActionFooter = () => {
        const actions = document.createElement('div');
        actions.className = 'card-footer d-flex justify-content-between align-items-center';

        // Create language label and badge in a container
        const langContainer = document.createElement('div');
        langContainer.className = 'd-flex align-items-center';

        const langLabel = document.createElement('span');
        langLabel.className = 'me-2 small';
        langLabel.textContent = 'Language:';

        const langBadge = document.createElement('span');
        langBadge.id = 'current-lang-badge';
        langBadge.className = 'badge bg-secondary';
        langBadge.textContent = 'auto';

        langContainer.appendChild(langLabel);
        langContainer.appendChild(langBadge);

        // Create help button
        const getHelpBtn = document.createElement('button');
        getHelpBtn.textContent = 'Get AI Help';
        getHelpBtn.className = 'btn btn-primary btn-sm';
        getHelpBtn.id = 'get-ai-help-btn';

        // Add elements to footer
        actions.appendChild(langContainer);
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
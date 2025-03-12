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

        // Create settings toggle and content
        const settingsSection = await createCollapsibleSettings();

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
     * Creates and configures collapsible settings section
     * @returns {Promise<HTMLElement>} Settings section element
     */
    const createCollapsibleSettings = async () => {
        const settingsSection = document.createElement('div');
        settingsSection.className = 'border-top';

        // Create the toggle header
        const settingsToggle = document.createElement('button');
        settingsToggle.className = 'toggle-btn w-100 text-start p-3';
        settingsToggle.type = 'button';
        settingsToggle.innerHTML = '⚙️ <span class="ms-2">Settings</span>';

        // Create the collapsible content
        const settingsContent = document.createElement('div');
        settingsContent.id = 'settings-content';
        settingsContent.className = 'p-3 settings-content collapsed';

        // Add toggle event
        settingsToggle.addEventListener('click', () => {
            settingsContent.classList.toggle('collapsed');
            settingsToggle.innerHTML = settingsContent.classList.contains('collapsed')
                ? '⚙️ <span class="ms-2">Show Settings</span>'
                : '⚙️ <span class="ms-2">Hide Settings</span>';
        });

        // Create form elements
        const formElements = createSettingsFormElements();

        // Add container to the settings content
        settingsContent.appendChild(formElements.groups.formContainer);

        // Add endpoint container after the main form elements
        settingsContent.appendChild(formElements.groups.endpointContainer);

        // Add save button
        settingsContent.appendChild(formElements.saveSettingsBtn);

        // Assemble the settings section
        settingsSection.appendChild(settingsToggle);
        settingsSection.appendChild(settingsContent);

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
        // Create a container with a grid layout
        const formContainer = document.createElement('div');
        formContainer.style.display = 'grid';
        formContainer.style.gridTemplateColumns = '120px 1fr';
        formContainer.style.rowGap = '12px';
        formContainer.style.columnGap = '10px';
        formContainer.style.alignItems = 'center';
        formContainer.style.marginBottom = '12px';

        // AI Service Selection
        const aiServiceLabel = document.createElement('label');
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

        // API Key input
        const apiKeyLabel = document.createElement('label');
        apiKeyLabel.setAttribute('for', 'ai-api-key');
        apiKeyLabel.textContent = 'API Key';

        const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'password';
        apiKeyInput.className = 'form-control form-control-sm';
        apiKeyInput.id = 'ai-api-key';
        apiKeyInput.placeholder = 'Enter your API key';

        // Ollama endpoint input
        const endpointLabel = document.createElement('label');
        endpointLabel.setAttribute('for', 'ai-endpoint');
        endpointLabel.textContent = 'Endpoint URL';

        const endpointInput = document.createElement('input');
        endpointInput.type = 'text';
        endpointInput.className = 'form-control form-control-sm';
        endpointInput.id = 'ai-endpoint';
        endpointInput.placeholder = 'http://localhost:11434/api/generate';

        // Create endpoint container for conditional display
        const endpointContainer = document.createElement('div');
        endpointContainer.id = 'ollama-endpoint-group';
        endpointContainer.style.display = 'none';
        endpointContainer.style.gridColumn = '1 / span 2';

        const endpointGrid = document.createElement('div');
        endpointGrid.style.display = 'grid';
        endpointGrid.style.gridTemplateColumns = '120px 1fr';
        endpointGrid.style.columnGap = '10px';
        endpointGrid.style.alignItems = 'center';

        endpointGrid.appendChild(endpointLabel);
        endpointGrid.appendChild(endpointInput);
        endpointContainer.appendChild(endpointGrid);

        // Language selection
        const langLabel = document.createElement('label');
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

        // Save button - full width
        const saveSettingsBtn = document.createElement('button');
        saveSettingsBtn.type = 'button';
        saveSettingsBtn.className = 'btn btn-primary btn-sm w-100 mt-2';
        saveSettingsBtn.id = 'save-settings-btn';
        saveSettingsBtn.textContent = 'Save Settings';
        saveSettingsBtn.style.gridColumn = '1 / span 2';

        // Assemble the grid
        formContainer.appendChild(aiServiceLabel);
        formContainer.appendChild(aiServiceSelect);
        formContainer.appendChild(apiKeyLabel);
        formContainer.appendChild(apiKeyInput);
        formContainer.appendChild(langLabel);
        formContainer.appendChild(langSelect);

        // Return elements in an object structure
        return {
            groups: {
                formContainer,
                endpointContainer
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
                formElements.groups.endpointContainer.style.display = 'grid';
            } else {
                formElements.groups.endpointContainer.style.display = 'none';
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

        // Toggle visibility based on service
        elements.aiServiceSelect.addEventListener('change', function() {
            if (this.value === 'ollama') {
                formElements.groups.endpointContainer.style.display = 'grid';

                // Hide API key since it's not needed for Ollama
                const apiKeyRow = elements.apiKeyInput.closest('.grid-row');
                if (apiKeyRow) {
                    apiKeyRow.style.display = 'none';
                } else {
                    // Fallback if we can't find the row
                    elements.apiKeyInput.style.display = 'none';
                    elements.apiKeyInput.previousElementSibling.style.display = 'none';
                }
            } else {
                formElements.groups.endpointContainer.style.display = 'none';

                // Show API key for other services
                const apiKeyRow = elements.apiKeyInput.closest('.grid-row');
                if (apiKeyRow) {
                    apiKeyRow.style.display = 'grid';
                } else {
                    // Fallback if we can't find the row
                    elements.apiKeyInput.style.display = 'block';
                    elements.apiKeyInput.previousElementSibling.style.display = 'block';
                }
            }
        });

        // Save settings button
        saveSettingsBtn.addEventListener('click', async () => {
            const isOllama = elements.aiServiceSelect.value === 'ollama';

            const settings = {
                aiService: elements.aiServiceSelect.value,
                apiKey: isOllama ? '' : elements.apiKeyInput.value,
                endpoint: isOllama ? elements.endpointInput.value : '',
                solutionLanguage: elements.langSelect.value,
                minimizedByDefault: false // Default value
            };

            // Save settings
            await StorageUtils.saveSettings(settings);

            // Show success message
            showSettingsSaveSuccess(saveSettingsBtn);

            // Update the menu with the new language
            showInitialHelp();
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
     * Shows initial help content in the panel with buttons for each action
     */
    const showInitialHelp = async () => {
        const content = aiHelperPanel.querySelector('.card-body');
        if (!content) return;

        content.innerHTML = '';

        // Get current language setting for button text
        const settings = await StorageUtils.getSettings();
        const language = settings.solutionLanguage === 'auto' ? 'detected language' : settings.solutionLanguage;

        const helpText = document.createElement('div');
        helpText.className = 'p-2';

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'block';
        buttonsContainer.style.marginBottom = '20px';

        // Create "Rephrase problem" button - blue
        const rephraseBtn = document.createElement('button');
        rephraseBtn.style.display = 'block';
        rephraseBtn.style.width = '100%';
        rephraseBtn.style.padding = '12px';
        rephraseBtn.style.marginBottom = '15px';
        rephraseBtn.style.backgroundColor = '#2196F3'; // Bright blue
        rephraseBtn.style.color = 'white';
        rephraseBtn.style.fontWeight = 'bold';
        rephraseBtn.style.border = 'none';
        rephraseBtn.style.borderRadius = '4px';
        rephraseBtn.style.cursor = 'pointer';
        rephraseBtn.style.fontSize = '16px';
        rephraseBtn.textContent = 'Rephrase problem';
        rephraseBtn.id = 'rephrase-problem-btn';
        buttonsContainer.appendChild(rephraseBtn);

        // Create "Get just hints" button - orange
        const hintsBtn = document.createElement('button');
        hintsBtn.style.display = 'block';
        hintsBtn.style.width = '100%';
        hintsBtn.style.padding = '12px';
        hintsBtn.style.marginBottom = '15px';
        hintsBtn.style.backgroundColor = '#FF9800'; // Bright orange
        hintsBtn.style.color = 'black';
        hintsBtn.style.fontWeight = 'bold';
        hintsBtn.style.border = 'none';
        hintsBtn.style.borderRadius = '4px';
        hintsBtn.style.cursor = 'pointer';
        hintsBtn.style.fontSize = '16px';
        hintsBtn.textContent = 'Get just hints';
        hintsBtn.id = 'get-hints-btn';
        buttonsContainer.appendChild(hintsBtn);

        // Create "Full solution" button - green
        const solutionBtn = document.createElement('button');
        solutionBtn.style.display = 'block';
        solutionBtn.style.width = '100%';
        solutionBtn.style.padding = '12px';
        solutionBtn.style.backgroundColor = '#4CAF50'; // Bright green
        solutionBtn.style.color = 'white';
        solutionBtn.style.fontWeight = 'bold';
        solutionBtn.style.border = 'none';
        solutionBtn.style.borderRadius = '4px';
        solutionBtn.style.cursor = 'pointer';
        solutionBtn.style.fontSize = '16px';
        solutionBtn.textContent = `Full solution in ${language}`;
        solutionBtn.id = 'full-solution-btn';
        buttonsContainer.appendChild(solutionBtn);

        helpText.appendChild(buttonsContainer);
        content.appendChild(helpText);
    };

    /**
     * Creates an empty action footer (removed language badge and button)
     * @returns {HTMLElement} The action footer element
     */
    const createActionFooter = () => {
        const actions = document.createElement('div');
        actions.className = 'card-footer d-flex justify-content-end';
        actions.style.display = 'none'; // Hide footer completely
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
    /**
     * Shows API key missing error and focuses on settings
     */
    const showApiKeyError = async () => {
        const content = aiHelperPanel.querySelector('.card-body');
        if (!content) return;

        // Get current settings to determine which service is selected
        const settings = await StorageUtils.getSettings();
        const isOllama = settings.aiService === 'ollama';

        content.innerHTML = '';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-warning mx-3 my-4';

        if (isOllama) {
            errorDiv.innerHTML = `
            <h5 class="alert-heading">Ollama Endpoint Required</h5>
            <p>Please set the Ollama endpoint URL in the settings section below.</p>
        `;
        } else {
            errorDiv.innerHTML = `
            <h5 class="alert-heading">API Key Required</h5>
            <p>Please set your API key in the settings section below.</p>
        `;
        }

        content.appendChild(errorDiv);

        // Expand settings if they're collapsed
        const settingsContent = document.getElementById('settings-content');
        const settingsToggle = settingsContent.previousElementSibling;

        if (settingsContent.classList.contains('collapsed')) {
            settingsContent.classList.remove('collapsed');
            settingsToggle.innerHTML = '⚙️ <span class="ms-2">Hide Settings</span>';
        }

        // Focus on the appropriate input field
        if (isOllama) {
            const endpointInput = document.getElementById('ai-endpoint');
            if (endpointInput) {
                endpointInput.focus();
            }
        } else {
            const apiKeyInput = document.getElementById('ai-api-key');
            if (apiKeyInput) {
                apiKeyInput.focus();
            }
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

        // Add back button
        const backButton = document.createElement('button');
        backButton.className = 'btn btn-sm btn-outline-secondary mt-3';
        backButton.textContent = 'Back to menu';
        backButton.addEventListener('click', showInitialHelp);
        content.appendChild(backButton);

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
        // Language badge has been removed, but keep the function
        // for compatibility with existing code
        return;
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
        getPanel,
        showInitialHelp
    };
})();

// Make it available in the global scope for other modules
window.UIManager = UIManager;
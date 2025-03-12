/**
 * settings-manager.js
 * Manages user settings for the extension
 */

const SettingsManager = (() => {
    // Supported AI services
    const AI_SERVICES = [
        { value: 'openai', label: 'OpenAI (GPT)' },
        { value: 'anthropic', label: 'Anthropic (Claude)' },
        { value: 'gemini', label: 'Google (Gemini)' },
        { value: 'custom', label: 'Custom Endpoint' }
    ];

    // Supported programming languages
    const PROGRAMMING_LANGUAGES = [
        { value: 'auto', label: 'Auto-detect (from page)' },
        { value: 'java', label: 'Java' },
        { value: 'python', label: 'Python' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'cpp', label: 'C++' },
        { value: 'c', label: 'C' },
        { value: 'csharp', label: 'C#' },
        { value: 'go', label: 'Go' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'rust', label: 'Rust' },
        { value: 'swift', label: 'Swift' },
        { value: 'kotlin', label: 'Kotlin' }
    ];

    /**
     * Creates settings form elements
     * @returns {Object} Object containing form elements
     */
    const createSettingsElements = () => {
        // AI Service Selection
        const aiServiceGroup = document.createElement('div');
        aiServiceGroup.className = 'mb-3';
        aiServiceGroup.style.marginBottom = '1rem'; // Ensure margin is applied

        const aiServiceLabel = document.createElement('label');
        aiServiceLabel.setAttribute('for', 'ai-service-select');
        aiServiceLabel.textContent = 'AI Service';
        aiServiceLabel.style.display = 'block'; // Ensure label is visible
        aiServiceLabel.style.marginBottom = '0.5rem';

        const aiServiceSelect = document.createElement('select');
        aiServiceSelect.id = 'ai-service-select';
        aiServiceSelect.style.display = 'block'; // Ensure select is visible
        aiServiceSelect.style.width = '100%';
        aiServiceSelect.style.padding = '0.375rem 0.75rem';
        aiServiceSelect.style.border = '1px solid #495057';
        aiServiceSelect.style.borderRadius = '0.25rem';
        aiServiceSelect.style.backgroundColor = '#2b3035';
        aiServiceSelect.style.color = '#f8f9fa';

        // Add options with inline styles
        AI_SERVICES.forEach(service => {
            const option = document.createElement('option');
            option.value = service.value;
            option.textContent = service.label;
            aiServiceSelect.appendChild(option);
        });

        // API Key input
        const apiKeyGroup = document.createElement('div');
        apiKeyGroup.className = 'mb-3';

        const apiKeyLabel = document.createElement('label');
        apiKeyLabel.className = 'form-label';
        apiKeyLabel.setAttribute('for', 'ai-api-key');
        apiKeyLabel.textContent = 'API Key';

        const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'password';
        apiKeyInput.className = 'form-control form-control-sm';
        apiKeyInput.id = 'ai-api-key';
        apiKeyInput.placeholder = 'Enter your API key';

        // Custom endpoint input (initially hidden)
        const endpointGroup = document.createElement('div');
        endpointGroup.className = 'mb-3 d-none';
        endpointGroup.id = 'custom-endpoint-group';

        const endpointLabel = document.createElement('label');
        endpointLabel.className = 'form-label';
        endpointLabel.setAttribute('for', 'ai-endpoint');
        endpointLabel.textContent = 'Custom Endpoint';

        const endpointInput = document.createElement('input');
        endpointInput.type = 'text';
        endpointInput.className = 'form-control form-control-sm';
        endpointInput.id = 'ai-endpoint';
        endpointInput.placeholder = 'https://your-api-endpoint.com';

        // Language selection for solutions
        const langGroup = document.createElement('div');
        langGroup.className = 'mb-3';

        const langLabel = document.createElement('label');
        langLabel.className = 'form-label';
        langLabel.setAttribute('for', 'solution-lang-select');
        langLabel.textContent = 'Solution Language';

        const langSelect = document.createElement('select');
        langSelect.className = 'form-select form-select-sm';
        langSelect.id = 'solution-lang-select';

        // Add programming language options
        PROGRAMMING_LANGUAGES.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.value;
            option.textContent = lang.label;
            langSelect.appendChild(option);
        });

        // Save settings button
        const saveSettingsBtn = document.createElement('button');
        saveSettingsBtn.className = 'btn btn-sm btn-primary w-100';
        saveSettingsBtn.textContent = 'Save Settings';
        saveSettingsBtn.id = 'save-settings-btn';

        // Assemble groups
        aiServiceGroup.appendChild(aiServiceLabel);
        aiServiceGroup.appendChild(aiServiceSelect);

        apiKeyGroup.appendChild(apiKeyLabel);
        apiKeyGroup.appendChild(apiKeyInput);

        endpointGroup.appendChild(endpointLabel);
        endpointGroup.appendChild(endpointInput);

        langGroup.appendChild(langLabel);
        langGroup.appendChild(langSelect);

        // Return all elements in an object
        return {
            aiServiceGroup,
            apiKeyGroup,
            endpointGroup,
            langGroup,
            saveSettingsBtn,
            aiServiceSelect,
            apiKeyInput,
            endpointInput,
            langSelect
        };
    };

    /**
     * Loads settings into form elements
     * @param {Object} elements Form elements
     */
    const loadSettingsIntoForm = async (elements) => {
        const settings = await StorageUtils.getSettings();

        // Update form values with saved settings
        if (elements.aiServiceSelect && settings.aiService) {
            elements.aiServiceSelect.value = settings.aiService;
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

        // Show/hide custom endpoint based on selected service
        if (elements.endpointGroup) {
            if (elements.aiServiceSelect.value === 'custom') {
                elements.endpointGroup.classList.remove('d-none');
            } else {
                elements.endpointGroup.classList.add('d-none');
            }
        }
    };

    /**
     * Sets up event listeners for settings form
     * @param {Object} elements Form elements
     * @param {Function} onSaved Callback when settings are saved
     */
    const setupSettingsListeners = (elements, onSaved) => {
        // Show/hide custom endpoint based on AI service selection
        if (elements.aiServiceSelect && elements.endpointGroup) {
            elements.aiServiceSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    elements.endpointGroup.classList.remove('d-none');
                } else {
                    elements.endpointGroup.classList.add('d-none');
                }
            });
        }

        // Save settings when button is clicked
        if (elements.saveSettingsBtn) {
            elements.saveSettingsBtn.addEventListener('click', async () => {
                await saveCurrentSettings(elements);
                if (onSaved && typeof onSaved === 'function') {
                    onSaved();
                }
            });
        }
    };

    /**
     * Saves current settings from form
     * @param {Object} elements Form elements
     * @returns {Promise<Object>} Saved settings
     */
    const saveCurrentSettings = async (elements) => {
        const settings = {
            aiService: elements.aiServiceSelect ? elements.aiServiceSelect.value : 'openai',
            apiKey: elements.apiKeyInput ? elements.apiKeyInput.value : '',
            endpoint: elements.aiServiceSelect && elements.aiServiceSelect.value === 'custom' ?
                (elements.endpointInput ? elements.endpointInput.value : '') : '',
            solutionLanguage: elements.langSelect ? elements.langSelect.value : 'auto',
            minimizedByDefault: false // Default value
        };

        // Save to storage
        await StorageUtils.saveSettings(settings);
        return settings;
    };

    /**
     * Shows success message after settings are saved
     * @param {HTMLElement} container Element to append success message to
     */
    const showSaveSuccess = (container) => {
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success mt-2 mb-0 py-2';
        successAlert.textContent = 'Settings saved!';

        container.appendChild(successAlert);

        // Remove the success message after a delay
        setTimeout(() => {
            successAlert.remove();
        }, 2000);
    };

    /**
     * Gets target language for solution based on settings and detected language
     * @param {Object} problemData Problem data with detected language
     * @returns {Promise<string>} Target language for solution
     */
    const getTargetLanguage = async (problemData) => {
        const settings = await StorageUtils.getSettings();
        const selectedLanguage = settings.solutionLanguage || 'auto';

        // If language is set to auto, use the detected language or default to python
        return selectedLanguage === 'auto' ?
            (problemData.language || 'python') :
            selectedLanguage;
    };

    // Public API
    return {
        createSettingsElements,
        loadSettingsIntoForm,
        setupSettingsListeners,
        saveCurrentSettings,
        showSaveSuccess,
        getTargetLanguage,
        AI_SERVICES,
        PROGRAMMING_LANGUAGES
    };
})();

/**
 * Updates the language badge after saving settings
 * @param {Object} settings The saved settings
 */
const updateUIAfterSave = (settings) => {
    // Get the language badge element
    const langBadge = document.getElementById('current-lang-badge');
    if (langBadge) {
        // Update the badge text based on the selected language
        const language = settings.solutionLanguage === 'auto' ? 'auto' : settings.solutionLanguage;
        langBadge.textContent = language;
    }
};

// Then modify the saveCurrentSettings function to call this function
const saveCurrentSettings = async (elements) => {
    const settings = {
        aiService: elements.aiServiceSelect ? elements.aiServiceSelect.value : 'openai',
        apiKey: elements.apiKeyInput ? elements.apiKeyInput.value : '',
        endpoint: elements.aiServiceSelect && elements.aiServiceSelect.value === 'custom' ?
            (elements.endpointInput ? elements.endpointInput.value : '') : '',
        solutionLanguage: elements.langSelect ? elements.langSelect.value : 'auto',
        minimizedByDefault: false // Default value
    };

    // Save to storage
    await StorageUtils.saveSettings(settings);

    // Update UI elements
    updateUIAfterSave(settings);

    return settings;
};


// Make it available in the global scope for other modules
window.SettingsManager = SettingsManager;
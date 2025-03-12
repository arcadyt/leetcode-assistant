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
        { value: 'ollama', label: 'DeepSeek on Ollama' }
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

        // Ollama endpoint input (initially hidden)
        const endpointGroup = document.createElement('div');
        endpointGroup.className = 'mb-3 d-none';
        endpointGroup.id = 'ollama-endpoint-group';

        const endpointLabel = document.createElement('label');
        endpointLabel.className = 'form-label';
        endpointLabel.setAttribute('for', 'ai-endpoint');
        endpointLabel.textContent = 'Endpoint URL';

        const endpointInput = document.createElement('input');
        endpointInput.type = 'text';
        endpointInput.className = 'form-control form-control-sm';
        endpointInput.id = 'ai-endpoint';
        endpointInput.placeholder = 'http://localhost:11434/api/generate';

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

        // Show/hide elements based on selected service
        updateFormVisibility(elements);
    };

    /**
     * Updates the visibility of form elements based on selected service
     * @param {Object} elements Form elements
     */
    const updateFormVisibility = (elements) => {
        // Hide/show API key based on service
        if (elements.apiKeyGroup && elements.aiServiceSelect) {
            if (elements.aiServiceSelect.value === 'ollama') {
                elements.apiKeyGroup.classList.add('d-none');
            } else {
                elements.apiKeyGroup.classList.remove('d-none');
            }
        }

        // Show/hide endpoint based on selected service
        if (elements.endpointGroup && elements.aiServiceSelect) {
            if (elements.aiServiceSelect.value === 'ollama') {
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
        // Update form visibility based on AI service selection
        if (elements.aiServiceSelect) {
            elements.aiServiceSelect.addEventListener('change', function() {
                updateFormVisibility(elements);
            });
        }

        // Save settings when button is clicked
        if (elements.saveSettingsBtn) {
            elements.saveSettingsBtn.addEventListener('click', async () => {
                const settings = await saveCurrentSettings(elements);
                if (onSaved && typeof onSaved === 'function') {
                    onSaved(settings);
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
        const isOllama = elements.aiServiceSelect && elements.aiServiceSelect.value === 'ollama';

        const settings = {
            aiService: elements.aiServiceSelect ? elements.aiServiceSelect.value : 'openai',
            apiKey: isOllama ? '' : (elements.apiKeyInput ? elements.apiKeyInput.value : ''),
            endpoint: isOllama ? (elements.endpointInput ? elements.endpointInput.value : '') : '',
            solutionLanguage: elements.langSelect ? elements.langSelect.value : 'auto',
            minimizedByDefault: false // Default value
        };

        // Save to storage
        await StorageUtils.saveSettings(settings);

        // Update the language badge in the UI
        updateLanguageBadge(settings.solutionLanguage);

        return settings;
    };

    /**
     * Updates the language badge in the UI
     * @param {string} language The language to display
     */
    const updateLanguageBadge = (language) => {
        // Find the language badge element
        const langBadge = document.getElementById('current-lang-badge');
        if (langBadge) {
            langBadge.textContent = language || 'auto';
        }
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
        updateLanguageBadge,
        updateFormVisibility,
        AI_SERVICES,
        PROGRAMMING_LANGUAGES
    };
})();

// Make it available in the global scope for other modules
window.SettingsManager = SettingsManager;
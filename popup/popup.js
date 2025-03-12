/**
 * Popup.js
 * Handles interactions in the extension popup
 */

// DOM Elements
const aiServiceSelect = document.getElementById('ai-service-select');
const apiKeyInput = document.getElementById('api-key');
const apiKeyGroup = document.getElementById('api-key-group');
const ollamaEndpointGroup = document.getElementById('ollama-endpoint-group');
const ollamaEndpointInput = document.getElementById('custom-endpoint');
const languageSelect = document.getElementById('solution-lang-select');
const saveButton = document.getElementById('save-settings');
const settingsToggle = document.getElementById('settings-toggle');
const settingsContent = document.getElementById('settings-content');

// Default settings
const DEFAULT_SETTINGS = {
    aiService: 'openai',
    apiKey: '',
    endpoint: '',
    solutionLanguage: 'auto',
    minimizedByDefault: false
};

/**
 * Load settings from storage
 */
function loadSettings() {
    chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || DEFAULT_SETTINGS;

        // Update UI with saved settings
        aiServiceSelect.value = settings.aiService || DEFAULT_SETTINGS.aiService;
        apiKeyInput.value = settings.apiKey || '';
        ollamaEndpointInput.value = settings.endpoint || '';
        languageSelect.value = settings.solutionLanguage || DEFAULT_SETTINGS.solutionLanguage;

        // Update form visibility based on selected service
        updateFormVisibility();
    });
}

/**
 * Toggle visibility of form elements based on selected AI service
 */
function updateFormVisibility() {
    if (aiServiceSelect.value === 'ollama') {
        ollamaEndpointGroup.classList.remove('d-none');
        apiKeyGroup.classList.add('d-none');
    } else {
        ollamaEndpointGroup.classList.add('d-none');
        apiKeyGroup.classList.remove('d-none');
    }
}

/**
 * Save settings to storage
 */
function saveSettings() {
    const isOllama = aiServiceSelect.value === 'ollama';

    const settings = {
        aiService: aiServiceSelect.value,
        apiKey: isOllama ? '' : apiKeyInput.value,
        endpoint: isOllama ? ollamaEndpointInput.value : '',
        solutionLanguage: languageSelect.value,
        minimizedByDefault: false // Default value
    };

    chrome.storage.local.set({ settings }, () => {
        // Show success message
        const successMessage = document.createElement('span');
        successMessage.className = 'save-success ms-2';
        successMessage.textContent = 'Saved!';

        saveButton.parentNode.appendChild(successMessage);

        // Remove the success message after a delay
        setTimeout(() => {
            successMessage.remove();
        }, 2000);

        // Auto-collapse settings after saving
        if (!settingsContent.classList.contains('collapsed')) {
            toggleSettings();
        }

        // Send message to update any open tabs with the new settings
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "SETTINGS_UPDATED",
                    settings: settings
                });
            }
        });
    });
}

/**
 * Toggle settings panel visibility
 */
function toggleSettings() {
    settingsContent.classList.toggle('collapsed');

    // Update the toggle button text/icon
    if (settingsContent.classList.contains('collapsed')) {
        settingsToggle.textContent = '⚙️ Show Settings';
    } else {
        settingsToggle.textContent = '⚙️ Hide Settings';
    }
}

/**
 * Initialize the popup
 */
function initialize() {
    // Load saved settings
    loadSettings();

    // Set up event listeners
    aiServiceSelect.addEventListener('change', updateFormVisibility);
    saveButton.addEventListener('click', saveSettings);

    // Add toggle functionality for settings
    settingsToggle.addEventListener('click', toggleSettings);

    // Start with settings collapsed by default
    if (!settingsContent.classList.contains('collapsed')) {
        toggleSettings();
    }
}

// Initialize when the popup is loaded
document.addEventListener('DOMContentLoaded', initialize);
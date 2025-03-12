/**
 * Popup.js
 * Handles interactions in the extension popup
 */

// DOM Elements
const aiServiceSelect = document.getElementById('ai-service-select');
const apiKeyInput = document.getElementById('api-key');
const customEndpointGroup = document.getElementById('custom-endpoint-group');
const customEndpointInput = document.getElementById('custom-endpoint');
const languageSelect = document.getElementById('solution-lang-select');
const saveButton = document.getElementById('save-settings');

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
        customEndpointInput.value = settings.endpoint || '';
        languageSelect.value = settings.solutionLanguage || DEFAULT_SETTINGS.solutionLanguage;

        // Show/hide custom endpoint based on selected service
        toggleCustomEndpointVisibility();
    });
}

/**
 * Toggle visibility of custom endpoint input based on selected AI service
 */
function toggleCustomEndpointVisibility() {
    if (aiServiceSelect.value === 'custom') {
        customEndpointGroup.classList.remove('d-none');
    } else {
        customEndpointGroup.classList.add('d-none');
    }
}

/**
 * Save settings to storage
 */
function saveSettings() {
    const settings = {
        aiService: aiServiceSelect.value,
        apiKey: apiKeyInput.value,
        endpoint: aiServiceSelect.value === 'custom' ? customEndpointInput.value : '',
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
        }, 4000);
    });
}

/**
 * Initialize the popup
 */
function initialize() {
    // Load saved settings
    loadSettings();

    // Set up event listeners
    aiServiceSelect.addEventListener('change', toggleCustomEndpointVisibility);
    saveButton.addEventListener('click', saveSettings);
}

// Initialize when the popup is loaded
document.addEventListener('DOMContentLoaded', initialize);
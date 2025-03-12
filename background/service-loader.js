/**
 * background/service-loader.js
 * Entry point for the background service worker
 */

// Import required service modules
import './services/base-adapter.js';
import './services/openai-adapter.js';
import './services/anthropic-adapter.js';
import './services/gemini-adapter.js';
import './services/custom-adapter.js';
import './services/adapter-factory.js';
import './services/prompt-builder.js';
import './services/ai-service.js';

// Import the background script after services are loaded
import './background.js';

console.log('AI Coding Helper: Service worker initialized');
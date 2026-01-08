// Version configuration
const APP_VERSION = '1.0.1';

// Display version in UI
function displayVersion() {
    const versionEl = document.getElementById('app-version');
    if (versionEl) {
        versionEl.textContent = `v${APP_VERSION}`;
    }
}

// Check for updates (can be enhanced later)
function checkForUpdates() {
    console.log(`Running Technical Enablement Tracker v${APP_VERSION}`);
}

// Initialize version display
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayVersion);
} else {
    displayVersion();
}

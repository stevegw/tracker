// Version configuration
const APP_VERSION = '1.0.5';
const VERSION_STORAGE_KEY = 'enablement_app_version';

// Check if version has changed and force reload if needed
function checkVersionAndReload() {
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

    console.log(`Current version: v${APP_VERSION}, Stored version: v${storedVersion || 'none'}`);

    if (storedVersion && storedVersion !== APP_VERSION) {
        console.log(`Version changed from v${storedVersion} to v${APP_VERSION} - forcing reload...`);

        // Update stored version BEFORE reload to prevent infinite loop
        localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);

        // Show brief notification before reload
        const body = document.body;
        if (body) {
            const notice = document.createElement('div');
            notice.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#3b82f6;color:white;padding:20px 30px;border-radius:8px;z-index:10000;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
            notice.textContent = `Updating to v${APP_VERSION}...`;
            body.appendChild(notice);
        }

        // Delay reload slightly to show message
        setTimeout(() => {
            // Force hard reload to bypass cache
            window.location.reload(true);
        }, 500);

        return true;
    }

    // First time or same version - update storage
    if (!storedVersion) {
        console.log(`First run - storing version v${APP_VERSION}`);
        localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    }

    return false;
}

// Display version in UI
function displayVersion() {
    const versionEl = document.getElementById('app-version');
    if (versionEl) {
        versionEl.textContent = `v${APP_VERSION}`;
    }
}

// Check for updates
function checkForUpdates() {
    console.log(`Running Technical Enablement Tracker v${APP_VERSION}`);
}

// Initialize - check version first, then display
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!checkVersionAndReload()) {
            displayVersion();
        }
    });
} else {
    if (!checkVersionAndReload()) {
        displayVersion();
    }
}

// Version management - checks server for latest version
const VERSION_STORAGE_KEY = 'enablement_app_version';
const VERSION_CHECK_URL = './version.json';

// Check server for latest version and force reload if changed
async function checkVersionAndReload() {
    try {
        // Fetch version from server with no-cache to bypass browser cache
        const response = await fetch(VERSION_CHECK_URL + '?t=' + Date.now(), {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch version');
            return false;
        }

        const data = await response.json();
        const serverVersion = data.version;
        const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

        console.log(`Server version: v${serverVersion}, Stored version: v${storedVersion || 'none'}`);

        if (storedVersion && storedVersion !== serverVersion) {
            console.log(`Version changed from v${storedVersion} to v${serverVersion} - forcing reload...`);

            // Update stored version BEFORE reload to prevent infinite loop
            localStorage.setItem(VERSION_STORAGE_KEY, serverVersion);

            // Show brief notification before reload
            const notice = document.createElement('div');
            notice.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#3b82f6;color:white;padding:20px 30px;border-radius:8px;z-index:10000;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
            notice.textContent = `Updating to v${serverVersion}...`;
            document.body.appendChild(notice);

            // Delay reload slightly to show message
            setTimeout(() => {
                // Force hard reload to bypass cache
                window.location.reload(true);
            }, 800);

            return true;
        }

        // First time or same version - update storage and display
        if (!storedVersion) {
            console.log(`First run - storing version v${serverVersion}`);
            localStorage.setItem(VERSION_STORAGE_KEY, serverVersion);
        }

        // Display current version
        displayVersion(serverVersion);

        return false;

    } catch (error) {
        // Ignore AbortError - this happens when page refreshes during fetch
        if (error.name === 'AbortError') {
            console.log('Version check aborted (page refresh)');
            return false;
        }
        console.error('Error checking version:', error);
        return false;
    }
}

// Display version in UI
function displayVersion(version) {
    const versionEl = document.getElementById('app-version');
    if (versionEl && version) {
        versionEl.textContent = `v${version}`;
    }
}

// Initialize - check version on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkVersionAndReload);
} else {
    checkVersionAndReload();
}

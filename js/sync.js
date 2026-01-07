// Cloud sync manager using Google Drive API

const CloudSync = {
    // Google Drive API configuration
    // Users will need to create their own OAuth client ID at https://console.cloud.google.com/
    CLIENT_ID: '', // To be configured by user
    API_KEY: '', // To be configured by user
    DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    SCOPES: 'https://www.googleapis.com/auth/drive.file',

    FILE_NAME: 'enablement-tracker-data.json',
    FOLDER_NAME: 'EnablementTracker',

    // State
    isInitialized: false,
    isSignedIn: false,
    tokenClient: null,
    gapiInitialized: false,
    gisInitialized: false,
    fileId: null,
    lastSyncTime: null,
    syncInProgress: false,

    /**
     * Initialize Google Drive API
     */
    async init() {
        // Check if credentials are configured
        const config = this.getConfig();
        if (!config.clientId || !config.apiKey) {
            console.log('Cloud sync not configured. Configure in settings to enable.');
            return false;
        }

        this.CLIENT_ID = config.clientId;
        this.API_KEY = config.apiKey;

        try {
            // Load Google API scripts
            await this.loadGoogleAPIs();

            // Initialize GAPI
            await this.initializeGapi();

            // Initialize GIS (Google Identity Services)
            await this.initializeGis();

            this.isInitialized = true;
            console.log('Cloud sync initialized');

            return true;
        } catch (error) {
            console.error('Failed to initialize cloud sync:', error);
            return false;
        }
    },

    /**
     * Load Google API scripts dynamically
     */
    loadGoogleAPIs() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.gapi && window.google) {
                resolve();
                return;
            }

            // Load GAPI
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.async = true;
            gapiScript.defer = true;
            gapiScript.onload = () => {
                // Load GIS
                const gisScript = document.createElement('script');
                gisScript.src = 'https://accounts.google.com/gsi/client';
                gisScript.async = true;
                gisScript.defer = true;
                gisScript.onload = () => resolve();
                gisScript.onerror = () => reject(new Error('Failed to load GIS'));
                document.head.appendChild(gisScript);
            };
            gapiScript.onerror = () => reject(new Error('Failed to load GAPI'));
            document.head.appendChild(gapiScript);
        });
    },

    /**
     * Initialize GAPI client
     */
    async initializeGapi() {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: this.API_KEY,
                        discoveryDocs: [this.DISCOVERY_DOC],
                    });
                    this.gapiInitialized = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    },

    /**
     * Initialize Google Identity Services
     */
    async initializeGis() {
        return new Promise((resolve) => {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: (response) => {
                    if (response.error !== undefined) {
                        console.error('Auth error:', response);
                        return;
                    }
                    this.isSignedIn = true;
                    this.onSignIn();
                },
            });
            this.gisInitialized = true;
            resolve();
        });
    },

    /**
     * Sign in to Google
     */
    signIn() {
        if (!this.isInitialized) {
            UIController.showToast('Cloud sync not configured', 'error');
            return;
        }

        // Check if already has valid token
        if (gapi.client.getToken() === null) {
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            this.tokenClient.requestAccessToken({ prompt: '' });
        }
    },

    /**
     * Sign out from Google
     */
    signOut() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            this.isSignedIn = false;
            this.fileId = null;
            UIController.showToast('Signed out from cloud sync', 'success');
            this.updateSyncStatus();
        }
    },

    /**
     * Called after successful sign in
     */
    async onSignIn() {
        console.log('Signed in to Google Drive');
        UIController.showToast('Connected to Google Drive', 'success');
        this.updateSyncStatus();

        // Try to load existing data from Drive
        await this.pullFromCloud();
    },

    /**
     * Get sync configuration from localStorage
     */
    getConfig() {
        const settings = Storage.getSettings();
        return {
            clientId: settings.googleDriveClientId || '',
            apiKey: settings.googleDriveApiKey || '',
            autoSync: settings.autoSync !== false
        };
    },

    /**
     * Save sync configuration
     */
    saveConfig(clientId, apiKey, autoSync = true) {
        const settings = Storage.getSettings();
        settings.googleDriveClientId = clientId;
        settings.googleDriveApiKey = apiKey;
        settings.autoSync = autoSync;
        Storage.saveSettings(settings);
    },

    /**
     * Find or create app folder in Drive
     */
    async findOrCreateFolder() {
        try {
            // Search for existing folder
            const response = await gapi.client.drive.files.list({
                q: `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            if (response.result.files && response.result.files.length > 0) {
                return response.result.files[0].id;
            }

            // Create folder if it doesn't exist
            const folderMetadata = {
                name: this.FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder'
            };

            const folder = await gapi.client.drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });

            return folder.result.id;
        } catch (error) {
            console.error('Error finding/creating folder:', error);
            throw error;
        }
    },

    /**
     * Find data file in Drive
     */
    async findDataFile() {
        try {
            const response = await gapi.client.drive.files.list({
                q: `name='${this.FILE_NAME}' and trashed=false`,
                fields: 'files(id, name, modifiedTime)',
                spaces: 'drive',
                orderBy: 'modifiedTime desc'
            });

            if (response.result.files && response.result.files.length > 0) {
                return response.result.files[0];
            }

            return null;
        } catch (error) {
            console.error('Error finding file:', error);
            throw error;
        }
    },

    /**
     * Pull data from cloud
     */
    async pullFromCloud() {
        if (!this.isSignedIn || this.syncInProgress) return;

        this.syncInProgress = true;
        this.updateSyncStatus('Syncing...');

        try {
            const file = await this.findDataFile();

            if (!file) {
                console.log('No cloud backup found');
                this.updateSyncStatus('No cloud backup found');
                this.syncInProgress = false;
                return;
            }

            this.fileId = file.id;

            // Download file content
            const response = await gapi.client.drive.files.get({
                fileId: file.id,
                alt: 'media'
            });

            const cloudData = response.result;
            const localData = Storage.exportData();

            // Compare timestamps
            const cloudTime = cloudData.exportedAt || 0;
            const localTime = localData.exportedAt || 0;

            if (cloudTime > localTime) {
                // Cloud is newer, import it
                if (confirm('Cloud backup is newer. Load data from cloud?')) {
                    Storage.importData(cloudData);
                    UIController.showToast('Data loaded from cloud', 'success');
                    UIController.refresh();
                }
            } else if (localTime > cloudTime) {
                // Local is newer, push to cloud
                await this.pushToCloud();
            }

            this.lastSyncTime = Date.now();
            this.updateSyncStatus('Synced');
        } catch (error) {
            console.error('Error pulling from cloud:', error);
            UIController.showToast('Failed to sync from cloud', 'error');
            this.updateSyncStatus('Sync failed');
        }

        this.syncInProgress = false;
    },

    /**
     * Push data to cloud
     */
    async pushToCloud() {
        if (!this.isSignedIn || this.syncInProgress) return;

        this.syncInProgress = true;
        this.updateSyncStatus('Syncing...');

        try {
            const data = Storage.exportData();
            const content = JSON.stringify(data, null, 2);

            if (this.fileId) {
                // Update existing file
                await gapi.client.request({
                    path: `/upload/drive/v3/files/${this.fileId}`,
                    method: 'PATCH',
                    params: { uploadType: 'media' },
                    body: content
                });
            } else {
                // Create new file
                const folderId = await this.findOrCreateFolder();

                const file = new Blob([content], { type: 'application/json' });
                const metadata = {
                    name: this.FILE_NAME,
                    mimeType: 'application/json',
                    parents: [folderId]
                };

                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', file);

                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
                    body: form
                });

                const result = await response.json();
                this.fileId = result.id;
            }

            this.lastSyncTime = Date.now();
            this.updateSyncStatus('Synced');
            console.log('Data pushed to cloud');
        } catch (error) {
            console.error('Error pushing to cloud:', error);
            UIController.showToast('Failed to sync to cloud', 'error');
            this.updateSyncStatus('Sync failed');
        }

        this.syncInProgress = false;
    },

    /**
     * Auto-sync when data changes
     */
    scheduleAutoSync: debounce(function() {
        const config = CloudSync.getConfig();
        if (config.autoSync && CloudSync.isSignedIn) {
            CloudSync.pushToCloud();
        }
    }, 2000),

    /**
     * Update sync status in UI
     */
    updateSyncStatus(status) {
        const statusEl = document.getElementById('sync-status');
        if (!statusEl) return;

        if (status) {
            statusEl.textContent = status;
        } else if (this.isSignedIn) {
            const timeAgo = this.lastSyncTime
                ? getRelativeTime(this.lastSyncTime)
                : 'Never';
            statusEl.textContent = `Last synced: ${timeAgo}`;
        } else {
            statusEl.textContent = 'Not connected';
        }
    }
};

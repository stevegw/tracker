// localStorage wrapper for data persistence

const STORAGE_KEYS = {
    CATEGORIES: 'enablement_categories',
    ACTIVITIES: 'enablement_activities',
    SETTINGS: 'enablement_settings'
};

const Storage = {
    /**
     * Get all categories from localStorage
     */
    getCategories() {
        const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Save categories to localStorage
     */
    saveCategories(categories) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    },

    /**
     * Get all activities from localStorage
     */
    getActivities() {
        const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Save activities to localStorage
     */
    saveActivities(activities) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    },

    /**
     * Get settings from localStorage
     */
    getSettings() {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
            notificationsEnabled: false,
            lastBackupPrompt: null,
            fontSize: 'xlarge', // Default: 'xlarge' for better mobile readability
            darkMode: false, // Default: light mode
            appTitle: 'My Tracker', // Default app title
            appSubtitle: 'Track your progress', // Default subtitle
            confettiEnabled: true // Default: confetti enabled
        };
    },

    /**
     * Save settings to localStorage
     */
    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    /**
     * Export all data as JSON
     */
    exportData() {
        return {
            categories: this.getCategories(),
            activities: this.getActivities(),
            settings: this.getSettings(),
            exportedAt: Date.now(),
            version: '1.0'
        };
    },

    /**
     * Import data from JSON object
     */
    importData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }

            // Validate data structure
            if (data.categories && Array.isArray(data.categories)) {
                this.saveCategories(data.categories);
            }

            if (data.activities && Array.isArray(data.activities)) {
                this.saveActivities(data.activities);
            }

            if (data.settings && typeof data.settings === 'object') {
                this.saveSettings(data.settings);
            }

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    },

    /**
     * Download data as JSON file
     */
    downloadBackup() {
        const data = this.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `enablement-tracker-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Upload and import data from file
     */
    uploadBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const success = this.importData(data);
                    if (success) {
                        resolve(true);
                    } else {
                        reject(new Error('Import failed'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    },

    /**
     * Clear all data (use with caution)
     */
    clearAll() {
        if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
            localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            return true;
        }
        return false;
    },

    /**
     * Get storage usage info
     */
    getStorageInfo() {
        const categories = JSON.stringify(this.getCategories()).length;
        const activities = JSON.stringify(this.getActivities()).length;
        const settings = JSON.stringify(this.getSettings()).length;
        const total = categories + activities + settings;

        return {
            categories: this.formatBytes(categories),
            activities: this.formatBytes(activities),
            settings: this.formatBytes(settings),
            total: this.formatBytes(total)
        };
    },

    /**
     * Format bytes to readable string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// Header component for stats display

const HeaderComponent = {
    /**
     * Update header statistics
     */
    update() {
        const statsModel = new StatsModel();
        const stats = statsModel.getStats();

        // Update completion percentage
        const completionEl = document.getElementById('header-completion');
        if (completionEl) {
            completionEl.textContent = `${stats.completionRate}%`;
        }

        // Update streak
        const streakEl = document.getElementById('header-streak');
        if (streakEl) {
            const streakText = stats.currentStreak === 1
                ? '1 day'
                : `${stats.currentStreak} days`;
            streakEl.textContent = streakText;
        }

        // Update mobile sidebar stats attributes
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.setAttribute('data-completion', `${stats.completionRate}%`);
            const streakDays = stats.currentStreak === 1 ? '1 day' : `${stats.currentStreak} days`;
            sidebar.setAttribute('data-streak', streakDays);
        }
    },

    /**
     * Initialize header event listeners
     */
    init() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                UIController.applyFilters();
            }, 300));
        }

        // Add activity button
        const addActivityBtn = document.getElementById('add-activity-btn');
        const emptyAddBtn = document.getElementById('empty-add-btn');

        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => {
                ActivityFormComponent.show();
            });
        }

        if (emptyAddBtn) {
            emptyAddBtn.addEventListener('click', () => {
                ActivityFormComponent.show();
            });
        }

        // Stats button
        const statsBtn = document.getElementById('stats-btn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                StatsDashboardComponent.show();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }

        // Initial update
        this.update();
    },

    /**
     * Show settings modal
     */
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        // Update storage info
        this.updateStorageInfo();

        // Update dark mode toggle
        const settings = Storage.getSettings();
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = settings.darkMode || false;
        }

        // Update notifications toggle
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.checked = settings.notificationsEnabled;
        }

        // Update font size select
        const fontSizeSelect = document.getElementById('font-size-select');
        if (fontSizeSelect) {
            fontSizeSelect.value = settings.fontSize || 'xlarge';
        }

        modal.classList.add('active');
    },

    /**
     * Hide settings modal
     */
    hideSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Update storage info display
     */
    updateStorageInfo() {
        const info = Storage.getStorageInfo();
        const storageInfoEl = document.getElementById('storage-info');
        if (storageInfoEl) {
            storageInfoEl.innerHTML = `
                <div>Categories: ${info.categories}</div>
                <div>Activities: ${info.activities}</div>
                <div>Settings: ${info.settings}</div>
                <div><strong>Total: ${info.total}</strong></div>
            `;
        }
    },

    /**
     * Initialize settings modal event listeners
     */
    initSettings() {
        // Close button
        const closeBtn = document.getElementById('settings-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideSettingsModal();
            });
        }

        // Click outside to close
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideSettingsModal();
                }
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                Storage.downloadBackup();
                UIController.showToast('Data exported successfully', 'success');
            });
        }

        // Import button
        const importBtn = document.getElementById('import-btn');
        const importFileInput = document.getElementById('import-file-input');

        if (importBtn && importFileInput) {
            importBtn.addEventListener('click', () => {
                importFileInput.click();
            });

            importFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        await Storage.uploadBackup(file);
                        UIController.showToast('Data imported successfully', 'success');
                        UIController.refresh();
                        this.hideSettingsModal();
                    } catch (error) {
                        UIController.showToast('Import failed: ' + error.message, 'error');
                    }
                    // Reset file input
                    importFileInput.value = '';
                }
            });
        }

        // Clear data button
        const clearDataBtn = document.getElementById('clear-data-btn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (Storage.clearAll()) {
                    UIController.showToast('All data cleared', 'success');
                    UIController.refresh();
                    this.hideSettingsModal();
                }
            });
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                const settings = Storage.getSettings();
                settings.darkMode = enabled;
                Storage.saveSettings(settings);
                this.applyDarkMode(enabled);
                UIController.showToast(enabled ? 'Dark mode enabled' : 'Light mode enabled', 'success');
            });
        }

        // Notifications toggle
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', async (e) => {
                const enabled = e.target.checked;

                if (enabled && 'Notification' in window) {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        const settings = Storage.getSettings();
                        settings.notificationsEnabled = true;
                        Storage.saveSettings(settings);
                        UIController.showToast('Notifications enabled', 'success');
                    } else {
                        e.target.checked = false;
                        UIController.showToast('Notification permission denied', 'error');
                    }
                } else {
                    const settings = Storage.getSettings();
                    settings.notificationsEnabled = false;
                    Storage.saveSettings(settings);
                    UIController.showToast('Notifications disabled', 'success');
                }
            });
        }

        // Font size selector
        const fontSizeSelect = document.getElementById('font-size-select');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                const fontSize = e.target.value;
                const settings = Storage.getSettings();
                settings.fontSize = fontSize;
                Storage.saveSettings(settings);
                this.applyFontSize(fontSize);
                UIController.showToast('Text size updated', 'success');
            });
        }

        // Apply saved font size on load
        const settings = Storage.getSettings();

        // Upgrade existing users: if they have 'normal', upgrade to 'xlarge' as new default
        // This is a one-time migration for v1.0.20+
        if (!settings.fontSizeMigrated && settings.fontSize === 'normal') {
            settings.fontSize = 'xlarge';
            settings.fontSizeMigrated = true;
            Storage.saveSettings(settings);
        }

        this.applyFontSize(settings.fontSize || 'xlarge');

        // Apply saved dark mode on load
        this.applyDarkMode(settings.darkMode || false);
    },

    /**
     * Apply font size to body
     */
    applyFontSize(fontSize) {
        document.body.classList.remove('font-small', 'font-large', 'font-xlarge', 'font-xxlarge', 'font-xxxlarge');
        if (fontSize === 'small') {
            document.body.classList.add('font-small');
        } else if (fontSize === 'large') {
            document.body.classList.add('font-large');
        } else if (fontSize === 'xlarge') {
            document.body.classList.add('font-xlarge');
        } else if (fontSize === 'xxlarge') {
            document.body.classList.add('font-xxlarge');
        } else if (fontSize === 'xxxlarge') {
            document.body.classList.add('font-xxxlarge');
        }
        // 'normal' doesn't need a class
    },

    /**
     * Apply dark mode to body
     */
    applyDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
};

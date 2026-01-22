// Admin App Entry Point
// Initializes the admin interface on admin.html

window.AdminApp = {
    initialized: false,

    /**
     * Initialize admin application
     */
    async init() {
        console.log('AdminApp: Initializing...');

        // Initialize Supabase client
        if (!initSupabase()) {
            console.error('AdminApp: Failed to initialize Supabase');
            return;
        }

        // Initialize admin authentication (this will check admin role)
        await AdminAuth.init();

        // Only initialize admin panel if user is authenticated and is admin
        if (AdminAuth.isAdmin) {
            console.log('AdminApp: User is admin, initializing admin panel...');

            // Initialize admin panel component
            AdminPanelComponent.init();

            // Load admin data
            await this.loadData();

            this.initialized = true;
            console.log('AdminApp: Initialization complete');
        } else {
            console.log('AdminApp: User is not admin, skipping admin panel initialization');
        }
    },

    /**
     * Load admin data from Supabase
     */
    async loadData() {
        console.log('AdminApp: Loading lookup schedules from Supabase...');

        try {
            // Load lookup schedules from Supabase
            await SupabaseSync.loadLookupSchedules();

            // Re-render admin panel
            AdminPanelComponent.render();

            console.log('AdminApp: Data loaded successfully');
        } catch (error) {
            console.error('AdminApp: Error loading data:', error);
            AdminAuth.showToast('Error loading admin data', 'error');
        }
    },

    /**
     * Refresh admin data and UI
     */
    async refresh() {
        if (!this.initialized) return;
        await this.loadData();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
});

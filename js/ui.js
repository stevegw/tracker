// UI Controller - coordinates all components

const UIController = {
    /**
     * Initialize all UI components
     */
    init() {
        // Initialize all components
        HeaderComponent.init();
        HeaderComponent.initSettings();
        SidebarComponent.init();
        CommandBarComponent.init();
        ActivityFormComponent.init();
        StatsDashboardComponent.init();

        // Initialize filters
        this.initFilters();

        // Initialize mobile menu
        this.initMobileMenu();

        // Initialize keyboard shortcuts
        this.initKeyboardShortcuts();

        // Initialize click outside handler for menus
        this.initClickOutsideHandler();

        // Check for due date notifications
        this.checkDueDateNotifications();

        // Initial render
        this.applyFilters();
    },

    /**
     * Initialize mobile menu
     */
    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileCloseBtn = document.getElementById('mobile-sidebar-close');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-sidebar-overlay');

        console.log('Initializing mobile menu...', { mobileMenuBtn, mobileCloseBtn, sidebar, overlay });

        if (mobileMenuBtn && sidebar && overlay) {
            // Toggle sidebar
            mobileMenuBtn.addEventListener('click', (e) => {
                console.log('Mobile menu button clicked');
                console.log('Sidebar element:', sidebar);
                console.log('Sidebar classes BEFORE:', sidebar.className);
                console.log('Overlay classes BEFORE:', overlay.className);

                e.preventDefault();
                sidebar.classList.toggle('mobile-open');
                overlay.classList.toggle('active');

                console.log('Sidebar classes AFTER:', sidebar.className);
                console.log('Overlay classes AFTER:', overlay.className);
                console.log('Sidebar computed style left:', window.getComputedStyle(sidebar).left);
            });

            // Close sidebar when clicking overlay
            overlay.addEventListener('click', () => {
                console.log('Overlay clicked');
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
            });

            // Close sidebar when clicking close button
            if (mobileCloseBtn) {
                mobileCloseBtn.addEventListener('click', (e) => {
                    console.log('Close button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    sidebar.classList.remove('mobile-open');
                    overlay.classList.remove('active');
                });
            }
        } else {
            console.error('Mobile menu elements not found!', { mobileMenuBtn, sidebar, overlay });
        }
    },

    /**
     * Close mobile sidebar (call this when category is clicked)
     */
    closeMobileSidebar() {
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobile-sidebar-overlay');
            if (sidebar && overlay) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
            }
        }
    },

    /**
     * Initialize filter event listeners
     */
    initFilters() {
        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        // Sort by
        const sortBy = document.getElementById('sort-by');
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        // Overdue filter
        const overdueFilter = document.getElementById('overdue-filter');
        if (overdueFilter) {
            overdueFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        // Due soon filter
        const dueSoonFilter = document.getElementById('due-soon-filter');
        if (dueSoonFilter) {
            dueSoonFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    },

    /**
     * Initialize keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K - Focus command bar
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                CommandBarComponent.focus();
                return;
            }

            // "/" key - Focus command bar (unless in input/textarea)
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                CommandBarComponent.focus();
                return;
            }
        });
    },

    /**
     * Initialize click outside handler for activity menus
     */
    initClickOutsideHandler() {
        document.addEventListener('click', (e) => {
            // Close activity menus when clicking outside
            if (!e.target.closest('.activity-card-menu')) {
                document.querySelectorAll('.activity-menu-dropdown.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    },

    /**
     * Apply current filters and render activities
     */
    applyFilters() {
        const activityModel = new ActivityModel();

        // Get current filter values
        const searchQuery = document.getElementById('search-input')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const sortBy = document.getElementById('sort-by')?.value || 'updatedAt';
        const overdueOnly = document.getElementById('overdue-filter')?.checked || false;
        const dueSoonOnly = document.getElementById('due-soon-filter')?.checked || false;
        const currentCategoryId = SidebarComponent.currentCategoryId;

        // Build filters object
        const filters = {
            query: searchQuery
        };

        if (currentCategoryId !== 'all') {
            filters.categoryId = currentCategoryId;
        }

        if (statusFilter) {
            filters.status = statusFilter;
        }

        if (overdueOnly) {
            filters.overdue = true;
        }

        if (dueSoonOnly) {
            filters.dueSoon = true;
        }

        // Get filtered and sorted activities
        const activities = activityModel.filterAndSort(filters, sortBy, 'desc');

        // Render activities
        ActivityListComponent.render(activities);
    },

    /**
     * Refresh all UI components
     */
    refresh() {
        HeaderComponent.update();
        SidebarComponent.render();
        this.applyFilters();
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    /**
     * Check for due date notifications
     */
    checkDueDateNotifications() {
        const settings = Storage.getSettings();
        if (!settings.notificationsEnabled) return;

        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const activityModel = new ActivityModel();
        const overdue = activityModel.getOverdue();
        const dueSoon = activityModel.getDueSoon();

        // Notify about overdue activities
        if (overdue.length > 0) {
            new Notification('Overdue Activities', {
                body: `You have ${overdue.length} overdue ${overdue.length === 1 ? 'activity' : 'activities'}.`,
                icon: '/favicon.ico'
            });
        }

        // Notify about due soon activities
        if (dueSoon.length > 0) {
            new Notification('Activities Due Soon', {
                body: `You have ${dueSoon.length} ${dueSoon.length === 1 ? 'activity' : 'activities'} due in the next 3 days.`,
                icon: '/favicon.ico'
            });
        }
    }
};

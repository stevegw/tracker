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
        ActivityFormComponent.init();
        StatsDashboardComponent.init();
        ScheduleImportComponent.init();
        ScheduleLookupComponent.init();

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
        // Filters button - open modal
        const filtersBtn = document.getElementById('filters-btn');
        if (filtersBtn) {
            filtersBtn.addEventListener('click', () => {
                this.showFiltersModal();
            });
        }

        // Filters modal close button
        const closeBtn = document.getElementById('filters-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideFiltersModal();
            });
        }

        // Click outside to close
        const modal = document.getElementById('filters-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideFiltersModal();
                }
            });
        }

        // Apply filters button
        const applyBtn = document.getElementById('filters-apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyFilters();
                this.hideFiltersModal();
                this.showToast('Filters applied', 'success');
            });
        }

        // Clear filters button
        const clearBtn = document.getElementById('filters-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Auto-apply on change for immediate feedback
        const statusFilter = document.getElementById('status-filter');
        const sortBy = document.getElementById('sort-by');
        const overdueFilter = document.getElementById('overdue-filter');
        const dueSoonFilter = document.getElementById('due-soon-filter');

        [statusFilter, sortBy, overdueFilter, dueSoonFilter].forEach(el => {
            if (el) {
                el.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });
    },

    /**
     * Show filters modal
     */
    showFiltersModal() {
        const modal = document.getElementById('filters-modal');
        if (modal) {
            modal.classList.add('active');
        }
    },

    /**
     * Hide filters modal
     */
    hideFiltersModal() {
        const modal = document.getElementById('filters-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        const statusFilter = document.getElementById('status-filter');
        const sortBy = document.getElementById('sort-by');
        const overdueFilter = document.getElementById('overdue-filter');
        const dueSoonFilter = document.getElementById('due-soon-filter');

        if (statusFilter) statusFilter.value = 'not-completed';
        if (sortBy) sortBy.value = 'updatedAt';
        if (overdueFilter) overdueFilter.checked = false;
        if (dueSoonFilter) dueSoonFilter.checked = false;

        this.applyFilters();
        this.showToast('Filters cleared', 'success');
    },

    /**
     * Initialize keyboard shortcuts
     */
    initKeyboardShortcuts() {
        // Keyboard shortcuts can be added here in the future if needed
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

            // Close status menus when clicking outside
            if (!e.target.closest('.status-badge-clickable')) {
                document.querySelectorAll('.status-menu-dropdown.active').forEach(menu => {
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
        // Recheck welcome banner visibility
        if (typeof showWelcomeBanner === 'function') {
            showWelcomeBanner();
        }
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

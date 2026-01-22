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

        // Check for custom reminders
        this.checkCustomReminders();

        // Set up periodic reminder checks (every minute)
        this.startReminderCheckInterval();

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
    },

    /**
     * Check for custom activity reminders
     */
    checkCustomReminders() {
        const settings = Storage.getSettings();
        if (!settings.notificationsEnabled) return;

        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const activityModel = new ActivityModel();
        const activities = activityModel.getAll();
        const now = Date.now();
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

        activities.forEach(activity => {
            // Skip completed activities
            if (activity.status === 'completed') return;

            // Skip if reminders not enabled
            if (!activity.reminderEnabled) return;

            // Check for daily reminder at specific time
            if (activity.reminderTime) {
                const shouldSendDailyReminder = this.shouldSendDailyReminder(activity, currentTimeString);
                if (shouldSendDailyReminder) {
                    this.sendActivityReminder(activity, 'daily');
                }
            }

            // Check for reminder before due date
            if (activity.reminderMinutesBefore && activity.dueDate) {
                const shouldSendBeforeReminder = this.shouldSendBeforeReminder(activity, now);
                if (shouldSendBeforeReminder) {
                    this.sendActivityReminder(activity, 'before-due');
                }
            }
        });
    },

    /**
     * Check if we should send a daily reminder
     */
    shouldSendDailyReminder(activity, currentTimeString) {
        // Check if current time matches reminder time
        if (activity.reminderTime !== currentTimeString) return false;

        // Check if we already sent a reminder recently (within last 23 hours)
        if (activity.lastReminderSent) {
            const hoursSinceLastReminder = (Date.now() - activity.lastReminderSent) / (1000 * 60 * 60);
            if (hoursSinceLastReminder < 23) return false;
        }

        return true;
    },

    /**
     * Check if we should send a before-due-date reminder
     */
    shouldSendBeforeReminder(activity, now) {
        const minutesBeforeDue = activity.reminderMinutesBefore;
        const dueDate = activity.dueDate;

        // Calculate when reminder should be sent
        const reminderTime = dueDate - (minutesBeforeDue * 60 * 1000);

        // Check if current time is within 1 minute of reminder time
        const timeDiff = Math.abs(now - reminderTime);
        if (timeDiff > 60 * 1000) return false; // Not within 1 minute

        // Check if we already sent this reminder
        if (activity.lastReminderSent) {
            const minutesSinceLastReminder = (now - activity.lastReminderSent) / (1000 * 60);
            if (minutesSinceLastReminder < minutesBeforeDue) return false;
        }

        return true;
    },

    /**
     * Send a reminder notification for an activity
     */
    sendActivityReminder(activity, type) {
        const activityModel = new ActivityModel();

        let title = '';
        let body = '';

        if (type === 'daily') {
            title = '🔔 Activity Reminder';
            body = activity.title;
        } else if (type === 'before-due') {
            const minutes = activity.reminderMinutesBefore;
            let timeText = '';
            if (minutes < 60) {
                timeText = `${minutes} minutes`;
            } else if (minutes === 60) {
                timeText = '1 hour';
            } else if (minutes === 120) {
                timeText = '2 hours';
            } else if (minutes === 1440) {
                timeText = '1 day';
            } else {
                timeText = `${Math.floor(minutes / 60)} hours`;
            }
            title = '⏰ Activity Due Soon';
            body = `${activity.title} is due in ${timeText}`;
        }

        // Send notification
        new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            tag: activity.id // Prevent duplicate notifications for same activity
        });

        // Update lastReminderSent timestamp
        activityModel.update(activity.id, {
            lastReminderSent: Date.now()
        });
    },

    /**
     * Start periodic reminder checks (every minute)
     */
    startReminderCheckInterval() {
        // Check every minute
        setInterval(() => {
            this.checkCustomReminders();
        }, 60 * 1000); // 60 seconds
    }
};

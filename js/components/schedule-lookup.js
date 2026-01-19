// Schedule Lookup Component
// Allows users to browse lookup schedules and add them to their activities

const ScheduleLookupComponent = {
    selectedSchedule: null,

    /**
     * Initialize the Schedule Lookup Component
     */
    init() {
        // Close button
        const closeBtn = document.getElementById('schedule-lookup-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Click outside to close
        const modal = document.getElementById('schedule-lookup-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }

        // Add to activities button
        const addBtn = document.getElementById('schedule-lookup-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addSelectedToActivities();
            });
        }

        // Schedule lookup button in toolbar
        const lookupBtn = document.getElementById('schedule-lookup-trigger-btn');
        if (lookupBtn) {
            lookupBtn.addEventListener('click', () => {
                this.show();
            });
        }

        console.log('Schedule Lookup Component initialized');
    },

    /**
     * Show the schedule lookup modal
     */
    show() {
        const modal = document.getElementById('schedule-lookup-modal');
        if (modal) {
            modal.classList.add('active');
            this.renderLookupSchedules();
        }
    },

    /**
     * Hide the schedule lookup modal
     */
    hide() {
        const modal = document.getElementById('schedule-lookup-modal');
        if (modal) {
            modal.classList.remove('active');
            this.selectedSchedule = null;
        }
    },

    /**
     * Render list of lookup schedules
     */
    renderLookupSchedules() {
        const container = document.getElementById('schedule-lookup-list');
        if (!container) return;

        const activityModel = new ActivityModel();
        const categoryModel = new CategoryModel();
        const lookupSchedules = activityModel.getLookupSchedules();

        if (lookupSchedules.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No lookup schedules found.</p>
                    <p>Import a class schedule to create lookup templates.</p>
                </div>
            `;
            return;
        }

        // Group by category
        const grouped = {};
        lookupSchedules.forEach(schedule => {
            const categoryId = schedule.categoryId || 'uncategorized';
            if (!grouped[categoryId]) {
                grouped[categoryId] = [];
            }
            grouped[categoryId].push(schedule);
        });

        let html = '';

        // Render each category group
        Object.keys(grouped).forEach(categoryId => {
            const category = categoryId === 'uncategorized'
                ? { name: 'Uncategorized', color: '#999' }
                : categoryModel.getById(categoryId);

            const schedules = grouped[categoryId];

            html += `
                <div class="lookup-category-section">
                    <h3 class="lookup-category-header" style="color: ${category.color}">
                        ${escapeHTML(category.name)} (${schedules.length})
                    </h3>
                    <div class="lookup-schedules-list">
            `;

            schedules.forEach(schedule => {
                html += `
                    <div class="lookup-schedule-card" data-schedule-id="${schedule.id}">
                        <div class="lookup-schedule-info">
                            <div class="lookup-schedule-title">${escapeHTML(schedule.title)}</div>
                            <div class="lookup-schedule-meta">
                                ${schedule.description ? `<span>📝 ${escapeHTML(schedule.description)}</span>` : ''}
                                ${schedule.studio ? `<span>📍 ${escapeHTML(schedule.studio)}</span>` : ''}
                                ${schedule.time ? `<span>🕐 ${escapeHTML(schedule.time)}</span>` : ''}
                                ${schedule.cadence && schedule.cadence !== 'one-time' ? `<span class="badge-cadence">🔁 ${schedule.cadence}</span>` : ''}
                            </div>
                        </div>
                        <div class="lookup-schedule-actions">
                            <button class="btn btn-primary btn-small" onclick="ScheduleLookupComponent.addToActivities('${schedule.id}')">
                                Add to Activities
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="ScheduleLookupComponent.deleteLookup('${schedule.id}')">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Add a lookup schedule to activities
     */
    addToActivities(lookupId) {
        const activityModel = new ActivityModel();
        const lookup = activityModel.getById(lookupId);

        if (!lookup || lookup.type !== 'lookup') {
            UIController.showToast('Lookup schedule not found', 'error');
            return;
        }

        // Parse the description to get the day if available
        let dueDate = null;
        const descMatch = lookup.description.match(/^(\w+) at/);
        if (descMatch && lookup.time) {
            const day = descMatch[1].toUpperCase();
            dueDate = getNextOccurrenceOfDay(day, lookup.time);
        }

        // Create a regular activity from the lookup template
        const activity = activityModel.createFromLookup(lookupId, { dueDate });

        if (activity) {
            UIController.refresh();
            UIController.showToast(`Added "${activity.title}" to your activities!`, 'success');
        } else {
            UIController.showToast('Failed to add activity', 'error');
        }
    },

    /**
     * Delete a lookup schedule
     */
    deleteLookup(lookupId) {
        if (!confirm('Delete this lookup schedule? This will not affect any activities you\'ve already created from it.')) {
            return;
        }

        const activityModel = new ActivityModel();
        const success = activityModel.delete(lookupId);

        if (success) {
            this.renderLookupSchedules();
            UIController.showToast('Lookup schedule deleted', 'success');
        } else {
            UIController.showToast('Failed to delete lookup schedule', 'error');
        }
    },

    /**
     * Add selected schedule to activities (placeholder for batch operations)
     */
    addSelectedToActivities() {
        // Future enhancement: could support multi-select
        UIController.showToast('Select a schedule and click "Add to Activities"', 'info');
    }
};

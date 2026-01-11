// Activity list component

const ActivityListComponent = {
    /**
     * Render activity list based on current filters
     */
    render(activities) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        activityList.innerHTML = '';

        // Show empty state if no activities
        if (!activities || activities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <h2>No activities found</h2>
                    <p>Create your first activity to get started tracking your technical enablement journey.</p>
                    <button class="btn btn-primary" onclick="ActivityFormComponent.show()">+ Create Activity</button>
                </div>
            `;
            return;
        }

        // Render each activity
        activities.forEach(activity => {
            const card = this.createActivityCard(activity);
            activityList.appendChild(card);
        });
    },

    /**
     * Create activity card element
     */
    createActivityCard(activity) {
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.dataset.activityId = activity.id;

        // Get category info
        const categoryModel = new CategoryModel();
        const category = activity.categoryId ? categoryModel.getById(activity.categoryId) : null;

        // Set border color from category
        if (category) {
            card.style.borderLeftColor = category.color;
        }

        // Create badges
        const badges = this.createBadges(activity, category);

        // Create resources section
        const resourcesHtml = activity.resources && activity.resources.length > 0
            ? this.createResourcesSection(activity.resources)
            : '';

        // Create notes section
        const notesHtml = activity.notes
            ? `<div class="activity-notes">${escapeHTML(activity.notes)}</div>`
            : '';

        card.innerHTML = `
            <div class="activity-card-header">
                <div style="flex: 1;">
                    <h3 class="activity-card-title">${escapeHTML(activity.title)}</h3>
                    ${activity.description ? `<p class="activity-card-description">${escapeHTML(activity.description)}</p>` : ''}
                </div>
            </div>
            <div class="activity-card-meta">
                <div class="activity-badges-left">
                    ${badges.left}
                    ${activity.timeSpent > 0 ? `<span class="activity-time">⏱️ ${formatTimeSpent(activity.timeSpent)}</span>` : ''}
                </div>
                <div class="activity-badges-right">
                    ${badges.right}
                </div>
                <div class="activity-card-menu">
                    <button class="activity-menu-btn" onclick="ActivityListComponent.toggleMenu('${activity.id}')">⋮</button>
                    <div class="activity-menu-dropdown" id="menu-${activity.id}">
                        ${this.createMenuItems(activity)}
                    </div>
                </div>
            </div>
            ${notesHtml}
            ${resourcesHtml}
        `;

        return card;
    },

    /**
     * Create badges for activity card
     */
    createBadges(activity, category) {
        const leftBadges = [];
        const rightBadges = [];

        // Category badge (visual tag with color) - LEFT
        if (category) {
            leftBadges.push(`
                <span class="activity-badge badge-category" style="background: ${category.color}20; color: ${category.color}; border: 1.5px solid ${category.color};">
                    ${escapeHTML(category.name)}
                </span>
            `);
        }

        // Cadence badge (only show if not one-time) - LEFT
        if (activity.cadence && activity.cadence !== 'one-time') {
            const cadenceIcons = {
                'daily': '📅',
                'weekly': '📆',
                'monthly': '🗓️'
            };
            const cadenceLabels = {
                'daily': 'Daily',
                'weekly': 'Weekly',
                'monthly': 'Monthly'
            };
            leftBadges.push(`
                <span class="activity-badge badge-cadence">
                    ${cadenceIcons[activity.cadence]} ${cadenceLabels[activity.cadence]}
                </span>
            `);
        }

        // Status badge - LEFT
        const statusLabels = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        leftBadges.push(`
            <span class="activity-badge badge-status ${activity.status}">
                ${statusLabels[activity.status]}
            </span>
        `);

        // Due date badge - RIGHT
        if (activity.dueDate) {
            const dueClass = isOverdue(activity.dueDate) && activity.status !== 'completed'
                ? 'overdue'
                : isDueSoon(activity.dueDate) && activity.status !== 'completed'
                    ? 'due-soon'
                    : 'future';

            const dueIcon = dueClass === 'overdue' ? '⚠️' : '📅';
            rightBadges.push(`
                <span class="activity-badge badge-due ${dueClass}">
                    ${dueIcon} ${formatDate(activity.dueDate)}
                </span>
            `);
        }

        return {
            left: leftBadges.join(''),
            right: rightBadges.join('')
        };
    },

    /**
     * Create resources section HTML
     */
    createResourcesSection(resources) {
        const resourceItems = resources.map(resource => `
            <div class="resource-item">
                <a href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer" class="resource-link">
                    🔗 ${escapeHTML(resource.title)}
                </a>
            </div>
        `).join('');

        return `
            <div class="resources-list" style="margin-top: var(--spacing-sm);">
                ${resourceItems}
            </div>
        `;
    },

    /**
     * Create menu items for activity card
     */
    createMenuItems(activity) {
        const items = [];

        // Status change options
        if (activity.status !== 'completed') {
            items.push(`
                <button class="menu-item" onclick="ActivityListComponent.updateActivityStatus('${activity.id}', 'completed'); ActivityListComponent.closeMenu('${activity.id}')">
                    ✓ Mark Complete
                </button>
            `);
        }

        if (activity.status === 'not-started') {
            items.push(`
                <button class="menu-item" onclick="ActivityListComponent.updateActivityStatus('${activity.id}', 'in-progress'); ActivityListComponent.closeMenu('${activity.id}')">
                    ▶ Start
                </button>
            `);
        }

        // Edit option
        items.push(`
            <button class="menu-item" onclick="ActivityFormComponent.show('${activity.id}'); ActivityListComponent.closeMenu('${activity.id}')">
                ✏️ Edit
            </button>
        `);

        // Delete option
        items.push(`
            <button class="menu-item menu-item-danger" onclick="ActivityListComponent.deleteActivity('${activity.id}')">
                🗑️ Delete
            </button>
        `);

        return items.join('');
    },

    /**
     * Toggle menu dropdown
     */
    toggleMenu(activityId) {
        const menu = document.getElementById(`menu-${activityId}`);
        if (!menu) return;

        // Close all other menus
        document.querySelectorAll('.activity-menu-dropdown.active').forEach(m => {
            if (m.id !== `menu-${activityId}`) {
                m.classList.remove('active');
            }
        });

        menu.classList.toggle('active');
    },

    /**
     * Close menu dropdown
     */
    closeMenu(activityId) {
        const menu = document.getElementById(`menu-${activityId}`);
        if (menu) {
            menu.classList.remove('active');
        }
    },

    /**
     * Update activity status
     */
    updateActivityStatus(activityId, newStatus) {
        const activityModel = new ActivityModel();
        const activity = activityModel.getById(activityId);

        // Update status
        activityModel.updateStatus(activityId, newStatus);

        const statusLabels = {
            'not-started': 'marked as not started',
            'in-progress': 'started',
            'completed': 'completed'
        };

        // Celebrate if marking as completed!
        if (newStatus === 'completed') {
            // Find the activity card element for animation
            const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);

            // Trigger celebration
            CelebrationComponent.celebrate(activityCard);

            // Check for streak milestone
            const stats = activityModel.getStats();
            if (stats.currentStreak > 0) {
                CelebrationComponent.celebrateStreak(stats.currentStreak);
            }

            // Auto-repeat recurring tasks
            if (activity && activity.cadence && activity.cadence !== 'one-time') {
                this.createRecurringInstance(activity);
            }
        }

        UIController.showToast(`Activity ${statusLabels[newStatus]}`, 'success');
        UIController.refresh();
    },

    /**
     * Create a new instance of a recurring task
     */
    createRecurringInstance(completedActivity) {
        const activityModel = new ActivityModel();

        // Calculate next due date
        const nextDueDate = this.calculateNextDueDate(completedActivity.dueDate, completedActivity.cadence);

        // Create new instance with same properties
        const newActivity = {
            title: completedActivity.title,
            description: completedActivity.description || '',
            categoryId: completedActivity.categoryId || null,
            status: 'not-started',
            dueDate: nextDueDate,
            notes: completedActivity.notes || '',
            cadence: completedActivity.cadence,
            resources: completedActivity.resources || []
        };

        activityModel.create(newActivity);

        const cadenceLabels = {
            'daily': 'tomorrow',
            'weekly': 'next week',
            'monthly': 'next month'
        };

        UIController.showToast(
            `Recurring task will repeat ${cadenceLabels[completedActivity.cadence]}`,
            'info'
        );
    },

    /**
     * Calculate next due date based on cadence
     */
    calculateNextDueDate(currentDueDate, cadence) {
        if (!currentDueDate) {
            // If no due date, use today as base
            currentDueDate = Date.now();
        }

        const date = new Date(currentDueDate);
        date.setHours(0, 0, 0, 0);

        switch (cadence) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                // Add 1 month, handling month boundaries
                const currentMonth = date.getMonth();
                date.setMonth(currentMonth + 1);
                // If day changed (e.g., Jan 31 -> Feb 28), adjust
                if (date.getMonth() !== (currentMonth + 1) % 12) {
                    date.setDate(0); // Set to last day of previous month
                }
                break;
            default:
                return null;
        }

        return date.getTime();
    },

    /**
     * Delete activity
     */
    deleteActivity(activityId) {
        if (!confirm('Are you sure you want to delete this activity?')) {
            return;
        }

        const activityModel = new ActivityModel();
        if (activityModel.delete(activityId)) {
            UIController.showToast('Activity deleted', 'success');
            UIController.refresh();
        }
    }
};

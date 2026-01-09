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
                ${badges}
                ${activity.timeSpent > 0 ? `<span class="activity-time">⏱️ ${formatTimeSpent(activity.timeSpent)}</span>` : ''}
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
        const badges = [];

        // Category badge
        if (category) {
            badges.push(`
                <span class="activity-badge badge-category">
                    <span class="category-color" style="background-color: ${category.color}"></span>
                    ${escapeHTML(category.name)}
                </span>
            `);
        }

        // Status badge
        const statusLabels = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        badges.push(`
            <span class="activity-badge badge-status ${activity.status}">
                ${statusLabels[activity.status]}
            </span>
        `);

        // Due date badge
        if (activity.dueDate) {
            const dueClass = isOverdue(activity.dueDate) && activity.status !== 'completed'
                ? 'overdue'
                : isDueSoon(activity.dueDate) && activity.status !== 'completed'
                    ? 'due-soon'
                    : 'future';

            const dueIcon = dueClass === 'overdue' ? '⚠️' : '📅';
            badges.push(`
                <span class="activity-badge badge-due ${dueClass}">
                    ${dueIcon} ${formatDate(activity.dueDate)}
                </span>
            `);
        }

        return badges.join('');
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
        }

        UIController.showToast(`Activity ${statusLabels[newStatus]}`, 'success');
        UIController.refresh();
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

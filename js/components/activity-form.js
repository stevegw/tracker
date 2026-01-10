// Activity form component

const ActivityFormComponent = {
    currentResources: [],

    /**
     * Show activity form modal (create or edit)
     */
    show(activityId = null) {
        const modal = document.getElementById('activity-modal');
        const title = document.getElementById('activity-modal-title');
        const form = document.getElementById('activity-form');

        if (!modal || !title || !form) return;

        // Populate category select
        this.populateCategorySelect();

        if (activityId) {
            // Edit mode
            const activityModel = new ActivityModel();
            const activity = activityModel.getById(activityId);

            if (!activity) return;

            title.textContent = 'Edit Activity';
            document.getElementById('activity-id').value = activity.id;
            document.getElementById('activity-title').value = activity.title;
            document.getElementById('activity-description').value = activity.description || '';
            document.getElementById('activity-category').value = activity.categoryId || '';
            document.getElementById('activity-status').value = activity.status;
            document.getElementById('activity-due-date').value = timestampToDateInput(activity.dueDate);
            document.getElementById('activity-notes').value = activity.notes || '';
            document.getElementById('activity-cadence').value = activity.cadence || 'one-time';

            // Set resources
            this.currentResources = activity.resources || [];
            this.renderResources();
        } else {
            // Create mode
            title.textContent = 'New Activity';
            form.reset();
            document.getElementById('activity-id').value = '';
            this.currentResources = [];
            this.renderResources();
        }

        modal.classList.add('active');
    },

    /**
     * Hide activity form modal
     */
    hide() {
        const modal = document.getElementById('activity-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Populate category select options
     */
    populateCategorySelect() {
        const select = document.getElementById('activity-category');
        if (!select) return;

        const categoryModel = new CategoryModel();
        const categories = categoryModel.getAll();

        // Clear existing options except "None"
        select.innerHTML = '<option value="">None</option>';

        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    },

    /**
     * Handle form submission
     */
    handleSubmit(e) {
        e.preventDefault();

        const activityId = document.getElementById('activity-id').value;
        const title = document.getElementById('activity-title').value;
        const description = document.getElementById('activity-description').value;
        const categoryId = document.getElementById('activity-category').value;
        const status = document.getElementById('activity-status').value;
        const dueDateValue = document.getElementById('activity-due-date').value;
        const notes = document.getElementById('activity-notes').value;
        const cadence = document.getElementById('activity-cadence').value;

        const dueDate = dateInputToTimestamp(dueDateValue);

        const data = {
            title,
            description,
            categoryId: categoryId || null,
            status,
            dueDate,
            notes,
            cadence,
            resources: this.currentResources
        };

        const activityModel = new ActivityModel();

        if (activityId) {
            // Update existing activity
            activityModel.update(activityId, data);
            UIController.showToast('Activity updated', 'success');
        } else {
            // Create new activity
            activityModel.create(data);
            UIController.showToast('Activity created', 'success');
        }

        this.hide();
        UIController.refresh();
    },

    /**
     * Add resource to current resources
     */
    addResource() {
        const titleInput = document.getElementById('resource-title');
        const urlInput = document.getElementById('resource-url');

        if (!titleInput || !urlInput) return;

        const title = titleInput.value.trim();
        const url = urlInput.value.trim();

        if (!title || !url) {
            UIController.showToast('Please enter both title and URL', 'warning');
            return;
        }

        if (!isValidURL(url)) {
            UIController.showToast('Please enter a valid URL', 'warning');
            return;
        }

        this.currentResources.push({ title, url });
        this.renderResources();

        // Clear inputs
        titleInput.value = '';
        urlInput.value = '';
    },

    /**
     * Remove resource from current resources
     */
    removeResource(index) {
        this.currentResources.splice(index, 1);
        this.renderResources();
    },

    /**
     * Render resources list in form
     */
    renderResources() {
        const resourcesList = document.getElementById('resources-list');
        if (!resourcesList) return;

        if (this.currentResources.length === 0) {
            resourcesList.innerHTML = '<p style="font-size: 12px; color: var(--text-secondary);">No resources added yet</p>';
            return;
        }

        resourcesList.innerHTML = this.currentResources.map((resource, index) => `
            <div class="resource-item">
                <a href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer" class="resource-link">
                    🔗 ${escapeHTML(resource.title)}
                </a>
                <button type="button" class="resource-remove" onclick="ActivityFormComponent.removeResource(${index})">
                    Remove
                </button>
            </div>
        `).join('');
    },

    /**
     * Initialize event listeners
     */
    init() {
        // Form submit
        const form = document.getElementById('activity-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.handleSubmit(e);
            });
        }

        // Close button
        const closeBtn = document.getElementById('activity-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('activity-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Click outside to close
        const modal = document.getElementById('activity-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }

        // Add resource button
        const addResourceBtn = document.getElementById('add-resource-btn');
        if (addResourceBtn) {
            addResourceBtn.addEventListener('click', () => {
                this.addResource();
            });
        }

        // Enter key on resource inputs
        const resourceTitle = document.getElementById('resource-title');
        const resourceUrl = document.getElementById('resource-url');

        if (resourceTitle && resourceUrl) {
            [resourceTitle, resourceUrl].forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addResource();
                    }
                });
            });
        }
    }
};

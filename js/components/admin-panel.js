// Admin Panel Component
// Allows admins to create and manage lookup schedules (templates)

const AdminPanelComponent = {
    currentLookupId: null,

    /**
     * Initialize the Admin Panel Component
     */
    init() {
        // Close button for main panel
        const closeBtn = document.getElementById('admin-panel-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Click outside to close main panel
        const modal = document.getElementById('admin-panel-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }

        // Admin panel trigger button
        const triggerBtn = document.getElementById('admin-panel-trigger-btn');
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => {
                this.show();
            });
        }

        // Add new lookup button
        const addBtn = document.getElementById('admin-add-lookup-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showLookupForm();
            });
        }

        // Form modal close button
        const formCloseBtn = document.getElementById('admin-lookup-form-close');
        if (formCloseBtn) {
            formCloseBtn.addEventListener('click', () => {
                this.hideLookupForm();
            });
        }

        // Click outside to close form modal
        const formModal = document.getElementById('admin-lookup-form-modal');
        if (formModal) {
            formModal.addEventListener('click', (e) => {
                if (e.target === formModal) {
                    this.hideLookupForm();
                }
            });
        }

        // Form cancel button
        const cancelBtn = document.getElementById('admin-lookup-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideLookupForm();
            });
        }

        // Form submit
        const form = document.getElementById('admin-lookup-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        console.log('Admin Panel Component initialized');
    },

    /**
     * Show the admin panel modal
     */
    show() {
        const modal = document.getElementById('admin-panel-modal');
        if (modal) {
            modal.classList.add('active');
            this.renderLookupSchedules();
        }
    },

    /**
     * Hide the admin panel modal
     */
    hide() {
        const modal = document.getElementById('admin-panel-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Show the lookup form modal (create or edit)
     */
    showLookupForm(lookupId = null) {
        const modal = document.getElementById('admin-lookup-form-modal');
        const title = document.getElementById('admin-lookup-form-title');
        const form = document.getElementById('admin-lookup-form');

        if (!modal || !title || !form) return;

        // Populate category select
        this.populateCategorySelect();

        if (lookupId) {
            // Edit mode
            const lookupModel = new LookupScheduleModel();
            const lookup = lookupModel.getById(lookupId);

            if (!lookup) return;

            title.textContent = 'Edit Lookup Schedule';
            document.getElementById('admin-lookup-id').value = lookup.id;
            document.getElementById('admin-lookup-title').value = lookup.title;
            document.getElementById('admin-lookup-description').value = lookup.description || '';
            document.getElementById('admin-lookup-category').value = lookup.categoryId || '';
            document.getElementById('admin-lookup-cadence').value = lookup.cadence || 'weekly';
            document.getElementById('admin-lookup-studio').value = lookup.studio || '';
            document.getElementById('admin-lookup-time').value = lookup.time || '';
            document.getElementById('admin-lookup-notes').value = lookup.notes || '';
        } else {
            // Create mode
            title.textContent = 'New Lookup Schedule';
            form.reset();
            document.getElementById('admin-lookup-id').value = '';
            // Set default cadence to weekly
            document.getElementById('admin-lookup-cadence').value = 'weekly';
        }

        modal.classList.add('active');
    },

    /**
     * Hide the lookup form modal
     */
    hideLookupForm() {
        const modal = document.getElementById('admin-lookup-form-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Populate category select options
     */
    populateCategorySelect() {
        const select = document.getElementById('admin-lookup-category');
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
    async handleFormSubmit() {
        const lookupId = document.getElementById('admin-lookup-id').value;
        const title = document.getElementById('admin-lookup-title').value.trim();
        const description = document.getElementById('admin-lookup-description').value.trim();
        const categoryId = document.getElementById('admin-lookup-category').value;
        const cadence = document.getElementById('admin-lookup-cadence').value;
        const studio = document.getElementById('admin-lookup-studio').value.trim();
        const time = document.getElementById('admin-lookup-time').value;
        const notes = document.getElementById('admin-lookup-notes').value.trim();

        if (!title) {
            UIController.showToast('Please enter a title', 'error');
            return;
        }

        const data = {
            title,
            description,
            categoryId: categoryId || null,
            cadence,
            studio,
            time,
            notes
        };

        const lookupModel = new LookupScheduleModel();

        try {
            if (lookupId) {
                // Update existing lookup schedule
                await lookupModel.update(lookupId, data);
                UIController.showToast('Lookup schedule updated', 'success');
            } else {
                // Create new lookup schedule
                await lookupModel.create(data);
                UIController.showToast('Lookup schedule created', 'success');
            }

            this.hideLookupForm();
            this.renderLookupSchedules();
            UIController.refresh();
        } catch (error) {
            console.error('Error saving lookup schedule:', error);
            UIController.showToast('Error saving lookup schedule', 'error');
        }
    },

    /**
     * Render list of lookup schedules
     */
    renderLookupSchedules() {
        const container = document.getElementById('admin-lookup-list');
        if (!container) return;

        const lookupModel = new LookupScheduleModel();
        const categoryModel = new CategoryModel();
        const lookupSchedules = lookupModel.getAll();

        if (lookupSchedules.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No lookup schedules yet</h3>
                    <p>Create lookup schedules that users can select when creating activities.</p>
                    <button class="btn btn-primary" onclick="AdminPanelComponent.showLookupForm()">
                        ＋ Create First Lookup Schedule
                    </button>
                </div>
            `;
            return;
        }

        // Sort by title
        const sorted = [...lookupSchedules].sort((a, b) =>
            a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );

        // Group by category
        const grouped = {};
        sorted.forEach(schedule => {
            const categoryId = schedule.categoryId || 'uncategorized';
            if (!grouped[categoryId]) {
                grouped[categoryId] = [];
            }
            grouped[categoryId].push(schedule);
        });

        let html = '<div class="admin-lookup-grid">';

        // Render each category group
        Object.keys(grouped).forEach(categoryId => {
            const category = categoryId === 'uncategorized'
                ? { name: 'Uncategorized', color: '#999' }
                : categoryModel.getById(categoryId);

            const schedules = grouped[categoryId];

            html += `
                <div class="admin-category-section">
                    <h3 class="admin-category-header" style="color: ${category.color}; border-left: 4px solid ${category.color}; padding-left: 12px;">
                        ${escapeHTML(category.name)} <span style="color: var(--text-secondary); font-size: 14px;">(${schedules.length})</span>
                    </h3>
                    <div class="admin-lookup-cards">
            `;

            schedules.forEach(schedule => {
                html += `
                    <div class="admin-lookup-card">
                        <div class="admin-lookup-card-header">
                            <div class="admin-lookup-card-title">${escapeHTML(schedule.title)}</div>
                            <div class="admin-lookup-card-actions">
                                <button class="btn-icon" onclick="AdminPanelComponent.editLookup('${schedule.id}')" title="Edit">
                                    ✏️
                                </button>
                                <button class="btn-icon" onclick="AdminPanelComponent.deleteLookup('${schedule.id}')" title="Delete">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="admin-lookup-card-body">
                            ${schedule.description ? `<p class="admin-lookup-description">${escapeHTML(schedule.description)}</p>` : ''}
                            <div class="admin-lookup-meta">
                                ${schedule.studio ? `<span class="admin-lookup-badge">📍 ${escapeHTML(schedule.studio)}</span>` : ''}
                                ${schedule.time ? `<span class="admin-lookup-badge">🕐 ${escapeHTML(schedule.time)}</span>` : ''}
                                ${schedule.cadence && schedule.cadence !== 'one-time' ? `<span class="admin-lookup-badge">🔁 ${schedule.cadence}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += '</div>';

        container.innerHTML = html;
    },

    /**
     * Edit a lookup schedule
     */
    editLookup(lookupId) {
        this.showLookupForm(lookupId);
    },

    /**
     * Delete a lookup schedule
     */
    async deleteLookup(lookupId) {
        if (!confirm('Delete this lookup schedule? This will not affect any activities created from it.')) {
            return;
        }

        const lookupModel = new LookupScheduleModel();

        try {
            const success = await lookupModel.delete(lookupId);

            if (success) {
                this.renderLookupSchedules();
                UIController.showToast('Lookup schedule deleted', 'success');
                UIController.refresh();
            } else {
                UIController.showToast('Failed to delete lookup schedule', 'error');
            }
        } catch (error) {
            console.error('Error deleting lookup schedule:', error);
            UIController.showToast('Error deleting lookup schedule', 'error');
        }
    }
};

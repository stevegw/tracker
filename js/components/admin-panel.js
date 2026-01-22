// Admin Panel Component
// Allows admins to create and manage lookup schedules (templates)

const AdminPanelComponent = {
    currentLookupId: null,
    scheduleData: null,
    selectedClasses: new Set(),
    savedSchedules: [],
    currentTab: 'manage',

    /**
     * Initialize the Admin Panel Component
     */
    init() {
        // Load saved schedules
        this.savedSchedules = Storage.getSchedules();
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

        // ===== Import Schedule Tab Event Listeners =====

        // Parse schedule button
        const parseBtn = document.getElementById('admin-schedule-parse-btn');
        if (parseBtn) {
            parseBtn.addEventListener('click', () => {
                this.parseSchedule();
            });
        }

        // Import button
        const importBtn = document.getElementById('admin-schedule-import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importSelectedClasses();
            });
        }

        // Save as template button
        const saveTemplateBtn = document.getElementById('admin-schedule-save-template-btn');
        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => {
                this.saveAsTemplate();
            });
        }

        // Load template select
        const loadTemplateSelect = document.getElementById('admin-schedule-load-template');
        if (loadTemplateSelect) {
            loadTemplateSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadTemplate(e.target.value);
                }
            });
        }

        // Select all button
        const selectAllBtn = document.getElementById('admin-schedule-select-all-btn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAll();
            });
        }

        // Deselect all button
        const deselectAllBtn = document.getElementById('admin-schedule-deselect-all-btn');
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                this.deselectAll();
            });
        }

        // Back to input button
        const backBtn = document.getElementById('admin-schedule-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.resetImportView();
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
            // Switch to manage tab by default
            this.switchTab('manage');
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
    },

    // ===== Tab Management =====

    /**
     * Switch between manage and import tabs
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        const manageTab = document.getElementById('admin-tab-manage');
        const importTab = document.getElementById('admin-tab-import');
        const manageContent = document.getElementById('admin-content-manage');
        const importContent = document.getElementById('admin-content-import');

        if (tabName === 'manage') {
            manageTab.classList.add('active');
            importTab.classList.remove('active');
            manageContent.style.display = 'block';
            importContent.style.display = 'none';
        } else {
            manageTab.classList.remove('active');
            importTab.classList.add('active');
            manageContent.style.display = 'none';
            importContent.style.display = 'block';
            this.renderTemplateList();
        }
    },

    // ===== Import Schedule Functionality =====

    /**
     * Reset the import view to initial state
     */
    resetImportView() {
        const inputArea = document.getElementById('admin-schedule-input-area');
        const previewArea = document.getElementById('admin-schedule-preview-area');
        if (inputArea) inputArea.style.display = 'block';
        if (previewArea) previewArea.style.display = 'none';

        const textArea = document.getElementById('admin-schedule-text-input');
        if (textArea) textArea.value = '';

        this.scheduleData = null;
        this.selectedClasses.clear();
    },

    /**
     * Render list of saved templates
     */
    renderTemplateList() {
        const select = document.getElementById('admin-schedule-load-template');
        if (!select) return;

        select.innerHTML = '<option value="">-- Load a saved schedule --</option>';
        this.savedSchedules.forEach((schedule, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = schedule.name;
            select.appendChild(option);
        });
    },

    /**
     * Load a saved template
     */
    loadTemplate(index) {
        const schedule = this.savedSchedules[index];
        if (!schedule) return;

        const textArea = document.getElementById('admin-schedule-text-input');
        if (textArea) {
            textArea.value = schedule.text;
        }

        UIController.showToast(`Loaded schedule: ${schedule.name}`, 'success');
    },

    /**
     * Parse the schedule text
     */
    parseSchedule() {
        const textArea = document.getElementById('admin-schedule-text-input');
        if (!textArea) return;

        const text = textArea.value.trim();
        if (!text) {
            UIController.showToast('Please paste some schedule text first', 'error');
            return;
        }

        const result = parseScheduleText(text);

        if (!result.success) {
            UIController.showToast(result.error, 'error');
            return;
        }

        this.scheduleData = result.data;
        this.selectedClasses.clear();
        this.renderPreview();

        // Show preview, hide input
        const inputArea = document.getElementById('admin-schedule-input-area');
        const previewArea = document.getElementById('admin-schedule-preview-area');
        if (inputArea) inputArea.style.display = 'none';
        if (previewArea) previewArea.style.display = 'block';

        UIController.showToast('Schedule parsed successfully! Select classes to import.', 'success');
    },

    /**
     * Render the preview of parsed schedule
     */
    renderPreview() {
        const container = document.getElementById('admin-schedule-preview-content');
        if (!container || !this.scheduleData) return;

        const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        let html = '';

        daysOrder.forEach(day => {
            const classes = this.scheduleData[day];
            if (!classes || classes.length === 0) return;

            html += `
                <div class="schedule-day-section">
                    <h3 class="schedule-day-header">${day}</h3>
                    <div class="schedule-classes-list">
            `;

            classes.forEach((classItem, index) => {
                const key = `${day}-${index}`;
                const isSelected = this.selectedClasses.has(key);

                html += `
                    <label class="schedule-class-item ${isSelected ? 'selected' : ''}">
                        <input type="checkbox"
                               ${isSelected ? 'checked' : ''}
                               onchange="AdminPanelComponent.toggleClass('${day}', ${index})">
                        <div class="schedule-class-info">
                            <div class="schedule-class-name">${escapeHTML(classItem.className)}</div>
                            <div class="schedule-class-meta">
                                <span class="schedule-class-time">🕐 ${escapeHTML(classItem.time)}</span>
                                ${classItem.location ? `<span class="schedule-class-location">📍 ${escapeHTML(classItem.location)}</span>` : ''}
                            </div>
                        </div>
                    </label>
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
     * Toggle class selection
     */
    toggleClass(day, index) {
        const key = `${day}-${index}`;
        if (this.selectedClasses.has(key)) {
            this.selectedClasses.delete(key);
        } else {
            this.selectedClasses.add(key);
        }
        this.renderPreview();
        this.updateSelectionCount();
    },

    /**
     * Select all classes
     */
    selectAll() {
        const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        daysOrder.forEach(day => {
            const classes = this.scheduleData[day];
            if (classes) {
                classes.forEach((_, index) => {
                    this.selectedClasses.add(`${day}-${index}`);
                });
            }
        });
        this.renderPreview();
        this.updateSelectionCount();
    },

    /**
     * Deselect all classes
     */
    deselectAll() {
        this.selectedClasses.clear();
        this.renderPreview();
        this.updateSelectionCount();
    },

    /**
     * Update selection count display
     */
    updateSelectionCount() {
        const count = this.selectedClasses.size;
        const importBtn = document.getElementById('admin-schedule-import-btn');
        if (importBtn) {
            importBtn.textContent = count > 0
                ? `Import ${count} Selected ${count === 1 ? 'Class' : 'Classes'}`
                : 'Import Selected Classes';
        }
    },

    /**
     * Import selected classes as lookup schedule templates
     */
    async importSelectedClasses() {
        if (this.selectedClasses.size === 0) {
            UIController.showToast('Please select at least one class to import', 'error');
            return;
        }

        const categoryModel = new CategoryModel();
        const lookupModel = new LookupScheduleModel();

        // Find or create "Classes" category
        let classesCategory = categoryModel.getAll().find(cat => cat.name === 'Classes');
        if (!classesCategory) {
            classesCategory = categoryModel.create('Classes', 'Fitness and activity classes');
        }

        let importedCount = 0;

        // Create lookup schedule templates for selected classes
        for (const key of this.selectedClasses) {
            const [day, indexStr] = key.split('-');
            const index = parseInt(indexStr, 10);
            const classItem = this.scheduleData[day][index];

            if (!classItem) continue;

            // Create lookup schedule template (not a regular activity)
            await lookupModel.create({
                title: classItem.className,
                description: `${day} at ${classItem.time}`,
                categoryId: classesCategory.id,
                cadence: 'weekly',
                studio: classItem.location,
                time: classItem.time,
                notes: `Lookup schedule - imported on ${formatDate(Date.now())}`
            });

            importedCount++;
        }

        // Refresh the manage tab to show the new schedules
        this.renderLookupSchedules();

        // Reset the import view
        this.resetImportView();

        // Switch back to manage tab
        this.switchTab('manage');

        // Refresh UI
        UIController.refresh();

        // Show success message
        UIController.showToast(`Successfully imported ${importedCount} lookup ${importedCount === 1 ? 'schedule' : 'schedules'}! They are now available to all users.`, 'success');
    },

    /**
     * Save current schedule as a template
     */
    saveAsTemplate() {
        const textArea = document.getElementById('admin-schedule-text-input');
        if (!textArea || !textArea.value.trim()) {
            UIController.showToast('No schedule text to save', 'error');
            return;
        }

        const name = prompt('Enter a name for this schedule template:');
        if (!name) return;

        const template = {
            id: generateUUID(),
            name: name.trim(),
            text: textArea.value.trim(),
            createdAt: Date.now()
        };

        this.savedSchedules.push(template);
        Storage.saveSchedules(this.savedSchedules);

        this.renderTemplateList();
        UIController.showToast(`Schedule template "${name}" saved!`, 'success');
    }
};

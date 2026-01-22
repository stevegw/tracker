// Schedule Import Component
// Allows users to import class schedules from text and create activities

const ScheduleImportComponent = {
    scheduleData: null,
    selectedClasses: new Set(),
    savedSchedules: [],

    /**
     * Initialize the Schedule Import Component
     */
    init() {
        // Load saved schedules
        this.savedSchedules = Storage.getSchedules();

        // Close button
        const closeBtn = document.getElementById('schedule-import-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Click outside to close
        const modal = document.getElementById('schedule-import-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }

        // Parse button
        const parseBtn = document.getElementById('schedule-parse-btn');
        if (parseBtn) {
            parseBtn.addEventListener('click', () => {
                this.parseSchedule();
            });
        }

        // Import button
        const importBtn = document.getElementById('schedule-import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importSelectedClasses();
            });
        }

        // Save as template button
        const saveTemplateBtn = document.getElementById('schedule-save-template-btn');
        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => {
                this.saveAsTemplate();
            });
        }

        // Load template select
        const loadTemplateSelect = document.getElementById('schedule-load-template');
        if (loadTemplateSelect) {
            loadTemplateSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadTemplate(e.target.value);
                }
            });
        }

        // Schedule import button
        const scheduleImportBtn = document.getElementById('schedule-import-trigger-btn');
        if (scheduleImportBtn) {
            scheduleImportBtn.addEventListener('click', () => {
                this.show();
            });
        }

        // Select all button
        const selectAllBtn = document.getElementById('schedule-select-all-btn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAll();
            });
        }

        // Deselect all button
        const deselectAllBtn = document.getElementById('schedule-deselect-all-btn');
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                this.deselectAll();
            });
        }

        console.log('Schedule Import Component initialized');
    },

    /**
     * Show the schedule import modal
     */
    show() {
        const modal = document.getElementById('schedule-import-modal');
        if (modal) {
            modal.classList.add('active');
            this.renderTemplateList();
            this.resetView();
        }
    },

    /**
     * Hide the schedule import modal
     */
    hide() {
        const modal = document.getElementById('schedule-import-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Reset the view to initial state
     */
    resetView() {
        const inputArea = document.getElementById('schedule-input-area');
        const previewArea = document.getElementById('schedule-preview-area');
        if (inputArea) inputArea.style.display = 'block';
        if (previewArea) previewArea.style.display = 'none';

        const textArea = document.getElementById('schedule-text-input');
        if (textArea) textArea.value = '';

        this.scheduleData = null;
        this.selectedClasses.clear();
    },

    /**
     * Render list of saved templates
     */
    renderTemplateList() {
        const select = document.getElementById('schedule-load-template');
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

        const textArea = document.getElementById('schedule-text-input');
        if (textArea) {
            textArea.value = schedule.text;
        }

        UIController.showToast(`Loaded schedule: ${schedule.name}`, 'success');
    },

    /**
     * Parse the schedule text
     */
    parseSchedule() {
        const textArea = document.getElementById('schedule-text-input');
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
        const inputArea = document.getElementById('schedule-input-area');
        const previewArea = document.getElementById('schedule-preview-area');
        if (inputArea) inputArea.style.display = 'none';
        if (previewArea) previewArea.style.display = 'block';

        UIController.showToast('Schedule parsed successfully! Select classes to import.', 'success');
    },

    /**
     * Render the preview of parsed schedule
     */
    renderPreview() {
        const container = document.getElementById('schedule-preview-content');
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
                               onchange="ScheduleImportComponent.toggleClass('${day}', ${index})">
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
        const importBtn = document.getElementById('schedule-import-btn');
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

        // Refresh UI
        UIController.refresh();

        // Close modal
        this.hide();

        // Show success message
        UIController.showToast(`Successfully imported ${importedCount} lookup ${importedCount === 1 ? 'schedule' : 'schedules'}! Use the Schedule Lookup to add them to your activities.`, 'success');
    },

    /**
     * Save current schedule as a template
     */
    saveAsTemplate() {
        const textArea = document.getElementById('schedule-text-input');
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
    },

    /**
     * Delete a saved schedule template
     */
    deleteTemplate(index) {
        if (!confirm('Delete this schedule template?')) return;

        this.savedSchedules.splice(index, 1);
        Storage.saveSchedules(this.savedSchedules);
        this.renderTemplateList();
        UIController.showToast('Schedule template deleted', 'success');
    }
};

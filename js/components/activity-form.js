// Activity form component

const ActivityFormComponent = {
    currentResources: [],
    currentDescription: '',
    currentNotes: '',
    modalCommandBarInput: null,
    modalCommandBarSuggestions: null,
    currentSuggestions: [],
    selectedSuggestionIndex: -1,

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
            document.getElementById('activity-category').value = activity.categoryId || '';
            document.getElementById('activity-status').value = activity.status;
            document.getElementById('activity-due-date').value = timestampToDateInput(activity.dueDate);
            document.getElementById('activity-cadence').value = activity.cadence || 'one-time';
            document.getElementById('activity-studio').value = activity.studio || '';
            document.getElementById('activity-time').value = activity.time || '';

            // Set reminder values
            document.getElementById('activity-reminder-enabled').checked = activity.reminderEnabled || false;
            document.getElementById('activity-reminder-time').value = activity.reminderTime || '';
            document.getElementById('activity-reminder-before').value = activity.reminderMinutesBefore || '';

            // Show/hide reminder options based on checkbox
            this.updateReminderOptionsVisibility();

            // Store details in memory and hidden fields
            this.currentDescription = activity.description || '';
            this.currentNotes = activity.notes || '';
            document.getElementById('activity-description').value = this.currentDescription;
            document.getElementById('activity-notes').value = this.currentNotes;

            // Set resources
            this.currentResources = activity.resources || [];
            this.renderDetailsResources();
        } else {
            // Create mode
            title.textContent = 'New Activity';
            form.reset();
            document.getElementById('activity-id').value = '';
            this.currentDescription = '';
            this.currentNotes = '';
            this.currentResources = [];
            this.renderDetailsResources();

            // Hide reminder options by default
            this.updateReminderOptionsVisibility();
        }

        // Update due date field visibility based on cadence
        this.updateDueDateVisibility();

        // Clear modal command bar
        if (this.modalCommandBarInput) {
            this.modalCommandBarInput.value = '';
        }

        modal.classList.add('active');
    },

    /**
     * Show activity form modal with pre-populated data from command bar
     */
    showWithParsedData(parsed) {
        const modal = document.getElementById('activity-modal');
        const title = document.getElementById('activity-modal-title');
        const form = document.getElementById('activity-form');

        if (!modal || !title || !form) return;

        // Populate category select
        this.populateCategorySelect();

        // Set to create mode
        title.textContent = 'New Activity';
        form.reset();
        document.getElementById('activity-id').value = '';
        this.currentDescription = '';
        this.currentNotes = '';
        this.currentResources = [];
        this.renderDetailsResources();

        // Pre-populate fields from parsed data
        if (parsed.title) {
            document.getElementById('activity-title').value = parsed.title;
        }

        if (parsed.categoryId) {
            document.getElementById('activity-category').value = parsed.categoryId;
        }

        if (parsed.dueDate) {
            const dateInput = timestampToDateInput(parsed.dueDate);
            document.getElementById('activity-due-date').value = dateInput;
        }

        if (parsed.cadence) {
            document.getElementById('activity-cadence').value = parsed.cadence;
        }

        if (parsed.status) {
            document.getElementById('activity-status').value = parsed.status;
        }

        if (parsed.studio) {
            document.getElementById('activity-studio').value = parsed.studio;
        }

        if (parsed.time) {
            document.getElementById('activity-time').value = parsed.time;
        }

        // Update due date visibility based on cadence
        this.updateDueDateVisibility();

        // Clear modal command bar
        if (this.modalCommandBarInput) {
            this.modalCommandBarInput.value = '';
        }

        modal.classList.add('active');

        // Focus on title field for immediate editing
        setTimeout(() => {
            document.getElementById('activity-title').focus();
            // Move cursor to end of text
            const titleInput = document.getElementById('activity-title');
            titleInput.setSelectionRange(titleInput.value.length, titleInput.value.length);
        }, 100);
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
        const categoryId = document.getElementById('activity-category').value;
        const status = document.getElementById('activity-status').value;
        const dueDateValue = document.getElementById('activity-due-date').value;
        const cadence = document.getElementById('activity-cadence').value;
        const studio = document.getElementById('activity-studio').value;
        const time = document.getElementById('activity-time').value;

        // Read description and notes from hidden fields (updated by details modal)
        const description = document.getElementById('activity-description').value;
        const notes = document.getElementById('activity-notes').value;

        // Read reminder values
        const reminderEnabled = document.getElementById('activity-reminder-enabled').checked;
        const reminderTime = document.getElementById('activity-reminder-time').value;
        const reminderBefore = document.getElementById('activity-reminder-before').value;

        const dueDate = dateInputToTimestamp(dueDateValue);

        const data = {
            title,
            description,
            categoryId: categoryId || null,
            status,
            dueDate,
            notes,
            cadence,
            resources: this.currentResources,
            studio,
            time,
            reminderEnabled,
            reminderTime: reminderTime || null,
            reminderMinutesBefore: reminderBefore ? parseInt(reminderBefore) : null
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
     * Add resource to current resources (in details modal)
     */
    addDetailsResource() {
        const titleInput = document.getElementById('details-resource-title');
        const urlInput = document.getElementById('details-resource-url');

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
        this.renderDetailsResources();

        // Clear inputs
        titleInput.value = '';
        urlInput.value = '';
    },

    /**
     * Remove resource from current resources
     */
    removeDetailsResource(index) {
        this.currentResources.splice(index, 1);
        this.renderDetailsResources();
    },

    /**
     * Render resources list in details modal
     */
    renderDetailsResources() {
        const resourcesList = document.getElementById('details-resources-list');
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
                <button type="button" class="resource-remove" onclick="ActivityFormComponent.removeDetailsResource(${index})">
                    Remove
                </button>
            </div>
        `).join('');
    },

    /**
     * Handle modal command bar keydown
     */
    handleModalCommandBarKeyDown(e) {
        // Enter - parse and fill form
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.selectedSuggestionIndex >= 0 && this.currentSuggestions.length > 0) {
                this.applyModalSuggestion(this.currentSuggestions[this.selectedSuggestionIndex]);
            } else {
                this.parseAndFillForm();
            }
            return;
        }

        // Escape - clear input
        if (e.key === 'Escape') {
            e.preventDefault();
            if (this.modalCommandBarInput) {
                this.modalCommandBarInput.value = '';
                this.hideModalSuggestions();
            }
            return;
        }

        // Arrow up/down - navigate suggestions
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedSuggestionIndex = Math.min(
                this.selectedSuggestionIndex + 1,
                this.currentSuggestions.length - 1
            );
            this.updateModalSuggestionHighlight();
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
            this.updateModalSuggestionHighlight();
            return;
        }
    },

    /**
     * Handle modal command bar input
     */
    handleModalCommandBarInput() {
        const text = this.modalCommandBarInput.value.trim();

        if (text.length === 0) {
            this.hideModalSuggestions();
            return;
        }

        // Show category suggestions if typing @
        if (text.includes('@')) {
            this.showModalCategorySuggestions(text);
        } else {
            this.hideModalSuggestions();
        }
    },

    /**
     * Parse command bar input and fill form fields
     */
    parseAndFillForm() {
        const text = this.modalCommandBarInput.value.trim();

        if (!text) {
            return;
        }

        // Use the same parsing logic from CommandBarComponent
        const parsed = CommandBarComponent.parseInput(text);

        // Fill form fields
        document.getElementById('activity-title').value = parsed.title;

        if (parsed.categoryId) {
            document.getElementById('activity-category').value = parsed.categoryId;
        } else if (parsed.newCategoryName) {
            // Auto-create category
            const categoryModel = new CategoryModel();
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const created = categoryModel.create(
                parsed.newCategoryName,
                `Auto-created from @${parsed.newCategoryName.replace(/\s+/g, '-')}`,
                randomColor
            );

            if (created) {
                // Refresh category select
                this.populateCategorySelect();
                document.getElementById('activity-category').value = created.id;
                UIController.showToast(`Category "${created.name}" created`, 'success');

                // Refresh sidebar to show new category
                SidebarComponent.render();
            }
        }

        if (parsed.dueDate) {
            const dateInput = timestampToDateInput(parsed.dueDate);
            document.getElementById('activity-due-date').value = dateInput;
        }

        if (parsed.cadence) {
            document.getElementById('activity-cadence').value = parsed.cadence;
        }

        // Update due date visibility
        this.updateDueDateVisibility();

        // Clear the command bar input
        this.modalCommandBarInput.value = '';
        this.hideModalSuggestions();

        // Focus on title field for further editing
        document.getElementById('activity-title').focus();
    },

    /**
     * Update due date field visibility based on cadence selection
     */
    updateDueDateVisibility() {
        const cadence = document.getElementById('activity-cadence').value;
        const dueDateGroup = document.getElementById('due-date-group');

        if (!dueDateGroup) return;

        // Hide due date for recurring cadences (daily, weekly, monthly)
        if (cadence === 'daily' || cadence === 'weekly' || cadence === 'monthly') {
            dueDateGroup.style.display = 'none';
            // Clear the due date value when hidden
            document.getElementById('activity-due-date').value = '';
        } else {
            dueDateGroup.style.display = '';
        }
    },

    /**
     * Update reminder options visibility based on checkbox
     */
    updateReminderOptionsVisibility() {
        const reminderEnabled = document.getElementById('activity-reminder-enabled');
        const reminderOptions = document.getElementById('reminder-options');

        if (!reminderEnabled || !reminderOptions) return;

        if (reminderEnabled.checked) {
            reminderOptions.style.display = '';
        } else {
            reminderOptions.style.display = 'none';
        }
    },

    /**
     * Show activity details modal
     */
    showDetailsModal() {
        // Populate details modal with current values
        document.getElementById('details-description').value = this.currentDescription;
        document.getElementById('details-notes').value = this.currentNotes;
        this.renderDetailsResources();

        // Show the modal
        const detailsModal = document.getElementById('activity-details-modal');
        if (detailsModal) {
            detailsModal.classList.add('active');
        }
    },

    /**
     * Hide activity details modal
     */
    hideDetailsModal() {
        const detailsModal = document.getElementById('activity-details-modal');
        if (detailsModal) {
            detailsModal.classList.remove('active');
        }
    },

    /**
     * Save details from details modal
     */
    saveDetails() {
        // Save values from details modal to memory and hidden fields
        this.currentDescription = document.getElementById('details-description').value;
        this.currentNotes = document.getElementById('details-notes').value;

        document.getElementById('activity-description').value = this.currentDescription;
        document.getElementById('activity-notes').value = this.currentNotes;

        this.hideDetailsModal();
        UIController.showToast('Details saved', 'success');
    },

    /**
     * Show category suggestions in modal
     */
    showModalCategorySuggestions(text) {
        const lastAtIndex = text.lastIndexOf('@');
        const searchTerm = text.substring(lastAtIndex + 1).toLowerCase();

        const categoryModel = new CategoryModel();
        const categories = categoryModel.getAll();
        const matches = categories.filter(cat =>
            cat.name.toLowerCase().includes(searchTerm)
        );

        if (matches.length === 0) {
            this.hideModalSuggestions();
            return;
        }

        this.currentSuggestions = matches.map(cat => ({
            type: 'category',
            text: `@${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
            label: cat.name,
            color: cat.color,
            data: cat
        }));

        this.renderModalSuggestions();
    },

    /**
     * Render suggestions for modal command bar
     */
    renderModalSuggestions() {
        if (!this.modalCommandBarSuggestions || this.currentSuggestions.length === 0) {
            return;
        }

        const html = this.currentSuggestions.map((suggestion, index) => {
            const isSelected = index === this.selectedSuggestionIndex;
            return `
                <div class="command-suggestion ${isSelected ? 'selected' : ''}"
                     data-index="${index}"
                     onmousedown="ActivityFormComponent.applyModalSuggestionByIndex(${index})">
                    ${suggestion.type === 'category' ? `
                        <span class="suggestion-tag" style="background: ${suggestion.color}20; color: ${suggestion.color}; border: 1px solid ${suggestion.color}">
                            ${suggestion.label}
                        </span>
                        <span class="suggestion-text">${suggestion.text}</span>
                    ` : suggestion.label}
                </div>
            `;
        }).join('');

        this.modalCommandBarSuggestions.innerHTML = html;
        this.modalCommandBarSuggestions.style.display = 'block';
        this.selectedSuggestionIndex = -1;
    },

    /**
     * Update modal suggestion highlight
     */
    updateModalSuggestionHighlight() {
        if (!this.modalCommandBarSuggestions) return;

        const items = this.modalCommandBarSuggestions.querySelectorAll('.command-suggestion');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSuggestionIndex);
        });
    },

    /**
     * Apply selected suggestion in modal
     */
    applyModalSuggestion(suggestion) {
        if (suggestion.type === 'category') {
            const currentText = this.modalCommandBarInput.value;
            const lastAtIndex = currentText.lastIndexOf('@');
            const newText = currentText.substring(0, lastAtIndex) + suggestion.text + ' ';
            this.modalCommandBarInput.value = newText;
            this.modalCommandBarInput.focus();
        }

        this.hideModalSuggestions();
    },

    /**
     * Apply suggestion by index (for mouse clicks)
     */
    applyModalSuggestionByIndex(index) {
        if (index >= 0 && index < this.currentSuggestions.length) {
            this.applyModalSuggestion(this.currentSuggestions[index]);
        }
    },

    /**
     * Hide modal suggestions
     */
    hideModalSuggestions() {
        setTimeout(() => {
            if (this.modalCommandBarSuggestions) {
                this.modalCommandBarSuggestions.style.display = 'none';
                this.modalCommandBarSuggestions.innerHTML = '';
            }
            this.currentSuggestions = [];
            this.selectedSuggestionIndex = -1;
        }, 200);
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

        // More Details button
        const moreDetailsBtn = document.getElementById('more-details-btn');
        if (moreDetailsBtn) {
            moreDetailsBtn.addEventListener('click', () => {
                this.showDetailsModal();
            });
        }

        // Details modal close button
        const detailsCloseBtn = document.getElementById('activity-details-modal-close');
        if (detailsCloseBtn) {
            detailsCloseBtn.addEventListener('click', () => {
                this.hideDetailsModal();
            });
        }

        // Details modal save button
        const detailsSaveBtn = document.getElementById('activity-details-save-btn');
        if (detailsSaveBtn) {
            detailsSaveBtn.addEventListener('click', () => {
                this.saveDetails();
            });
        }

        // Click outside to close details modal
        const detailsModal = document.getElementById('activity-details-modal');
        if (detailsModal) {
            detailsModal.addEventListener('click', (e) => {
                if (e.target === detailsModal) {
                    this.hideDetailsModal();
                }
            });
        }

        // Add resource button in details modal
        const addDetailsResourceBtn = document.getElementById('details-add-resource-btn');
        if (addDetailsResourceBtn) {
            addDetailsResourceBtn.addEventListener('click', () => {
                this.addDetailsResource();
            });
        }

        // Enter key on resource inputs in details modal
        const detailsResourceTitle = document.getElementById('details-resource-title');
        const detailsResourceUrl = document.getElementById('details-resource-url');

        if (detailsResourceTitle && detailsResourceUrl) {
            [detailsResourceTitle, detailsResourceUrl].forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addDetailsResource();
                    }
                });
            });
        }

        // Cadence change - update due date visibility
        const cadenceSelect = document.getElementById('activity-cadence');
        if (cadenceSelect) {
            cadenceSelect.addEventListener('change', () => {
                this.updateDueDateVisibility();
            });
        }

        // Reminder checkbox - update reminder options visibility
        const reminderCheckbox = document.getElementById('activity-reminder-enabled');
        if (reminderCheckbox) {
            reminderCheckbox.addEventListener('change', () => {
                this.updateReminderOptionsVisibility();
            });
        }

        // Modal command bar
        this.modalCommandBarInput = document.getElementById('modal-command-bar-input');
        this.modalCommandBarSuggestions = document.getElementById('modal-command-bar-suggestions');

        if (this.modalCommandBarInput) {
            this.modalCommandBarInput.addEventListener('keydown', (e) => {
                this.handleModalCommandBarKeyDown(e);
            });

            this.modalCommandBarInput.addEventListener('input', () => {
                this.handleModalCommandBarInput();
            });

            this.modalCommandBarInput.addEventListener('blur', () => {
                this.hideModalSuggestions();
            });
        }
    }
};

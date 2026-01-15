// Activity form component

const ActivityFormComponent = {
    currentResources: [],
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

        // Clear modal command bar
        if (this.modalCommandBarInput) {
            this.modalCommandBarInput.value = '';
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

        // Clear the command bar input
        this.modalCommandBarInput.value = '';
        this.hideModalSuggestions();

        // Focus on title field for further editing
        document.getElementById('activity-title').focus();
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

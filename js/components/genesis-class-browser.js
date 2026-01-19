// Genesis Class Browser Component
// Displays Genesis Health Clubs classes and allows users to add them as activities

const GenesisClassBrowserComponent = {
    searchInput: null,
    contentElement: null,
    currentFilter: '',

    /**
     * Initialize the Genesis Class Browser
     */
    init() {
        this.searchInput = document.getElementById('genesis-search-input');
        this.contentElement = document.getElementById('genesis-classes-content');

        // Close button
        const closeBtn = document.getElementById('genesis-classes-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Click outside to close
        const modal = document.getElementById('genesis-classes-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }

        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.currentFilter = this.searchInput.value.toLowerCase().trim();
                this.render();
            });
        }

        // Genesis Classes button
        const genesisBtn = document.getElementById('genesis-classes-btn');
        if (genesisBtn) {
            genesisBtn.addEventListener('click', () => {
                this.show();
            });
        }

        console.log('Genesis Class Browser initialized');
    },

    /**
     * Show the Genesis Class Browser modal
     */
    show() {
        const modal = document.getElementById('genesis-classes-modal');
        if (modal) {
            modal.classList.add('active');
            this.currentFilter = '';
            if (this.searchInput) {
                this.searchInput.value = '';
            }
            this.render();
        }
    },

    /**
     * Hide the Genesis Class Browser modal
     */
    hide() {
        const modal = document.getElementById('genesis-classes-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Render all classes by category
     */
    render() {
        if (!this.contentElement) return;

        const categories = GENESIS_CLASSES_DATA.categories;
        let html = '';

        categories.forEach(category => {
            // Filter classes based on search
            const filteredClasses = category.classes.filter(classItem => {
                if (!this.currentFilter) return true;
                const searchText = `${classItem.name} ${classItem.description} ${classItem.difficulty}`.toLowerCase();
                return searchText.includes(this.currentFilter);
            });

            // Skip category if no classes match filter
            if (filteredClasses.length === 0) return;

            html += `
                <div class="genesis-category">
                    <h3 class="genesis-category-title">
                        <span class="genesis-category-icon">${category.icon}</span>
                        ${escapeHTML(category.name)}
                        <span class="genesis-category-count">${filteredClasses.length} ${filteredClasses.length === 1 ? 'class' : 'classes'}</span>
                    </h3>
                    <div class="genesis-classes-grid">
            `;

            filteredClasses.forEach(classItem => {
                const difficultyBadge = this.getDifficultyBadge(classItem.difficulty);
                const durationText = classItem.duration ? `${classItem.duration} min` : '';

                html += `
                    <div class="genesis-class-card" onclick="GenesisClassBrowserComponent.selectClass('${escapeHTML(category.id)}', '${escapeHTML(classItem.name)}')">
                        <div class="genesis-class-header">
                            <h4 class="genesis-class-name">${escapeHTML(classItem.name)}</h4>
                            <div class="genesis-class-meta">
                                ${durationText ? `<span class="genesis-class-duration">⏱️ ${durationText}</span>` : ''}
                                ${difficultyBadge}
                            </div>
                        </div>
                        <p class="genesis-class-description">${escapeHTML(classItem.description)}</p>
                        ${classItem.equipment ? `<div class="genesis-class-equipment">📦 ${escapeHTML(classItem.equipment)}</div>` : ''}
                        <button class="genesis-class-add-btn" type="button">
                            <span>＋</span> Add to Tracker
                        </button>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        if (html === '') {
            html = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No classes found matching your search.</div>';
        }

        this.contentElement.innerHTML = html;
    },

    /**
     * Get difficulty badge HTML
     */
    getDifficultyBadge(difficulty) {
        const badges = {
            'beginner': '<span class="genesis-difficulty-badge difficulty-beginner">Beginner</span>',
            'intermediate': '<span class="genesis-difficulty-badge difficulty-intermediate">Intermediate</span>',
            'advanced': '<span class="genesis-difficulty-badge difficulty-advanced">Advanced</span>',
            'all-levels': '<span class="genesis-difficulty-badge difficulty-all-levels">All Levels</span>',
            'kids': '<span class="genesis-difficulty-badge difficulty-kids">Kids</span>'
        };
        return badges[difficulty] || '';
    },

    /**
     * Select a class and create an activity from it
     */
    selectClass(categoryId, className) {
        // Find the class data
        const category = GENESIS_CLASSES_DATA.categories.find(cat => cat.id === categoryId);
        if (!category) return;

        const classData = category.classes.find(cls => cls.name === className);
        if (!classData) return;

        // Create parsed data for the activity form
        const parsed = {
            title: classData.name,
            description: classData.description,
            categoryId: null,
            newCategoryName: 'Genesis Fitness',
            dueDate: null,
            cadence: 'weekly', // Default to weekly for fitness classes
            status: 'not-started',
            notes: `Duration: ${classData.duration} min\nDifficulty: ${classData.difficulty}\n${classData.equipment ? 'Equipment: ' + classData.equipment : ''}`,
            studio: '', // User will fill in their preferred studio location
            time: '' // User will fill in the class time
        };

        // Hide this modal
        this.hide();

        // Show activity form with pre-populated data
        ActivityFormComponent.showWithParsedData(parsed);

        // Show toast
        UIController.showToast(`Adding ${classData.name} class`, 'success');
    }
};

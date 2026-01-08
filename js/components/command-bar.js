// Smart Command Bar - Natural language activity creation
// Parses input like "Deploy app by Friday @aws" into structured activity data

const CommandBarComponent = {
    inputElement: null,
    suggestionsElement: null,
    currentSuggestions: [],
    selectedSuggestionIndex: -1,

    /**
     * Initialize the command bar
     */
    init() {
        this.inputElement = document.getElementById('command-bar-input');
        this.suggestionsElement = document.getElementById('command-bar-suggestions');

        if (!this.inputElement) {
            console.error('Command bar input element not found');
            return;
        }

        // Set up event listeners
        this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.inputElement.addEventListener('input', () => this.handleInput());
        this.inputElement.addEventListener('blur', () => this.hideSuggestions());

        console.log('Command bar initialized');
    },

    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        // Enter - create activity
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.selectedSuggestionIndex >= 0 && this.currentSuggestions.length > 0) {
                this.applySuggestion(this.currentSuggestions[this.selectedSuggestionIndex]);
            } else {
                this.createActivity();
            }
            return;
        }

        // Escape - clear input
        if (e.key === 'Escape') {
            e.preventDefault();
            this.clearInput();
            return;
        }

        // Arrow up/down - navigate suggestions
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedSuggestionIndex = Math.min(
                this.selectedSuggestionIndex + 1,
                this.currentSuggestions.length - 1
            );
            this.updateSuggestionHighlight();
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
            this.updateSuggestionHighlight();
            return;
        }
    },

    /**
     * Handle input changes
     */
    handleInput() {
        const text = this.inputElement.value.trim();

        if (text.length === 0) {
            this.hideSuggestions();
            return;
        }

        // Show category suggestions if typing @
        if (text.includes('@')) {
            this.showCategorySuggestions(text);
        } else {
            this.hideSuggestions();
        }
    },

    /**
     * Parse natural language input into structured activity data
     */
    parseInput(text) {
        const parsed = {
            title: text,
            categoryId: null,
            dueDate: null,
            status: 'not-started',
            priority: null
        };

        // Extract category (@category-name)
        const categoryMatch = text.match(/@([\w-]+)/);
        if (categoryMatch) {
            const categoryName = categoryMatch[1];
            const categoryModel = new CategoryModel();
            const categories = categoryModel.getAll();
            const matchedCategory = categories.find(c =>
                c.name.toLowerCase().replace(/\s+/g, '-') === categoryName.toLowerCase()
            );

            if (matchedCategory) {
                parsed.categoryId = matchedCategory.id;
            } else {
                // Auto-create category
                parsed.newCategoryName = categoryName.replace(/-/g, ' ');
            }

            // Remove @category from title
            parsed.title = text.replace(/@[\w-]+/g, '').trim();
        }

        // Extract priority (#urgent, #important)
        const priorityMatch = text.match(/#(urgent|important|high|low)/i);
        if (priorityMatch) {
            parsed.priority = priorityMatch[1].toLowerCase();
            // Remove #priority from title
            parsed.title = parsed.title.replace(/#(urgent|important|high|low)/gi, '').trim();
        }

        // Extract due date patterns
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // "by tomorrow", "tomorrow"
        if (/\b(by\s+)?tomorrow\b/i.test(text)) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            parsed.dueDate = tomorrow.getTime();
            parsed.title = parsed.title.replace(/\b(by\s+)?tomorrow\b/gi, '').trim();
        }
        // "by today", "today"
        else if (/\b(by\s+)?today\b/i.test(text)) {
            parsed.dueDate = today.getTime();
            parsed.title = parsed.title.replace(/\b(by\s+)?today\b/gi, '').trim();
        }
        // "by Monday", "next Friday", etc.
        else {
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayRegex = new RegExp(`\\b(by\\s+)?(next\\s+)?(${dayNames.join('|')})\\b`, 'i');
            const dayMatch = text.match(dayRegex);

            if (dayMatch) {
                const dayName = dayMatch[3].toLowerCase();
                const targetDay = dayNames.indexOf(dayName);
                const currentDay = today.getDay();
                const isNext = dayMatch[2] !== undefined;

                let daysUntil = targetDay - currentDay;
                if (daysUntil <= 0 || isNext) {
                    daysUntil += 7;
                }

                const targetDate = new Date(today);
                targetDate.setDate(targetDate.getDate() + daysUntil);
                parsed.dueDate = targetDate.getTime();
                parsed.title = parsed.title.replace(dayRegex, '').trim();
            }
        }

        // Extract date patterns like "3/15", "12/25", "3-15"
        const dateMatch = text.match(/\b(\d{1,2})[\/\-](\d{1,2})\b/);
        if (dateMatch && !parsed.dueDate) {
            const month = parseInt(dateMatch[1]) - 1; // 0-indexed
            const day = parseInt(dateMatch[2]);
            const year = today.getFullYear();
            const targetDate = new Date(year, month, day);

            // If date is in the past, assume next year
            if (targetDate < today) {
                targetDate.setFullYear(year + 1);
            }

            parsed.dueDate = targetDate.getTime();
            parsed.title = parsed.title.replace(/\b\d{1,2}[\/\-]\d{1,2}\b/, '').trim();
        }

        // Clean up title - remove "by" at start/end, extra spaces
        parsed.title = parsed.title
            .replace(/^by\s+/i, '')
            .replace(/\s+by$/i, '')
            .replace(/\s+/g, ' ')
            .trim();

        return parsed;
    },

    /**
     * Create activity from command bar input
     */
    async createActivity() {
        const text = this.inputElement.value.trim();

        if (!text) {
            return;
        }

        const parsed = this.parseInput(text);

        // Auto-create category if needed
        if (parsed.newCategoryName) {
            const categoryModel = new CategoryModel();
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            // CategoryModel.create expects (name, description, color) as separate params
            const created = categoryModel.create(
                parsed.newCategoryName,
                `Auto-created from @${parsed.newCategoryName.replace(/\s+/g, '-')}`,
                randomColor
            );

            if (created) {
                parsed.categoryId = created.id;
                UIController.showToast(`Category "${created.name}" created`, 'success');
            }
        }

        // Create the activity
        const activityModel = new ActivityModel();
        const activity = {
            title: parsed.title,
            description: '',
            categoryId: parsed.categoryId || null,
            status: parsed.status,
            dueDate: parsed.dueDate || null,
            notes: '',
            resources: []
        };

        const created = await activityModel.create(activity);

        if (created) {
            UIController.showToast('Activity created!', 'success');
            this.clearInput();

            // Refresh the activity list
            if (window.ActivityListComponent) {
                await ActivityListComponent.render();
            }
        } else {
            UIController.showToast('Error creating activity', 'error');
        }
    },

    /**
     * Show category suggestions
     */
    showCategorySuggestions(text) {
        const lastAtIndex = text.lastIndexOf('@');
        const searchTerm = text.substring(lastAtIndex + 1).toLowerCase();

        const categoryModel = new CategoryModel();
        const categories = categoryModel.getAll();
        const matches = categories.filter(cat =>
            cat.name.toLowerCase().includes(searchTerm)
        );

        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.currentSuggestions = matches.map(cat => ({
            type: 'category',
            text: `@${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
            label: cat.name,
            color: cat.color,
            data: cat
        }));

        this.renderSuggestions();
    },

    /**
     * Render suggestions dropdown
     */
    renderSuggestions() {
        if (!this.suggestionsElement || this.currentSuggestions.length === 0) {
            return;
        }

        const html = this.currentSuggestions.map((suggestion, index) => {
            const isSelected = index === this.selectedSuggestionIndex;
            return `
                <div class="command-suggestion ${isSelected ? 'selected' : ''}"
                     data-index="${index}"
                     onmousedown="CommandBarComponent.applySuggestionByIndex(${index})">
                    ${suggestion.type === 'category' ? `
                        <span class="suggestion-tag" style="background: ${suggestion.color}20; color: ${suggestion.color}; border: 1px solid ${suggestion.color}">
                            ${suggestion.label}
                        </span>
                        <span class="suggestion-text">${suggestion.text}</span>
                    ` : suggestion.label}
                </div>
            `;
        }).join('');

        this.suggestionsElement.innerHTML = html;
        this.suggestionsElement.style.display = 'block';
        this.selectedSuggestionIndex = -1;
    },

    /**
     * Update suggestion highlight
     */
    updateSuggestionHighlight() {
        const items = this.suggestionsElement.querySelectorAll('.command-suggestion');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSuggestionIndex);
        });
    },

    /**
     * Apply selected suggestion
     */
    applySuggestion(suggestion) {
        if (suggestion.type === 'category') {
            const currentText = this.inputElement.value;
            const lastAtIndex = currentText.lastIndexOf('@');
            const newText = currentText.substring(0, lastAtIndex) + suggestion.text + ' ';
            this.inputElement.value = newText;
            this.inputElement.focus();
        }

        this.hideSuggestions();
    },

    /**
     * Apply suggestion by index (for mouse clicks)
     */
    applySuggestionByIndex(index) {
        if (index >= 0 && index < this.currentSuggestions.length) {
            this.applySuggestion(this.currentSuggestions[index]);
        }
    },

    /**
     * Hide suggestions dropdown
     */
    hideSuggestions() {
        setTimeout(() => {
            if (this.suggestionsElement) {
                this.suggestionsElement.style.display = 'none';
                this.suggestionsElement.innerHTML = '';
            }
            this.currentSuggestions = [];
            this.selectedSuggestionIndex = -1;
        }, 200);
    },

    /**
     * Clear input and suggestions
     */
    clearInput() {
        this.inputElement.value = '';
        this.hideSuggestions();
        this.inputElement.blur();
    },

    /**
     * Focus the command bar
     */
    focus() {
        if (this.inputElement) {
            this.inputElement.focus();
        }
    }
};

// Sidebar component for category navigation

const SidebarComponent = {
    currentCategoryId: 'all',

    /**
     * Render category list
     */
    render() {
        const categoryList = document.getElementById('category-list');
        if (!categoryList) return;

        const categoryModel = new CategoryModel();
        const activityModel = new ActivityModel();
        const categories = categoryModel.getAll();

        // Update all activities count
        const allCount = document.getElementById('all-count');
        if (allCount) {
            allCount.textContent = activityModel.getAll().length;
        }

        // Clear existing categories (except "All Activities")
        const existingItems = categoryList.querySelectorAll('.category-item:not([data-category-id="all"])');
        existingItems.forEach(item => item.remove());

        // Render categories
        categories.forEach(category => {
            const count = categoryModel.getActivityCount(category.id);
            const item = this.createCategoryItem(category, count);
            categoryList.appendChild(item);
        });

        // Update active state
        this.updateActiveState();
    },

    /**
     * Create category item element
     */
    createCategoryItem(category, count) {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.dataset.categoryId = category.id;

        item.innerHTML = `
            <span class="category-name">
                <span class="category-color" style="background-color: ${category.color}"></span>
                ${escapeHTML(category.name)}
            </span>
            <div class="category-actions">
                <button onclick="SidebarComponent.editCategory('${category.id}')" title="Edit">✏️</button>
                <button onclick="SidebarComponent.deleteCategory('${category.id}')" title="Delete">🗑️</button>
            </div>
            <span class="category-count">${count}</span>
        `;

        // Click to filter
        item.addEventListener('click', (e) => {
            // Don't trigger if clicking action buttons
            if (e.target.closest('.category-actions')) return;

            this.currentCategoryId = category.id;
            this.updateActiveState();
            UIController.applyFilters();
        });

        return item;
    },

    /**
     * Update active category state
     */
    updateActiveState() {
        const items = document.querySelectorAll('.category-item');
        items.forEach(item => {
            if (item.dataset.categoryId === this.currentCategoryId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    /**
     * Show category form modal for creating
     */
    showAddCategoryModal() {
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-modal-title');
        const form = document.getElementById('category-form');

        if (!modal || !title || !form) return;

        title.textContent = 'New Category';
        form.reset();
        document.getElementById('category-id').value = '';
        modal.classList.add('active');
    },

    /**
     * Edit category
     */
    editCategory(categoryId) {
        const categoryModel = new CategoryModel();
        const category = categoryModel.getById(categoryId);

        if (!category) return;

        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-modal-title');
        const form = document.getElementById('category-form');

        if (!modal || !title || !form) return;

        title.textContent = 'Edit Category';
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-description').value = category.description || '';
        document.getElementById('category-color').value = category.color;

        modal.classList.add('active');
    },

    /**
     * Delete category
     */
    deleteCategory(categoryId) {
        const categoryModel = new CategoryModel();
        if (categoryModel.delete(categoryId)) {
            UIController.showToast('Category deleted', 'success');
            UIController.refresh();
        }
    },

    /**
     * Handle category form submission
     */
    handleCategorySubmit(e) {
        e.preventDefault();

        const categoryId = document.getElementById('category-id').value;
        const name = document.getElementById('category-name').value;
        const description = document.getElementById('category-description').value;
        const color = document.getElementById('category-color').value;

        const categoryModel = new CategoryModel();

        if (categoryId) {
            // Update existing category
            categoryModel.update(categoryId, { name, description, color });
            UIController.showToast('Category updated', 'success');
        } else {
            // Create new category
            categoryModel.create(name, description, color);
            UIController.showToast('Category created', 'success');
        }

        this.hideCategoryModal();
        UIController.refresh();
    },

    /**
     * Hide category modal
     */
    hideCategoryModal() {
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Initialize sidebar event listeners
     */
    init() {
        // Add category button
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showAddCategoryModal();
            });
        }

        // All activities filter
        const allItem = document.querySelector('[data-category-id="all"]');
        if (allItem) {
            allItem.addEventListener('click', () => {
                this.currentCategoryId = 'all';
                this.updateActiveState();
                UIController.applyFilters();
            });
        }

        // Category form submit
        const categoryForm = document.getElementById('category-form');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                this.handleCategorySubmit(e);
            });
        }

        // Category modal close
        const categoryModalClose = document.getElementById('category-modal-close');
        if (categoryModalClose) {
            categoryModalClose.addEventListener('click', () => {
                this.hideCategoryModal();
            });
        }

        // Category cancel button
        const categoryCancelBtn = document.getElementById('category-cancel-btn');
        if (categoryCancelBtn) {
            categoryCancelBtn.addEventListener('click', () => {
                this.hideCategoryModal();
            });
        }

        // Click outside to close
        const categoryModal = document.getElementById('category-modal');
        if (categoryModal) {
            categoryModal.addEventListener('click', (e) => {
                if (e.target === categoryModal) {
                    this.hideCategoryModal();
                }
            });
        }

        // Initial render
        this.render();
    }
};

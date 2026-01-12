// Data models and business logic

const DEFAULT_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#6366f1', '#ef4444'
];

class CategoryModel {
    constructor() {
        this.categories = Storage.getCategories();
    }

    /**
     * Get all categories
     */
    getAll() {
        return this.categories;
    }

    /**
     * Get category by ID
     */
    getById(id) {
        return this.categories.find(cat => cat.id === id);
    }

    /**
     * Create new category
     */
    create(name, description, color) {
        const category = {
            id: generateUUID(),
            name: name.trim(),
            description: description ? description.trim() : '',
            color: color || DEFAULT_COLORS[this.categories.length % DEFAULT_COLORS.length],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.categories.push(category);
        this.save();

        // Sync to Supabase if available
        if (typeof SupabaseSync !== 'undefined') {
            SupabaseSync.saveCategory(category);
        }

        return category;
    }

    /**
     * Update category
     */
    update(id, updates) {
        const index = this.categories.findIndex(cat => cat.id === id);
        if (index === -1) return null;

        this.categories[index] = {
            ...this.categories[index],
            ...updates,
            updatedAt: Date.now()
        };

        this.save();

        // Sync to Supabase if available
        if (typeof SupabaseSync !== 'undefined') {
            SupabaseSync.saveCategory(this.categories[index]);
        }

        return this.categories[index];
    }

    /**
     * Delete category
     */
    delete(id) {
        const index = this.categories.findIndex(cat => cat.id === id);
        if (index === -1) return false;

        // Check if category has activities
        const activityModel = new ActivityModel();
        const hasActivities = activityModel.getByCategoryId(id).length > 0;

        if (hasActivities) {
            if (!confirm('This category has activities. Delete them too?')) {
                return false;
            }
            // Delete all activities in this category
            activityModel.deleteByCategoryId(id);
        }

        this.categories.splice(index, 1);
        this.save();

        // Sync to Supabase if available
        if (typeof SupabaseSync !== 'undefined') {
            SupabaseSync.deleteCategory(id);
        }

        return true;
    }

    /**
     * Get activity count for category
     */
    getActivityCount(categoryId) {
        const activityModel = new ActivityModel();
        return activityModel.getByCategoryId(categoryId).length;
    }

    /**
     * Save to storage
     */
    save() {
        Storage.saveCategories(this.categories);
    }
}

class ActivityModel {
    constructor() {
        this.activities = Storage.getActivities();
    }

    /**
     * Get all activities
     */
    getAll() {
        return this.activities;
    }

    /**
     * Get activity by ID
     */
    getById(id) {
        return this.activities.find(act => act.id === id);
    }

    /**
     * Get activities by category ID
     */
    getByCategoryId(categoryId) {
        return this.activities.filter(act => act.categoryId === categoryId);
    }

    /**
     * Get activities by status
     */
    getByStatus(status) {
        return this.activities.filter(act => act.status === status);
    }

    /**
     * Create new activity
     */
    create(data) {
        const activity = {
            id: generateUUID(),
            categoryId: data.categoryId || null,
            title: data.title.trim(),
            description: data.description ? data.description.trim() : '',
            status: 'not-started',
            dueDate: data.dueDate || null,
            completedAt: null,
            notes: data.notes || '',
            cadence: data.cadence || 'one-time',
            resources: data.resources || [],
            timeSpent: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.activities.push(activity);
        this.save();

        // Sync to Supabase if available
        if (typeof SupabaseSync !== 'undefined') {
            SupabaseSync.saveActivity(activity);
        }

        return activity;
    }

    /**
     * Update activity
     */
    update(id, updates) {
        const index = this.activities.findIndex(act => act.id === id);
        if (index === -1) return null;

        // If status changed to completed, set completedAt
        if (updates.status === 'completed' && this.activities[index].status !== 'completed') {
            updates.completedAt = Date.now();
        } else if (updates.status !== 'completed') {
            updates.completedAt = null;
        }

        this.activities[index] = {
            ...this.activities[index],
            ...updates,
            updatedAt: Date.now()
        };

        this.save();

        // Sync to Supabase if available
        if (typeof SupabaseSync !== 'undefined') {
            SupabaseSync.saveActivity(this.activities[index]);
        }

        return this.activities[index];
    }

    /**
     * Delete activity
     */
    delete(id) {
        const index = this.activities.findIndex(act => act.id === id);
        if (index === -1) return false;

        this.activities.splice(index, 1);
        this.save();

        // Sync to Supabase if available
        if (typeof SupabaseSync !== 'undefined') {
            SupabaseSync.deleteActivity(id);
        }

        return true;
    }

    /**
     * Delete all activities by category ID
     */
    deleteByCategoryId(categoryId) {
        this.activities = this.activities.filter(act => act.categoryId !== categoryId);
        this.save();
    }

    /**
     * Update activity status
     */
    updateStatus(id, status) {
        return this.update(id, { status });
    }

    /**
     * Add time to activity
     */
    addTime(id, minutes) {
        const activity = this.getById(id);
        if (!activity) return null;

        return this.update(id, {
            timeSpent: activity.timeSpent + minutes
        });
    }

    /**
     * Add resource to activity
     */
    addResource(id, title, url) {
        const activity = this.getById(id);
        if (!activity) return null;

        const resources = [...activity.resources, { title, url }];
        return this.update(id, { resources });
    }

    /**
     * Remove resource from activity
     */
    removeResource(id, resourceIndex) {
        const activity = this.getById(id);
        if (!activity) return null;

        const resources = activity.resources.filter((_, i) => i !== resourceIndex);
        return this.update(id, { resources });
    }

    /**
     * Search activities by query
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.activities.filter(act =>
            act.title.toLowerCase().includes(lowerQuery) ||
            act.description.toLowerCase().includes(lowerQuery) ||
            act.notes.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Filter and sort activities
     */
    filterAndSort(filters = {}, sortBy = 'updatedAt', sortOrder = 'desc') {
        let result = [...this.activities];

        // Apply filters
        if (filters.categoryId) {
            result = result.filter(act => act.categoryId === filters.categoryId);
        }

        if (filters.status) {
            if (filters.status === 'not-completed') {
                // Filter to show all activities except completed ones
                result = result.filter(act => act.status !== 'completed');
            } else {
                result = result.filter(act => act.status === filters.status);
            }
        }

        if (filters.overdue) {
            result = result.filter(act => act.dueDate && isOverdue(act.dueDate));
        }

        if (filters.dueSoon) {
            result = result.filter(act => act.dueDate && isDueSoon(act.dueDate));
        }

        if (filters.query) {
            const lowerQuery = filters.query.toLowerCase();
            result = result.filter(act =>
                act.title.toLowerCase().includes(lowerQuery) ||
                act.description.toLowerCase().includes(lowerQuery) ||
                act.notes.toLowerCase().includes(lowerQuery)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            // Handle null values
            if (aVal === null) return 1;
            if (bVal === null) return -1;

            // Handle string comparisons
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        return result;
    }

    /**
     * Get overdue activities
     */
    getOverdue() {
        return this.activities.filter(act =>
            act.status !== 'completed' &&
            act.dueDate &&
            isOverdue(act.dueDate)
        );
    }

    /**
     * Get due soon activities
     */
    getDueSoon() {
        return this.activities.filter(act =>
            act.status !== 'completed' &&
            act.dueDate &&
            isDueSoon(act.dueDate)
        );
    }

    /**
     * Save to storage
     */
    save() {
        Storage.saveActivities(this.activities);
    }
}

class StatsModel {
    constructor() {
        this.activityModel = new ActivityModel();
    }

    /**
     * Get overall statistics
     */
    getStats() {
        const activities = this.activityModel.getAll();
        const completed = activities.filter(a => a.status === 'completed');
        const completionDates = completed.map(a => a.completedAt).filter(d => d);

        return {
            totalActivities: activities.length,
            completedActivities: completed.length,
            completionRate: activities.length > 0
                ? Math.round((completed.length / activities.length) * 100)
                : 0,
            currentStreak: calculateStreak(completionDates),
            longestStreak: this.getLongestStreak(completionDates),
            totalTimeSpent: activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
            overdueCount: this.activityModel.getOverdue().length,
            dueSoonCount: this.activityModel.getDueSoon().length
        };
    }

    /**
     * Get stats by category
     */
    getStatsByCategory() {
        const categoryModel = new CategoryModel();
        const categories = categoryModel.getAll();

        return categories.map(cat => {
            const activities = this.activityModel.getByCategoryId(cat.id);
            const completed = activities.filter(a => a.status === 'completed');

            return {
                categoryId: cat.id,
                categoryName: cat.name,
                categoryColor: cat.color,
                total: activities.length,
                completed: completed.length,
                completionRate: activities.length > 0
                    ? Math.round((completed.length / activities.length) * 100)
                    : 0,
                timeSpent: activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
            };
        });
    }

    /**
     * Get longest streak from completion dates
     */
    getLongestStreak(completionDates) {
        if (!completionDates || completionDates.length === 0) return 0;

        const sorted = completionDates
            .map(d => new Date(d).setHours(0, 0, 0, 0))
            .sort((a, b) => b - a);

        const oneDayMs = 24 * 60 * 60 * 1000;
        let longestStreak = 1;
        let currentStreak = 1;
        let expectedDate = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === expectedDate - oneDayMs) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
                expectedDate = sorted[i];
            } else if (sorted[i] !== expectedDate) {
                currentStreak = 1;
                expectedDate = sorted[i];
            }
        }

        return longestStreak;
    }

    /**
     * Get recent activity history
     */
    getRecentActivity(limit = 10) {
        const activities = this.activityModel.getAll();
        return activities
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, limit);
    }
}

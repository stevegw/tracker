// Supabase sync manager - replaces Google Drive sync

const SupabaseSync = {
    syncInProgress: false,

    /**
     * Convert camelCase to snake_case for database
     */
    toSnakeCase(obj) {
        const snakeObj = {};
        for (const key in obj) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            snakeObj[snakeKey] = obj[key];
        }
        return snakeObj;
    },

    /**
     * Convert snake_case to camelCase from database
     */
    toCamelCase(obj) {
        const camelObj = {};
        for (const key in obj) {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            camelObj[camelKey] = obj[key];
        }
        return camelObj;
    },

    /**
     * Load all data from Supabase
     */
    async loadFromSupabase() {
        if (this.syncInProgress) return;

        const user = await getCurrentUser();
        if (!user) return;

        this.syncInProgress = true;

        try {
            // Load categories
            const { data: categories, error: catError } = await supabaseClient
                .from('categories')
                .select('*')
                .eq('user_id', user.id);

            if (catError) throw catError;

            // Load activities
            const { data: activities, error: actError } = await supabaseClient
                .from('activities')
                .select('*')
                .eq('user_id', user.id);

            if (actError) throw actError;

            // Convert snake_case to camelCase and store in localStorage
            if (categories) {
                const camelCategories = categories.map(cat => this.toCamelCase(cat));
                localStorage.setItem('enablement_categories', JSON.stringify(camelCategories));
            }

            if (activities) {
                const camelActivities = activities.map(act => this.toCamelCase(act));
                localStorage.setItem('enablement_activities', JSON.stringify(camelActivities));
            }

            console.log('Data loaded from Supabase');

        } catch (error) {
            console.error('Error loading from Supabase:', error);
        }

        this.syncInProgress = false;
    },

    /**
     * Save category to Supabase
     */
    async saveCategory(category) {
        const user = await getCurrentUser();
        if (!user) return;

        try {
            // Convert to snake_case for database
            const snakeCategory = this.toSnakeCase(category);
            const categoryData = {
                ...snakeCategory,
                user_id: user.id
            };

            const { data, error } = await supabaseClient
                .from('categories')
                .upsert(categoryData)
                .select();

            if (error) throw error;

            console.log('Category saved to Supabase');
            // Convert back to camelCase
            return data[0] ? this.toCamelCase(data[0]) : null;

        } catch (error) {
            console.error('Error saving category:', error);
            UIController.showToast('Error syncing category', 'error');
        }
    },

    /**
     * Delete category from Supabase
     */
    async deleteCategory(categoryId) {
        const user = await getCurrentUser();
        if (!user) return;

        try {
            const { error } = await supabaseClient
                .from('categories')
                .delete()
                .eq('id', categoryId)
                .eq('user_id', user.id);

            if (error) throw error;

            console.log('Category deleted from Supabase');

        } catch (error) {
            console.error('Error deleting category:', error);
            UIController.showToast('Error deleting category', 'error');
        }
    },

    /**
     * Save activity to Supabase
     */
    async saveActivity(activity) {
        const user = await getCurrentUser();
        if (!user) return;

        try {
            // Convert to snake_case for database
            const snakeActivity = this.toSnakeCase(activity);
            const activityData = {
                ...snakeActivity,
                user_id: user.id
            };

            const { data, error } = await supabaseClient
                .from('activities')
                .upsert(activityData)
                .select();

            if (error) throw error;

            console.log('Activity saved to Supabase');
            // Convert back to camelCase
            return data[0] ? this.toCamelCase(data[0]) : null;

        } catch (error) {
            console.error('Error saving activity:', error);
            UIController.showToast('Error syncing activity', 'error');
        }
    },

    /**
     * Delete activity from Supabase
     */
    async deleteActivity(activityId) {
        const user = await getCurrentUser();
        if (!user) return;

        try {
            const { error } = await supabaseClient
                .from('activities')
                .delete()
                .eq('id', activityId)
                .eq('user_id', user.id);

            if (error) throw error;

            console.log('Activity deleted from Supabase');

        } catch (error) {
            console.error('Error deleting activity:', error);
            UIController.showToast('Error deleting activity', 'error');
        }
    }
};

// Supabase sync manager - replaces Google Drive sync

const SupabaseSync = {
    syncInProgress: false,

    /**
     * Convert camelCase to snake_case for database
     * Also converts timestamp numbers to ISO strings
     */
    toSnakeCase(obj) {
        const snakeObj = {};
        for (const key in obj) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            let value = obj[key];

            // Convert timestamp numbers to ISO strings for PostgreSQL
            if (typeof value === 'number' && (key.endsWith('At') || key === 'dueDate' || key === 'lastReminderSent')) {
                value = new Date(value).toISOString();
            }

            snakeObj[snakeKey] = value;
        }
        return snakeObj;
    },

    /**
     * Convert snake_case to camelCase from database
     * Also converts ISO timestamp strings back to numbers
     */
    toCamelCase(obj) {
        const camelObj = {};
        for (const key in obj) {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            let value = obj[key];

            // Convert ISO timestamp strings back to numbers for JavaScript
            if (typeof value === 'string' && camelKey.endsWith('At')) {
                const timestamp = new Date(value).getTime();
                if (!isNaN(timestamp)) {
                    value = timestamp;
                }
            }

            // Convert due_date ISO string to timestamp
            if (key === 'due_date' && typeof value === 'string' && value) {
                const timestamp = new Date(value).getTime();
                if (!isNaN(timestamp)) {
                    value = timestamp;
                }
            }

            // Convert last_reminder_sent ISO string to timestamp
            if (key === 'last_reminder_sent' && typeof value === 'string' && value) {
                const timestamp = new Date(value).getTime();
                if (!isNaN(timestamp)) {
                    value = timestamp;
                }
            }

            camelObj[camelKey] = value;
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

            // Load lookup schedules (shared across all users)
            const { data: lookupSchedules, error: lookupError } = await supabaseClient
                .from('lookup_schedules')
                .select('*');

            if (lookupError) throw lookupError;

            // Convert snake_case to camelCase and store in localStorage
            if (categories) {
                const camelCategories = categories.map(cat => this.toCamelCase(cat));
                localStorage.setItem('enablement_categories', JSON.stringify(camelCategories));
            }

            if (activities) {
                const camelActivities = activities.map(act => this.toCamelCase(act));
                localStorage.setItem('enablement_activities', JSON.stringify(camelActivities));
            }

            if (lookupSchedules) {
                const camelLookups = lookupSchedules.map(lookup => this.toCamelCase(lookup));
                localStorage.setItem('enablement_lookup_schedules', JSON.stringify(camelLookups));
            }

            console.log('Data loaded from Supabase');

        } catch (error) {
            // Ignore AbortError - happens during page refresh
            if (error.name === 'AbortError') {
                console.log('Supabase load aborted (page refresh)');
                return;
            }
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
            // Remove local-only fields that don't exist in database
            const { isWelcomeCategory, ...categoryToSync } = category;

            // Convert to snake_case for database
            const snakeCategory = this.toSnakeCase(categoryToSync);
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
            // Ignore AbortError - happens during page refresh
            if (error.name === 'AbortError') {
                console.log('Category save aborted (page refresh)');
                return;
            }
            console.error('Error saving category:', error);
            console.error('Category data that failed:', categoryData);
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
            // Ignore AbortError - happens during page refresh
            if (error.name === 'AbortError') {
                console.log('Category delete aborted (page refresh)');
                return;
            }
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
            // Remove local-only fields that don't exist in database
            const { isWelcomeActivity, ...activityToSync } = activity;

            // Convert to snake_case for database
            const snakeActivity = this.toSnakeCase(activityToSync);
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
            // Ignore AbortError - happens during page refresh
            if (error.name === 'AbortError') {
                console.log('Activity save aborted (page refresh)');
                return;
            }
            console.error('Error saving activity:', error);
            console.error('Activity data that failed:', activityData);
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
            // Ignore AbortError - happens during page refresh
            if (error.name === 'AbortError') {
                console.log('Activity delete aborted (page refresh)');
                return;
            }
            console.error('Error deleting activity:', error);
            UIController.showToast('Error deleting activity', 'error');
        }
    },

    /**
     * Save lookup schedule to Supabase
     */
    async saveLookupSchedule(lookup) {
        const user = await getCurrentUser();
        if (!user) return;

        try {
            // Convert to snake_case for database
            const snakeLookup = this.toSnakeCase(lookup);
            const lookupData = {
                ...snakeLookup,
                created_by: user.id
            };

            const { data, error } = await supabaseClient
                .from('lookup_schedules')
                .upsert(lookupData)
                .select();

            if (error) throw error;

            console.log('Lookup schedule saved to Supabase');

            // Reload all lookup schedules to refresh cache
            await this.loadLookupSchedulesFromSupabase();

            // Convert back to camelCase
            return data[0] ? this.toCamelCase(data[0]) : null;

        } catch (error) {
            // Ignore AbortError - happens during page refresh
            if (error.name === 'AbortError') {
                console.log('Lookup schedule save aborted (page refresh)');
                return;
            }
            console.error('Error saving lookup schedule:', error);
            console.error('Lookup data that failed:', lookupData);
            UIController.showToast('Error syncing lookup schedule', 'error');
        }
    },

    /**
     * Delete lookup schedule from Supabase
     */
    async deleteLookupSchedule(lookupId) {
        const user = await getCurrentUser();
        if (!user) return;

        try {
            const { error } = await supabaseClient
                .from('lookup_schedules')
                .delete()
                .eq('id', lookupId);

            if (error) throw error;

            console.log('Lookup schedule deleted from Supabase');

            // Reload all lookup schedules to refresh cache
            await this.loadLookupSchedulesFromSupabase();

        } catch (error) {
            // Ignore AbortError - happens during page refresh
            if (error.name === 'AbortError') {
                console.log('Lookup schedule delete aborted (page refresh)');
                return;
            }
            console.error('Error deleting lookup schedule:', error);
            UIController.showToast('Error deleting lookup schedule', 'error');
        }
    },

    /**
     * Load lookup schedules from Supabase (shared across all users)
     */
    async loadLookupSchedulesFromSupabase() {
        const user = await getCurrentUser();
        if (!user) return;

        try {
            const { data: lookupSchedules, error } = await supabaseClient
                .from('lookup_schedules')
                .select('*');

            if (error) throw error;

            if (lookupSchedules) {
                const camelLookups = lookupSchedules.map(lookup => this.toCamelCase(lookup));
                localStorage.setItem('enablement_lookup_schedules', JSON.stringify(camelLookups));
                console.log('Lookup schedules loaded from Supabase:', camelLookups.length);
            }

        } catch (error) {
            // Ignore AbortError - happens during page refresh
            if (error.name === 'AbortError') {
                console.log('Lookup schedules load aborted (page refresh)');
                return;
            }
            console.error('Error loading lookup schedules:', error);
        }
    }
};

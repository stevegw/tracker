// Supabase sync manager - replaces Google Drive sync

const SupabaseSync = {
    syncInProgress: false,

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

            // Store in localStorage for offline access
            if (categories) {
                localStorage.setItem('enablement_categories', JSON.stringify(categories));
            }

            if (activities) {
                localStorage.setItem('enablement_activities', JSON.stringify(activities));
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
            const categoryData = {
                ...category,
                user_id: user.id
            };

            const { data, error } = await supabaseClient
                .from('categories')
                .upsert(categoryData)
                .select();

            if (error) throw error;

            console.log('Category saved to Supabase');
            return data[0];

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
            const activityData = {
                ...activity,
                user_id: user.id
            };

            const { data, error } = await supabaseClient
                .from('activities')
                .upsert(activityData)
                .select();

            if (error) throw error;

            console.log('Activity saved to Supabase');
            return data[0];

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

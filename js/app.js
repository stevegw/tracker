// Main application entry point

// Wait for Supabase library to load, then initialize the app
function initializeApp() {
    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        console.log('Waiting for Supabase library to load...');
        setTimeout(initializeApp, 100);
        return;
    }

    console.log('Tracker App - Starting...');

    // Initialize Supabase client
    if (!initSupabase()) {
        console.error('Failed to initialize Supabase');
        return;
    }

    // Initialize authentication
    AuthComponent.init().then(async () => {
        // Initialize UI Controller
        UIController.init();

        // Check for first run and create welcome activities
        await checkFirstRunAndCreateWelcome();

        // Show welcome banner if examples exist
        showWelcomeBanner();

        console.log('Tracker App - Ready!');
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Check if this is the first run and create welcome activities
 */
async function checkFirstRunAndCreateWelcome() {
    const activityModel = new ActivityModel();
    const activities = activityModel.getAll();

    // Only create welcome activities if there are no activities yet
    if (activities.length === 0) {
        const firstRun = localStorage.getItem('enablement_first_run');

        if (firstRun !== 'false') {
            await createWelcomeActivities();
            localStorage.setItem('enablement_first_run', 'false');

            // Show welcome toast
            setTimeout(() => {
                UIController.showToast('👋 Welcome! These are sample activities. Try them out or delete them!', 'success');
            }, 800);
        }
    }
}

/**
 * Create welcome categories and activities for first-time users
 */
async function createWelcomeActivities() {
    const categoryModel = new CategoryModel();
    const activityModel = new ActivityModel();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Temporarily disable sync toasts during bulk creation
    const originalShowToast = UIController.showToast;
    UIController.showToast = (message, type) => {
        if (message.includes('syncing')) return; // Suppress sync errors during bulk load
        originalShowToast.call(UIController, message, type);
    };

    try {
        // Create example categories
        const workCategory = categoryModel.create(
            'Work',
            'Work-related tasks and projects',
            '#3b82f6'
        );
        workCategory.isWelcomeCategory = true;
        categoryModel.update(workCategory.id, { isWelcomeCategory: true });
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

        const personalCategory = categoryModel.create(
            'Personal',
            'Personal goals and activities',
            '#10b981'
        );
        personalCategory.isWelcomeCategory = true;
        categoryModel.update(personalCategory.id, { isWelcomeCategory: true });
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

        const learningCategory = categoryModel.create(
            'Learning',
            'Educational and skill development',
            '#f59e0b'
        );
        learningCategory.isWelcomeCategory = true;
        categoryModel.update(learningCategory.id, { isWelcomeCategory: true });
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

        // Activity 1: Work - Pending, due soon
        activityModel.create({
            title: 'Prepare presentation slides',
            description: 'Create slides for the quarterly review meeting',
            categoryId: workCategory.id,
            status: 'not-started',
            dueDate: today.getTime() + (2 * 24 * 60 * 60 * 1000), // 2 days from now
            notes: 'Include Q4 metrics and team achievements',
            resources: [],
            isWelcomeActivity: true
        });
        await new Promise(resolve => setTimeout(resolve, 100));

        // Activity 2: Learning - In progress
        activityModel.create({
            title: 'Complete online course',
            description: 'Finish the data analysis fundamentals course',
            categoryId: learningCategory.id,
            status: 'in-progress',
            dueDate: today.getTime() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
            notes: 'Currently on module 3 of 5',
            resources: [],
            isWelcomeActivity: true
        });
        await new Promise(resolve => setTimeout(resolve, 100));

        // Activity 3: Personal - Completed yesterday (builds streak!)
        const completedActivity1 = activityModel.create({
            title: 'Morning workout',
            description: '30-minute exercise routine',
            categoryId: personalCategory.id,
            status: 'not-started',
            dueDate: null,
            notes: 'Felt great after the workout!',
            resources: [],
            isWelcomeActivity: true
        });
        // Mark as completed yesterday
        completedActivity1.status = 'completed';
        completedActivity1.completedAt = today.getTime() - (24 * 60 * 60 * 1000); // Yesterday
        activityModel.update(completedActivity1.id, completedActivity1);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Activity 4: Work - Pending
        activityModel.create({
            title: 'Review project proposal',
            description: 'Review and provide feedback on the new project plan',
            categoryId: workCategory.id,
            status: 'not-started',
            dueDate: today.getTime() + (5 * 24 * 60 * 60 * 1000), // 5 days from now
            notes: '',
            resources: [],
            isWelcomeActivity: true
        });
        await new Promise(resolve => setTimeout(resolve, 100));

        // Activity 5: Personal - Completed 2 days ago
        const completedActivity2 = activityModel.create({
            title: 'Organize home office',
            description: 'Declutter and reorganize workspace',
            categoryId: personalCategory.id,
            status: 'not-started',
            dueDate: null,
            notes: 'Desk is much cleaner now!',
            resources: [],
            isWelcomeActivity: true
        });
        // Mark as completed 2 days ago
        completedActivity2.status = 'completed';
        completedActivity2.completedAt = today.getTime() - (2 * 24 * 60 * 60 * 1000); // 2 days ago
        activityModel.update(completedActivity2.id, completedActivity2);
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('Welcome categories and activities created!');

    } finally {
        // Restore original toast function
        UIController.showToast = originalShowToast;
    }

    // Show welcome banner
    showWelcomeBanner();

    UIController.refresh();
}

/**
 * Check if welcome examples exist
 */
function hasWelcomeExamples() {
    const activityModel = new ActivityModel();
    const categoryModel = new CategoryModel();

    const activities = activityModel.getAll();
    const categories = categoryModel.getAll();

    const hasWelcomeActivities = activities.some(a => a.isWelcomeActivity);
    const hasWelcomeCategories = categories.some(c => c.isWelcomeCategory);

    return hasWelcomeActivities || hasWelcomeCategories;
}

/**
 * Show welcome banner with option to clear examples
 */
function showWelcomeBanner() {
    const banner = document.getElementById('welcome-banner');
    if (!banner) return;

    const activityModel = new ActivityModel();
    const activities = activityModel.getAll();

    // Only show if welcome examples exist AND there are actual activities
    if (hasWelcomeExamples() && activities.length > 0) {
        banner.style.display = 'flex';
    } else {
        banner.style.display = 'none';
    }
}

/**
 * Clear all welcome examples (categories and activities)
 */
function clearWelcomeExamples() {
    if (!confirm('Remove all example data? This will delete example categories and activities.')) {
        return;
    }

    const activityModel = new ActivityModel();
    const categoryModel = new CategoryModel();

    // Delete all welcome activities
    const activities = activityModel.getAll();
    activities.forEach(activity => {
        if (activity.isWelcomeActivity) {
            activityModel.delete(activity.id);
        }
    });

    // Delete all welcome categories
    const categories = categoryModel.getAll();
    categories.forEach(category => {
        if (category.isWelcomeCategory) {
            categoryModel.delete(category.id);
        }
    });

    // Hide banner
    const banner = document.getElementById('welcome-banner');
    if (banner) {
        banner.style.display = 'none';
    }

    UIController.showToast('Example data removed! Start adding your own activities.', 'success');
    UIController.refresh();
}

/**
 * Load example data for existing users (called from settings)
 */
async function loadExampleData() {
    // Check if examples already exist
    if (hasWelcomeExamples()) {
        if (!confirm('Example data already exists. This will add more examples. Continue?')) {
            return;
        }
    }

    // Create welcome activities and categories
    await createWelcomeActivities();

    // Close settings modal
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.classList.remove('active');
    }

    // Show welcome banner
    showWelcomeBanner();

    // Show success message
    UIController.showToast('👋 Example data loaded! Try them out or delete them.', 'success');
    UIController.refresh();
}

/**
 * Create some sample data for testing/demo purposes
 * Call this function from the browser console to populate with sample data
 */
function createSampleData() {
    const categoryModel = new CategoryModel();
    const activityModel = new ActivityModel();

    // Create sample categories
    const awsCategory = categoryModel.create(
        'AWS Certification',
        'Preparing for AWS Solutions Architect certification',
        '#ff9900'
    );

    const kubernetesCategory = categoryModel.create(
        'Kubernetes',
        'Learning container orchestration with Kubernetes',
        '#326ce5'
    );

    const webDevCategory = categoryModel.create(
        'Web Development',
        'Modern web development skills',
        '#3b82f6'
    );

    // Create sample activities
    activityModel.create({
        title: 'Complete AWS EC2 Tutorial',
        description: 'Learn about EC2 instances, security groups, and load balancers',
        categoryId: awsCategory.id,
        dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: 'Focus on understanding the different instance types and pricing models',
        resources: [
            { title: 'AWS EC2 Documentation', url: 'https://docs.aws.amazon.com/ec2/' },
            { title: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' }
        ]
    });

    activityModel.create({
        title: 'Practice Kubernetes Deployments',
        description: 'Create and manage Kubernetes deployments and services',
        categoryId: kubernetesCategory.id,
        dueDate: Date.now() + (3 * 24 * 60 * 60 * 1000), // 3 days from now
        notes: 'Practice with minikube locally before moving to cloud',
        resources: [
            { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/' }
        ]
    });

    const completedActivity = activityModel.create({
        title: 'Learn React Hooks',
        description: 'Master useState, useEffect, and custom hooks',
        categoryId: webDevCategory.id,
        notes: 'Completed the official React documentation and built a sample project',
        resources: [
            { title: 'React Hooks Documentation', url: 'https://react.dev/reference/react' }
        ]
    });

    // Mark one as completed
    activityModel.updateStatus(completedActivity.id, 'completed');
    activityModel.addTime(completedActivity.id, 180); // 3 hours

    activityModel.create({
        title: 'Build a REST API with Node.js',
        description: 'Create a RESTful API using Express.js and MongoDB',
        categoryId: webDevCategory.id,
        dueDate: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        notes: 'Include authentication and input validation',
        resources: []
    });

    const inProgressActivity = activityModel.create({
        title: 'Study for AWS SAA-C03 Exam',
        description: 'Review all domains for the Solutions Architect Associate exam',
        categoryId: awsCategory.id,
        dueDate: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days from now
        notes: 'Using practice exams and hands-on labs',
        resources: [
            { title: 'AWS SAA-C03 Exam Guide', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' }
        ]
    });

    activityModel.updateStatus(inProgressActivity.id, 'in-progress');
    activityModel.addTime(inProgressActivity.id, 420); // 7 hours

    UIController.showToast('Sample data created!', 'success');
    UIController.refresh();
}

// Make createSampleData available globally for console access
window.createSampleData = createSampleData;

console.log('Tip: Run createSampleData() in the console to populate with sample data');

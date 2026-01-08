// Main application entry point

// Wait for Supabase library to load, then initialize the app
function initializeApp() {
    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        console.log('Waiting for Supabase library to load...');
        setTimeout(initializeApp, 100);
        return;
    }

    console.log('Technical Enablement Tracker - Starting...');

    // Initialize Supabase client
    if (!initSupabase()) {
        console.error('Failed to initialize Supabase');
        return;
    }

    // Initialize authentication
    AuthComponent.init().then(() => {
        // Initialize UI Controller
        UIController.init();

        // Check for first run and create welcome activities
        checkFirstRunAndCreateWelcome();

        console.log('Technical Enablement Tracker - Ready!');
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Check if this is the first run and create welcome activities
 */
function checkFirstRunAndCreateWelcome() {
    const activityModel = new ActivityModel();
    const activities = activityModel.getAll();

    // Only create welcome activities if there are no activities yet
    if (activities.length === 0) {
        const firstRun = localStorage.getItem('enablement_first_run');

        if (firstRun !== 'false') {
            createWelcomeActivities();
            localStorage.setItem('enablement_first_run', 'false');

            // Show welcome toast
            setTimeout(() => {
                UIController.showToast('👋 Welcome! These are sample activities. Try them out or delete them!', 'success');
            }, 800);
        }
    }
}

/**
 * Create welcome activities for first-time users
 */
function createWelcomeActivities() {
    const activityModel = new ActivityModel();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Activity 1: Pending, due soon
    activityModel.create({
        title: 'Complete JavaScript tutorial',
        description: 'Learn modern JavaScript ES6+ features',
        categoryId: null,
        status: 'not-started',
        dueDate: today.getTime() + (2 * 24 * 60 * 60 * 1000), // 2 days from now
        notes: 'Focus on async/await, promises, and arrow functions',
        resources: [
            { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' }
        ],
        isWelcomeActivity: true
    });

    // Activity 2: In progress
    activityModel.create({
        title: 'Read AWS Well-Architected Framework',
        description: 'Study the five pillars of AWS architecture',
        categoryId: null,
        status: 'in-progress',
        dueDate: today.getTime() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: 'Currently on the Security pillar',
        resources: [
            { title: 'AWS Well-Architected', url: 'https://aws.amazon.com/architecture/well-architected/' }
        ],
        isWelcomeActivity: true
    });

    // Activity 3: Completed yesterday (builds streak!)
    const completedActivity1 = activityModel.create({
        title: 'Watch Docker crash course',
        description: 'Learn containerization basics with Docker',
        categoryId: null,
        status: 'not-started',
        dueDate: null,
        notes: 'Great video! Now understand containers vs VMs',
        resources: [
            { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/' }
        ],
        isWelcomeActivity: true
    });
    // Mark as completed yesterday
    completedActivity1.status = 'completed';
    completedActivity1.completedAt = today.getTime() - (24 * 60 * 60 * 1000); // Yesterday
    activityModel.update(completedActivity1.id, completedActivity1);

    // Activity 4: Pending
    activityModel.create({
        title: 'Practice Kubernetes deployments',
        description: 'Deploy a sample app to a K8s cluster',
        categoryId: null,
        status: 'not-started',
        dueDate: today.getTime() + (5 * 24 * 60 * 60 * 1000), // 5 days from now
        notes: 'Use minikube for local testing',
        resources: [],
        isWelcomeActivity: true
    });

    // Activity 5: Completed 2 days ago
    const completedActivity2 = activityModel.create({
        title: 'Review system design patterns',
        description: 'Study common architectural patterns',
        categoryId: null,
        status: 'not-started',
        dueDate: null,
        notes: 'Covered: Load Balancing, Caching, Message Queues',
        resources: [],
        isWelcomeActivity: true
    });
    // Mark as completed 2 days ago
    completedActivity2.status = 'completed';
    completedActivity2.completedAt = today.getTime() - (2 * 24 * 60 * 60 * 1000); // 2 days ago
    activityModel.update(completedActivity2.id, completedActivity2);

    console.log('Welcome activities created!');
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

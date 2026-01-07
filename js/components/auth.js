// Authentication component

const AuthComponent = {
    currentUser: null,

    /**
     * Initialize authentication
     */
    async init() {
        // Check if user is already signed in
        this.currentUser = await getCurrentUser();

        if (this.currentUser) {
            this.showAuthenticatedUI();
        } else {
            this.showUnauthenticatedUI();
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);

            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.showAuthenticatedUI();
                UIController.refresh();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.showUnauthenticatedUI();
            }
        });

        // Setup auth modal event listeners
        this.setupAuthModal();
    },

    /**
     * Show authenticated UI
     */
    showAuthenticatedUI() {
        // Hide auth button, show user menu
        const authBtn = document.getElementById('auth-btn');
        const userMenu = document.getElementById('user-menu');
        const mainContent = document.querySelector('.main-layout');
        const authPrompt = document.getElementById('auth-prompt');

        if (authBtn) authBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const userEmail = document.getElementById('user-email');
            if (userEmail) userEmail.textContent = this.currentUser.email;
        }
        if (mainContent) mainContent.style.display = 'grid';
        if (authPrompt) authPrompt.style.display = 'none';
    },

    /**
     * Show unauthenticated UI
     */
    showUnauthenticatedUI() {
        // Show auth button, hide user menu and main content
        const authBtn = document.getElementById('auth-btn');
        const userMenu = document.getElementById('user-menu');
        const mainContent = document.querySelector('.main-layout');
        const authPrompt = document.getElementById('auth-prompt');

        if (authBtn) authBtn.style.display = 'inline-flex';
        if (userMenu) userMenu.style.display = 'none';
        if (mainContent) mainContent.style.display = 'none';
        if (authPrompt) authPrompt.style.display = 'flex';
    },

    /**
     * Setup auth modal event listeners
     */
    setupAuthModal() {
        // Sign in/sign up button
        const authBtn = document.getElementById('auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => {
                this.showAuthModal();
            });
        }

        // Auth prompt button
        const authPromptBtn = document.getElementById('auth-prompt-btn');
        if (authPromptBtn) {
            authPromptBtn.addEventListener('click', () => {
                this.showAuthModal();
            });
        }

        // Sign out button
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                this.signOut();
            });
        }

        // Close modal
        const closeBtn = document.getElementById('auth-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideAuthModal();
            });
        }

        // Click outside to close
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAuthModal();
                }
            });
        }

        // Toggle between sign in and sign up
        const showSignUpLink = document.getElementById('show-signup');
        const showSignInLink = document.getElementById('show-signin');

        if (showSignUpLink) {
            showSignUpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignUpForm();
            });
        }

        if (showSignInLink) {
            showSignInLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignInForm();
            });
        }

        // Form submissions
        const signInForm = document.getElementById('signin-form');
        const signUpForm = document.getElementById('signup-form');

        if (signInForm) {
            signInForm.addEventListener('submit', (e) => {
                this.handleSignIn(e);
            });
        }

        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => {
                this.handleSignUp(e);
            });
        }
    },

    /**
     * Show auth modal
     */
    showAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('active');
            this.showSignInForm();
        }
    },

    /**
     * Hide auth modal
     */
    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Show sign in form
     */
    showSignInForm() {
        const signInContainer = document.getElementById('signin-container');
        const signUpContainer = document.getElementById('signup-container');

        if (signInContainer) signInContainer.style.display = 'block';
        if (signUpContainer) signUpContainer.style.display = 'none';
    },

    /**
     * Show sign up form
     */
    showSignUpForm() {
        const signInContainer = document.getElementById('signin-container');
        const signUpContainer = document.getElementById('signup-container');

        if (signInContainer) signInContainer.style.display = 'none';
        if (signUpContainer) signUpContainer.style.display = 'block';
    },

    /**
     * Handle sign in
     */
    async handleSignIn(e) {
        e.preventDefault();

        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const errorEl = document.getElementById('signin-error');

        if (errorEl) errorEl.textContent = '';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            UIController.showToast('Signed in successfully!', 'success');
            this.hideAuthModal();

            // Load user data from Supabase
            await SupabaseSync.loadFromSupabase();

        } catch (error) {
            console.error('Sign in error:', error);
            if (errorEl) errorEl.textContent = error.message;
        }
    },

    /**
     * Handle sign up
     */
    async handleSignUp(e) {
        e.preventDefault();

        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorEl = document.getElementById('signup-error');

        if (errorEl) errorEl.textContent = '';

        if (password !== confirmPassword) {
            if (errorEl) errorEl.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            if (errorEl) errorEl.textContent = 'Password must be at least 6 characters';
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            UIController.showToast('Account created! Please check your email to verify.', 'success');
            this.hideAuthModal();

        } catch (error) {
            console.error('Sign up error:', error);
            if (errorEl) errorEl.textContent = error.message;
        }
    },

    /**
     * Sign out
     */
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            UIController.showToast('Signed out successfully', 'success');

            // Clear local data
            localStorage.clear();

            // Reload page
            window.location.reload();

        } catch (error) {
            console.error('Sign out error:', error);
            UIController.showToast('Error signing out', 'error');
        }
    }
};

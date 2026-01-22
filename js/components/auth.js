// Authentication component

const AuthComponent = {
    currentUser: null,

    /**
     * Initialize authentication
     */
    async init() {
        console.log('=== AuthComponent.init() CALLED ===');

        // Check if user is already signed in
        this.currentUser = await getCurrentUser();
        console.log('Current user:', this.currentUser);

        if (this.currentUser) {
            this.showAuthenticatedUI();
            // Load data from Supabase if already signed in
            console.log('User already signed in, loading data from Supabase...');
            await SupabaseSync.loadFromSupabase();
            UIController.refresh();
        } else {
            this.showUnauthenticatedUI();
        }

        // Listen for auth state changes
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);

            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.showAuthenticatedUI();
                // Load data from Supabase on sign in
                await SupabaseSync.loadFromSupabase();
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
        console.log('=== AuthComponent.setupAuthModal() CALLED ===');

        // Sign in/sign up button
        const authBtn = document.getElementById('auth-btn');
        console.log('auth-btn element:', authBtn);
        if (authBtn) {
            console.log('Adding click listener to auth-btn');
            authBtn.addEventListener('click', () => {
                console.log('AUTH-BTN CLICKED!');
                this.showAuthModal();
            });
        } else {
            console.error('auth-btn element NOT FOUND!');
        }

        // Auth prompt button
        const authPromptBtn = document.getElementById('auth-prompt-btn');
        console.log('auth-prompt-btn element:', authPromptBtn);
        if (authPromptBtn) {
            console.log('Adding click listener to auth-prompt-btn');
            authPromptBtn.addEventListener('click', () => {
                console.log('AUTH-PROMPT-BTN CLICKED!');
                this.showAuthModal();
            });
        } else {
            console.error('auth-prompt-btn element NOT FOUND!');
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

        console.log('signin-form element:', signInForm);
        console.log('signup-form element:', signUpForm);

        if (signInForm) {
            console.log('Adding submit listener to signin-form');
            signInForm.addEventListener('submit', async (e) => {
                console.log('SIGNIN-FORM SUBMIT EVENT FIRED!');
                e.preventDefault();
                await this.handleSignIn(e);
            });
        } else {
            console.error('signin-form element NOT FOUND!');
        }

        if (signUpForm) {
            console.log('Adding submit listener to signup-form');
            signUpForm.addEventListener('submit', async (e) => {
                console.log('SIGNUP-FORM SUBMIT EVENT FIRED!');
                e.preventDefault();
                await this.handleSignUp(e);
            });
        } else {
            console.error('signup-form element NOT FOUND!');
        }
    },

    /**
     * Show auth modal
     */
    showAuthModal() {
        console.log('=== showAuthModal() CALLED ===');
        const modal = document.getElementById('auth-modal');
        console.log('auth-modal element:', modal);
        if (modal) {
            console.log('Adding "active" class to modal');
            modal.classList.add('active');
            this.showSignInForm();
        } else {
            console.error('auth-modal element NOT FOUND!');
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
        console.log('=== showSignInForm() CALLED ===');
        const signInContainer = document.getElementById('signin-container');
        const signUpContainer = document.getElementById('signup-container');

        console.log('signin-container:', signInContainer);
        console.log('signup-container:', signUpContainer);

        if (signInContainer) {
            console.log('Setting signin-container display to block');
            signInContainer.style.display = 'block';
        }
        if (signUpContainer) {
            console.log('Setting signup-container display to none');
            signUpContainer.style.display = 'none';
        }
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
        // Note: e.preventDefault() is called in the event listener
        console.log('AuthComponent: handleSignIn called');

        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        const errorEl = document.getElementById('signin-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        if (!emailInput || !passwordInput) {
            console.error('AuthComponent: Email or password input not found');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (errorEl) errorEl.textContent = '';

        // Disable form during submission
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
        }

        try {
            console.log('AuthComponent: Attempting sign in for:', email);

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('AuthComponent: Sign in successful');
            UIController.showToast('Signed in successfully!', 'success');
            this.hideAuthModal();

            // Load user data from Supabase
            await SupabaseSync.loadFromSupabase();

        } catch (error) {
            console.error('AuthComponent: Sign in error:', error);
            if (errorEl) {
                errorEl.textContent = error.message || 'Failed to sign in. Please check your credentials.';
            }
        } finally {
            // Re-enable form
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        }
    },

    /**
     * Handle sign up
     */
    async handleSignUp(e) {
        // Note: e.preventDefault() is called in the event listener
        console.log('AuthComponent: handleSignUp called');

        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmPasswordInput = document.getElementById('signup-confirm-password');
        const errorEl = document.getElementById('signup-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        if (!emailInput || !passwordInput || !confirmPasswordInput) {
            console.error('AuthComponent: Form inputs not found');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (errorEl) errorEl.textContent = '';

        if (password !== confirmPassword) {
            if (errorEl) errorEl.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            if (errorEl) errorEl.textContent = 'Password must be at least 6 characters';
            return;
        }

        // Disable form during submission
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';
        }

        try {
            console.log('AuthComponent: Attempting sign up for:', email);

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'https://stevegw.github.io/tracker'
                }
            });

            if (error) throw error;

            console.log('AuthComponent: Sign up successful');
            UIController.showToast('Account created! Please check your email to verify.', 'success');
            this.hideAuthModal();

        } catch (error) {
            console.error('AuthComponent: Sign up error:', error);
            if (errorEl) {
                errorEl.textContent = error.message || 'Failed to create account. Please try again.';
            }
        } finally {
            // Re-enable form
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        }
    },

    /**
     * Sign out
     */
    async signOut() {
        try {
            const { error } = await supabaseClient.auth.signOut();
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

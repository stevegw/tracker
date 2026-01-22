// Admin Authentication Module
// Handles authentication and admin role verification for admin.html

const AdminAuth = {
    currentUser: null,
    isAdmin: false,

    /**
     * Initialize admin authentication
     * Checks if user is authenticated AND has admin role
     */
    async init() {
        console.log('AdminAuth: Initializing...');

        // Get current user
        this.currentUser = await getCurrentUser();

        if (!this.currentUser) {
            console.log('AdminAuth: No user logged in');
            this.showUnauthenticatedUI();
            this.setupEventListeners();
            return;
        }

        // Check if user has admin role
        this.isAdmin = await this.checkAdminRole();

        if (!this.isAdmin) {
            console.log('AdminAuth: User is not an admin');
            this.showAccessDenied();
            this.setupEventListeners();
            return;
        }

        console.log('AdminAuth: Admin user authenticated');
        this.showAuthenticatedUI();

        // Listen for auth state changes
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            console.log('AdminAuth: Auth state changed:', event);

            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.isAdmin = await this.checkAdminRole();

                if (this.isAdmin) {
                    this.showAuthenticatedUI();
                    // Reload admin data
                    if (window.AdminApp && window.AdminApp.loadData) {
                        await window.AdminApp.loadData();
                    }
                } else {
                    this.showAccessDenied();
                }
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.isAdmin = false;
                this.showUnauthenticatedUI();
            }
        });

        // Setup UI event listeners
        this.setupEventListeners();
    },

    /**
     * Check if current user has admin role
     * Looks for is_admin: true in user metadata
     */
    async checkAdminRole() {
        if (!this.currentUser) return false;

        // Check user metadata for admin flag
        const metadata = this.currentUser.user_metadata || {};
        const isAdmin = metadata.is_admin === true;

        console.log('AdminAuth: Admin check ->', isAdmin, 'User:', this.currentUser.email);
        return isAdmin;
    },

    /**
     * Show authenticated admin UI
     */
    showAuthenticatedUI() {
        // Hide auth prompt, show admin content
        const authPrompt = document.getElementById('admin-auth-prompt');
        const accessDenied = document.getElementById('admin-access-denied');
        const adminContent = document.getElementById('admin-content');
        const userMenu = document.getElementById('admin-user-menu');
        const userEmail = document.getElementById('admin-user-email');

        if (authPrompt) authPrompt.style.display = 'none';
        if (accessDenied) accessDenied.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
        if (userMenu) userMenu.style.display = 'flex';
        if (userEmail && this.currentUser) {
            userEmail.textContent = this.currentUser.email;
        }
    },

    /**
     * Show unauthenticated UI (login prompt)
     */
    showUnauthenticatedUI() {
        const authPrompt = document.getElementById('admin-auth-prompt');
        const accessDenied = document.getElementById('admin-access-denied');
        const adminContent = document.getElementById('admin-content');
        const userMenu = document.getElementById('admin-user-menu');

        if (authPrompt) authPrompt.style.display = 'flex';
        if (accessDenied) accessDenied.style.display = 'none';
        if (adminContent) adminContent.style.display = 'none';
        if (userMenu) userMenu.style.display = 'none';
    },

    /**
     * Show access denied screen (authenticated but not admin)
     */
    showAccessDenied() {
        const authPrompt = document.getElementById('admin-auth-prompt');
        const accessDenied = document.getElementById('admin-access-denied');
        const adminContent = document.getElementById('admin-content');
        const userMenu = document.getElementById('admin-user-menu');
        const deniedEmail = document.getElementById('denied-user-email');

        if (authPrompt) authPrompt.style.display = 'none';
        if (accessDenied) accessDenied.style.display = 'flex';
        if (adminContent) adminContent.style.display = 'none';
        if (userMenu) userMenu.style.display = 'none';
        if (deniedEmail && this.currentUser) {
            deniedEmail.textContent = this.currentUser.email;
        }
    },

    /**
     * Setup event listeners for auth UI
     */
    setupEventListeners() {
        // Sign in button on auth prompt
        const authBtn = document.getElementById('admin-auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => {
                this.showAuthModal();
            });
        }

        // Sign out button (in header)
        const signOutBtn = document.getElementById('admin-sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                this.signOut();
            });
        }

        // Sign out button (on access denied screen)
        const signOutBtnDenied = document.getElementById('admin-sign-out-btn-denied');
        if (signOutBtnDenied) {
            signOutBtnDenied.addEventListener('click', () => {
                this.signOut();
            });
        }

        // Go to main app button (on access denied screen)
        const goToMainBtn = document.getElementById('go-to-main-app-btn');
        if (goToMainBtn) {
            goToMainBtn.addEventListener('click', () => {
                window.location.href = './index.html';
            });
        }

        // Setup auth modal
        this.setupAuthModal();
    },

    /**
     * Setup auth modal event listeners
     */
    setupAuthModal() {
        // Close modal
        const closeBtn = document.getElementById('admin-auth-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideAuthModal();
            });
        }

        // Click outside to close
        const modal = document.getElementById('admin-auth-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAuthModal();
                }
            });
        }

        // Toggle between sign in and sign up
        const showSignUpLink = document.getElementById('admin-show-signup');
        const showSignInLink = document.getElementById('admin-show-signin');

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
        const signInForm = document.getElementById('admin-signin-form');
        const signUpForm = document.getElementById('admin-signup-form');

        if (signInForm) {
            signInForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn(e);
            });
        }

        if (signUpForm) {
            signUpForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp(e);
            });
        }
    },

    /**
     * Show auth modal
     */
    showAuthModal() {
        const modal = document.getElementById('admin-auth-modal');
        if (modal) {
            modal.classList.add('active');
            this.showSignInForm();
        }
    },

    /**
     * Hide auth modal
     */
    hideAuthModal() {
        const modal = document.getElementById('admin-auth-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Show sign in form
     */
    showSignInForm() {
        const signInContainer = document.getElementById('admin-signin-container');
        const signUpContainer = document.getElementById('admin-signup-container');

        if (signInContainer) signInContainer.style.display = 'block';
        if (signUpContainer) signUpContainer.style.display = 'none';
    },

    /**
     * Show sign up form
     */
    showSignUpForm() {
        const signInContainer = document.getElementById('admin-signin-container');
        const signUpContainer = document.getElementById('admin-signup-container');

        if (signInContainer) signInContainer.style.display = 'none';
        if (signUpContainer) signUpContainer.style.display = 'block';
    },

    /**
     * Handle sign in
     */
    async handleSignIn(e) {
        // Note: e.preventDefault() is called in the event listener
        console.log('AdminAuth: handleSignIn called');

        const emailInput = document.getElementById('admin-signin-email');
        const passwordInput = document.getElementById('admin-signin-password');
        const errorEl = document.getElementById('admin-signin-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        if (!emailInput || !passwordInput) {
            console.error('AdminAuth: Email or password input not found');
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
            console.log('AdminAuth: Attempting sign in for:', email);

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('AdminAuth: Sign in successful');
            this.hideAuthModal();
            this.showToast('Signed in successfully!', 'success');

        } catch (error) {
            console.error('AdminAuth: Sign in error:', error);
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
        console.log('AdminAuth: handleSignUp called');

        const emailInput = document.getElementById('admin-signup-email');
        const passwordInput = document.getElementById('admin-signup-password');
        const confirmPasswordInput = document.getElementById('admin-signup-confirm-password');
        const errorEl = document.getElementById('admin-signup-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        if (!emailInput || !passwordInput || !confirmPasswordInput) {
            console.error('AdminAuth: Form inputs not found');
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
            console.log('AdminAuth: Attempting sign up for:', email);

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'https://stevegw.github.io/tracker/admin.html'
                }
            });

            if (error) throw error;

            console.log('AdminAuth: Sign up successful');
            this.showToast('Account created! Check ADMIN_SETUP.md to learn how to grant admin privileges.', 'info');
            this.hideAuthModal();

        } catch (error) {
            console.error('AdminAuth: Sign up error:', error);
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

            this.showToast('Signed out successfully', 'success');

            // Reload page to show login screen
            window.location.reload();

        } catch (error) {
            console.error('Admin sign out error:', error);
            this.showToast('Error signing out', 'error');
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('admin-toast');
        const toastMessage = document.getElementById('admin-toast-message');

        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.className = `admin-toast admin-toast-${type} admin-toast-show`;

        setTimeout(() => {
            toast.classList.remove('admin-toast-show');
        }, 3000);
    }
};

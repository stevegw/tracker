// Stats dashboard component

const StatsDashboardComponent = {
    /**
     * Show stats modal
     */
    show() {
        const modal = document.getElementById('stats-modal');
        if (!modal) return;

        this.render();
        modal.classList.add('active');
    },

    /**
     * Hide stats modal
     */
    hide() {
        const modal = document.getElementById('stats-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Render stats dashboard
     */
    render() {
        const dashboard = document.getElementById('stats-dashboard');
        if (!dashboard) return;

        const statsModel = new StatsModel();
        const stats = statsModel.getStats();
        const categoryStats = statsModel.getStatsByCategory();

        dashboard.innerHTML = `
            ${this.renderOverallStats(stats)}
            ${this.renderCategoryStats(categoryStats)}
        `;
    },

    /**
     * Render overall statistics
     */
    renderOverallStats(stats) {
        return `
            <div class="stats-grid">
                <div class="stats-card">
                    <div class="stats-card-value">${stats.totalActivities}</div>
                    <div class="stats-card-label">Total Activities</div>
                </div>
                <div class="stats-card">
                    <div class="stats-card-value">${stats.completedActivities}</div>
                    <div class="stats-card-label">Completed</div>
                </div>
                <div class="stats-card">
                    <div class="stats-card-value">${stats.completionRate}%</div>
                    <div class="stats-card-label">Completion Rate</div>
                </div>
                <div class="stats-card">
                    <div class="stats-card-value">${stats.currentStreak}</div>
                    <div class="stats-card-label">Current Streak (days)</div>
                </div>
                <div class="stats-card">
                    <div class="stats-card-value">${stats.longestStreak}</div>
                    <div class="stats-card-label">Longest Streak (days)</div>
                </div>
                <div class="stats-card">
                    <div class="stats-card-value">${formatTimeSpent(stats.totalTimeSpent)}</div>
                    <div class="stats-card-label">Total Time Spent</div>
                </div>
                <div class="stats-card">
                    <div class="stats-card-value">${stats.overdueCount}</div>
                    <div class="stats-card-label">Overdue</div>
                </div>
                <div class="stats-card">
                    <div class="stats-card-value">${stats.dueSoonCount}</div>
                    <div class="stats-card-label">Due Soon</div>
                </div>
            </div>
        `;
    },

    /**
     * Render category statistics
     */
    renderCategoryStats(categoryStats) {
        if (categoryStats.length === 0) {
            return `
                <div class="stats-section">
                    <h3>Category Statistics</h3>
                    <p style="color: var(--text-secondary); font-size: 13px;">No categories yet. Create categories to see statistics.</p>
                </div>
            `;
        }

        const categoryItems = categoryStats.map(cat => `
            <div class="category-stat-item">
                <div class="category-stat-header">
                    <span class="category-stat-name">
                        <span class="category-color" style="background-color: ${cat.categoryColor}"></span>
                        ${escapeHTML(cat.categoryName)}
                    </span>
                    <span class="category-stat-percentage">${cat.completionRate}%</span>
                </div>
                <div class="category-stat-bar">
                    <div class="category-stat-progress" style="width: ${cat.completionRate}%; background-color: ${cat.categoryColor}"></div>
                </div>
                <div class="category-stat-details">
                    <span>${cat.completed} of ${cat.total} completed</span>
                    <span>${formatTimeSpent(cat.timeSpent)} spent</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="stats-section">
                <h3>Category Statistics</h3>
                <div class="category-stats">
                    ${categoryItems}
                </div>
            </div>
        `;
    },

    /**
     * Initialize event listeners
     */
    init() {
        // Close button
        const closeBtn = document.getElementById('stats-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Click outside to close
        const modal = document.getElementById('stats-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }
    }
};

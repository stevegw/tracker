// Utility functions for the enablement tracker

/**
 * Generate a UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Format a timestamp to a readable date string
 */
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format a timestamp to include time
 */
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
function getRelativeTime(timestamp) {
    if (!timestamp) return '';

    const now = Date.now();
    const diff = timestamp - now;
    const absDiff = Math.abs(diff);

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;

    let value, unit;

    if (absDiff < minute) {
        return diff > 0 ? 'in less than a minute' : 'just now';
    } else if (absDiff < hour) {
        value = Math.floor(absDiff / minute);
        unit = 'minute';
    } else if (absDiff < day) {
        value = Math.floor(absDiff / hour);
        unit = 'hour';
    } else if (absDiff < week) {
        value = Math.floor(absDiff / day);
        unit = 'day';
    } else if (absDiff < month) {
        value = Math.floor(absDiff / week);
        unit = 'week';
    } else {
        value = Math.floor(absDiff / month);
        unit = 'month';
    }

    const plural = value !== 1 ? 's' : '';
    return diff > 0
        ? `in ${value} ${unit}${plural}`
        : `${value} ${unit}${plural} ago`;
}

/**
 * Check if a date is overdue
 */
function isOverdue(timestamp) {
    if (!timestamp) return false;
    return timestamp < Date.now();
}

/**
 * Check if a date is due soon (within 3 days)
 */
function isDueSoon(timestamp) {
    if (!timestamp) return false;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const diff = timestamp - Date.now();
    return diff > 0 && diff <= threeDays;
}

/**
 * Convert date input value to timestamp
 */
function dateInputToTimestamp(dateString) {
    if (!dateString) return null;
    return new Date(dateString).getTime();
}

/**
 * Convert timestamp to date input value (YYYY-MM-DD)
 */
function timestampToDateInput(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Calculate streak based on completion dates
 */
function calculateStreak(completionDates) {
    if (!completionDates || completionDates.length === 0) return 0;

    // Sort dates in descending order
    const sorted = completionDates
        .map(d => new Date(d).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a);

    const today = new Date().setHours(0, 0, 0, 0);
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Check if most recent activity was today or yesterday
    if (sorted[0] < today - oneDayMs) {
        return 0; // Streak broken
    }

    let streak = 0;
    let expectedDate = today;

    for (const date of sorted) {
        if (date === expectedDate || date === expectedDate - oneDayMs) {
            streak++;
            expectedDate = date - oneDayMs;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Format minutes to readable time string
 */
function formatTimeSpent(minutes) {
    if (!minutes || minutes === 0) return '0 min';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins} min`;
    } else if (mins === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${mins}min`;
    }
}

/**
 * Validate URL format
 */
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

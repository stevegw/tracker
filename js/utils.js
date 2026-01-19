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

/**
 * Parse schedule text into structured data
 * Parses format like:
 * MONDAY
 * 05:05 AMBasic Training  Gym
 * 06:00 AMMasters Swim  Indoor Pool
 */
function parseScheduleText(text) {
    if (!text || typeof text !== 'string') {
        return { success: false, error: 'No text provided', data: null };
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const schedule = {};
    let currentDay = null;

    for (const line of lines) {
        // Check if this line is a day header
        const upperLine = line.toUpperCase();
        if (daysOfWeek.includes(upperLine)) {
            currentDay = upperLine;
            schedule[currentDay] = [];
            continue;
        }

        // If we don't have a current day yet, skip this line
        if (!currentDay) continue;

        // Try to parse a class entry
        // Format: TIME + CLASS NAME + LOCATION (separated by two or more spaces)
        // Example: "05:05 AMBasic Training  Gym"
        const timeMatch = line.match(/^(\d{1,2}:\d{2}\s*[AP]M)/i);
        if (!timeMatch) continue;

        const time = timeMatch[1].trim();
        const remainingText = line.substring(timeMatch[0].length).trim();

        // Split by two or more spaces to separate class name from location
        const parts = remainingText.split(/\s{2,}/);
        if (parts.length < 2) {
            // If no clear separation, treat last word as location
            const lastSpaceIndex = remainingText.lastIndexOf(' ');
            if (lastSpaceIndex > 0) {
                const className = remainingText.substring(0, lastSpaceIndex).trim();
                const location = remainingText.substring(lastSpaceIndex + 1).trim();
                schedule[currentDay].push({ time, className, location });
            } else {
                // No location found, just use class name
                schedule[currentDay].push({ time, className: remainingText, location: '' });
            }
        } else {
            const className = parts[0].trim();
            const location = parts.slice(1).join(' ').trim();
            schedule[currentDay].push({ time, className, location });
        }
    }

    // Check if we parsed anything
    const totalClasses = Object.values(schedule).reduce((sum, classes) => sum + classes.length, 0);
    if (totalClasses === 0) {
        return {
            success: false,
            error: 'No classes found in the text. Make sure the format includes day headers (MONDAY, etc.) and class entries with times.',
            data: null
        };
    }

    return {
        success: true,
        error: null,
        data: schedule
    };
}

/**
 * Get the next occurrence of a specific day of the week
 * @param {string} dayName - Day name like 'MONDAY', 'TUESDAY', etc.
 * @param {string} timeString - Time string like '05:05 AM'
 * @returns {number|null} Timestamp of the next occurrence, or null if invalid
 */
function getNextOccurrenceOfDay(dayName, timeString) {
    const daysMap = {
        'SUNDAY': 0,
        'MONDAY': 1,
        'TUESDAY': 2,
        'WEDNESDAY': 3,
        'THURSDAY': 4,
        'FRIDAY': 5,
        'SATURDAY': 6
    };

    const targetDay = daysMap[dayName.toUpperCase()];
    if (targetDay === undefined) return null;

    // Parse time
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const meridiem = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
    }

    // Get current date
    const now = new Date();
    const currentDay = now.getDay();

    // Calculate days until target day
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) {
        daysUntil += 7; // Next week
    } else if (daysUntil === 0) {
        // Same day - check if time has passed
        const targetTime = new Date(now);
        targetTime.setHours(hours, minutes, 0, 0);
        if (targetTime <= now) {
            daysUntil = 7; // Next week
        }
    }

    // Create target date
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysUntil);
    targetDate.setHours(hours, minutes, 0, 0);

    return targetDate.getTime();
}

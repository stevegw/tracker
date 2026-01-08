# Technical Enablement Tracker

A vanilla JavaScript web application for tracking technical enablement activities and building knowledge over time. No frameworks, no dependencies, just pure HTML, CSS, and JavaScript.

## Features

- **Category Management**: Organize activities into color-coded categories
- **Activity Tracking**: Create, edit, and manage learning activities with multiple states
- **Progress Statistics**: Track completion rates, streaks, and time spent
- **Due Dates**: Set deadlines with visual indicators for overdue and upcoming tasks
- **Notes & Resources**: Add notes and resource links to each activity
- **Search & Filtering**: Quickly find activities by keywords, category, status, or due date
- **Cloud Sync**: Automatically sync your data across devices using Supabase
- **User Authentication**: Simple email/password authentication
- **Data Management**: Export and import your data as JSON files
- **Browser Notifications**: Get notified about overdue and upcoming activities
- **Mobile Responsive**: Optimized for phone, tablet, and desktop
- **Version Display**: Always know which version you're running
- **Local Storage**: All data persists in your browser's localStorage with cloud backup

## Cross-Device Sync

The tracker uses Supabase for automatic cloud sync, allowing you to access your data from any device (phone, tablet, desktop).

### How Cloud Sync Works

- **Sign Up/Sign In**: Create an account with your email and password
- **Automatic Sync**: All changes are automatically saved to the cloud
- **Cross-Device**: Sign in on any device to access your data
- **Local + Cloud**: Data is stored both locally (for offline access) and in the cloud
- **Secure**: Your data is protected with Row Level Security (RLS)

### Using the Tracker

**First Time Use:**
1. Open the tracker at https://stevegw.github.io/tracker
2. Click "Sign In" or use the sign-in button
3. Click "Sign up" to create a new account
4. Enter your email and password
5. You'll be automatically signed in and can start tracking

**On Additional Devices:**
1. Open the tracker on your new device
2. Click "Sign In"
3. Enter the same email and password
4. Your data will automatically load

**Offline Access:**
- All data is cached locally in your browser
- You can use the tracker without an internet connection
- Changes sync automatically when you're back online

### Data Privacy & Security

- **Authentication**: Supabase handles secure email/password authentication
- **Row Level Security**: You can only access your own data
- **Local Backup**: Data is always stored locally as a backup
- **No Sharing**: Your data is private and never shared

### Troubleshooting

**Can't sign in:**
- Check that you're using the correct email and password
- Passwords are case-sensitive
- Check browser console (F12) for error messages

**Data not syncing:**
- Make sure you're signed in (check for your email in the header)
- Check your internet connection
- Try signing out and back in

**Lost password:**
- Currently, password reset must be done manually
- Contact support or create a new account
- Always export your data as a backup!

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)

That's it! No build process, no npm install, no configuration needed.

### Quick Start

1. **Create a Category**: Click "Add Category" in the sidebar to organize your activities
2. **Add an Activity**: Click "+ New Activity" to create your first learning task
3. **Track Progress**: Mark activities as "In Progress" or "Completed" as you work through them
4. **View Statistics**: Click the 📊 icon to see your progress and statistics

### Sample Data

To quickly explore the features, open the browser console (F12) and run:

```javascript
createSampleData()
```

This will populate the tracker with sample categories and activities.

## Usage Guide

### Managing Categories

**Create a Category:**
1. Click "Add Category" in the sidebar
2. Enter a name and optional description
3. Choose a color to identify the category
4. Click "Save Category"

**Edit a Category:**
- Hover over a category in the sidebar
- Click the ✏️ icon
- Make your changes and save

**Delete a Category:**
- Hover over a category in the sidebar
- Click the 🗑️ icon
- Confirm deletion (this will also delete associated activities)

### Managing Activities

**Create an Activity:**
1. Click "+ New Activity" button
2. Fill in the details:
   - **Title**: Name of the activity (required)
   - **Description**: Brief description of what you'll learn
   - **Category**: Select a category to organize this activity
   - **Status**: Set initial status (Not Started, In Progress, or Completed)
   - **Due Date**: Optional deadline for completion
   - **Notes**: Add detailed notes about your progress
   - **Resources**: Add helpful links and documentation
3. Click "Save Activity"

**Edit an Activity:**
- Click the "✏️ Edit" button on any activity card
- Make your changes and save

**Change Activity Status:**
- Click "▶ Start" to begin working on an activity
- Click "✓ Complete" to mark it as done
- Edit the activity to change it back to "Not Started"

**Delete an Activity:**
- Click the "🗑️ Delete" button on any activity card
- Confirm deletion

### Filtering and Searching

**Search:**
- Use the search bar in the header to find activities by title, description, or notes

**Filter by Category:**
- Click on a category in the sidebar to show only its activities
- Click "All Activities" to see everything

**Filter by Status:**
- Use the "Status" dropdown to filter by Not Started, In Progress, or Completed

**Filter by Due Date:**
- Check "Overdue Only" to see late activities
- Check "Due Soon" to see activities due in the next 3 days

**Sort Activities:**
- Use the "Sort by" dropdown to order by:
  - Recently Updated
  - Recently Created
  - Due Date
  - Title (alphabetical)

### Tracking Progress

**View Statistics:**
1. Click the 📊 icon in the header
2. See metrics including:
   - Total activities and completion count
   - Completion percentage
   - Current and longest streak
   - Total time spent
   - Overdue and due soon counts
   - Progress by category

**Understanding Streaks:**
- A streak is the number of consecutive days you've completed activities
- Complete at least one activity per day to maintain your streak
- Streaks reset if you miss a day

### Data Management

**Export Your Data:**
1. Click the ⚙️ settings icon
2. Click "Export Data"
3. A JSON file will be downloaded with all your data

**Import Data:**
1. Click the ⚙️ settings icon
2. Click "Import Data"
3. Select a previously exported JSON file
4. Your data will be restored

**Clear All Data:**
1. Click the ⚙️ settings icon
2. Click "Clear All Data"
3. Confirm (this cannot be undone!)

**Note:** Regular backups are recommended! Your data is stored in browser localStorage, which can be cleared if you clear browser data.

### Browser Notifications

**Enable Notifications:**
1. Click the ⚙️ settings icon
2. Check "Enable browser notifications"
3. Grant permission when prompted

Once enabled, you'll receive notifications for:
- Overdue activities when you open the app
- Activities due soon (within 3 days)

## Technical Details

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Data Storage

All data is stored in your browser's localStorage:
- Categories: `enablement_categories`
- Activities: `enablement_activities`
- Settings: `enablement_settings`

### File Structure

```
tracker/
├── index.html              # Main HTML file
├── css/
│   ├── main.css           # Base styles and layout
│   ├── components.css     # Component-specific styles
│   └── utilities.css      # Utility classes
├── js/
│   ├── app.js             # Application entry point
│   ├── version.js         # Version management
│   ├── storage.js         # localStorage wrapper
│   ├── supabase-client.js # Supabase configuration
│   ├── supabase-sync.js   # Cloud sync logic
│   ├── models.js          # Data models and business logic
│   ├── ui.js              # UI controller
│   ├── utils.js           # Helper functions
│   └── components/
│       ├── auth.js        # Authentication UI
│       ├── header.js      # Header component
│       ├── sidebar.js     # Sidebar navigation
│       ├── activity-list.js   # Activity list rendering
│       ├── activity-form.js   # Activity form modal
│       └── stats-dashboard.js # Statistics dashboard
└── README.md              # This file
```

### Version Management

The app displays its version in the bottom right corner (e.g., "v1.0.3"). This helps users know when they have the latest updates.

**Auto-Refresh on Updates:**
The tracker automatically detects version changes and forces a refresh to ensure you're always running the latest version. When a new version is deployed:
1. The app checks the version on load
2. If a new version is detected, it shows "Updating to vX.X.X..."
3. The page automatically reloads with fresh files
4. No manual refresh needed!

This eliminates cache issues and ensures everyone gets updates immediately.

**For Developers: Updating the Version**

When deploying changes:

1. Open `version.json` and update the version number (e.g., `"1.0.9"` → `"1.0.10"`)
2. Update version query strings in `index.html`:
   - Find all `?v=1.0.9` in CSS and JS file references
   - Change to `?v=1.0.10` (match your new version)
   - Or use: `sed -i 's/?v=1\.0\.9/?v=1.0.10/g' index.html`
3. Commit and push to GitHub
4. GitHub Pages will rebuild with the new version
5. Users will auto-refresh when they next visit - **even on mobile Safari!**

**Version Numbering:**
- `X.0.0` - Major changes or rewrites
- `0.X.0` - New features
- `0.0.X` - Bug fixes and minor updates

**How It Works:**
- Version stored in `version.json` on the server
- On each page load, fetches version.json with `cache: 'no-cache'`
- Compares server version vs. stored version in localStorage
- Version mismatch triggers automatic hard reload
- Query strings (`?v=1.0.9`) force browsers to fetch new files
- Works reliably even with aggressive mobile Safari caching!

## Tips & Best Practices

1. **Start Small**: Create 2-3 categories that align with your learning goals
2. **Be Specific**: Use descriptive activity titles and add detailed notes
3. **Set Realistic Due Dates**: Give yourself enough time to complete activities
4. **Add Resources**: Save helpful links and documentation with each activity
5. **Review Regularly**: Check your statistics weekly to track progress
6. **Backup Often**: Export your data regularly to avoid losing progress
7. **Use Notes**: Document what you've learned and any blockers you encounter
8. **Maintain Streaks**: Try to complete at least one activity daily

## Troubleshooting

**Data not persisting:**
- Check if cookies/localStorage are enabled in your browser
- Ensure you're not in incognito/private browsing mode

**Notifications not working:**
- Grant notification permissions when prompted
- Check browser notification settings
- Notifications only work with HTTPS or localhost

**Browser console errors:**
- Clear your browser cache
- Make sure all files are in the correct directories
- Check browser console (F12) for specific error messages

## Privacy & Security

- **Data Storage**: Your data is stored locally in your browser and synced to Supabase cloud
- **Authentication**: Secure email/password authentication via Supabase
- **Row Level Security**: Database policies ensure you can only access your own data
- **No Tracking**: No analytics, no tracking scripts, no third-party services
- **Open Source**: All code is visible in the repository
- **Backups**: Always export your data regularly as a backup

## Future Enhancements

Possible features to add:
- Dark mode toggle
- Calendar view of activities
- Tags/labels for activities
- Pomodoro timer integration
- Export to CSV/PDF
- Keyboard shortcuts
- Service Worker for offline support
- Password reset functionality
- Email verification
- Activity templates
- Bulk edit operations

## License

Free to use, modify, and distribute as you wish.

## Support

This is a standalone application with no external support. If you encounter issues:
1. Check the browser console for errors
2. Verify all files are present
3. Try clearing browser cache and localStorage
4. Use a modern, updated browser

---

Built with vanilla JavaScript, HTML, and CSS. No frameworks, no dependencies, no build process.

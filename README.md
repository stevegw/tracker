# Technical Enablement Tracker

A vanilla JavaScript web application for tracking technical enablement activities and building knowledge over time. No frameworks, no dependencies, just pure HTML, CSS, and JavaScript.

## Features

- **Category Management**: Organize activities into color-coded categories
- **Activity Tracking**: Create, edit, and manage learning activities with multiple states
- **Progress Statistics**: Track completion rates, streaks, and time spent
- **Due Dates**: Set deadlines with visual indicators for overdue and upcoming tasks
- **Notes & Resources**: Add notes and resource links to each activity
- **Search & Filtering**: Quickly find activities by keywords, category, status, or due date
- **Cloud Sync**: Automatically sync your data across devices using Google Drive
- **Data Management**: Export and import your data as JSON files
- **Browser Notifications**: Get notified about overdue and upcoming activities
- **Local Storage**: All data persists in your browser's localStorage

## Cross-Device Sync

The tracker includes Google Drive integration to automatically sync your data across all your devices (phone, tablet, desktop).

### Setting Up Google Drive Sync

**Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Enablement Tracker")
3. Select your project from the dropdown

**Step 2: Enable Google Drive API**

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and click "Enable"

**Step 3: Create API Credentials**

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API Key and save it somewhere safe
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields (app name, support email)
   - Add your email as a test user
   - Save and continue through the steps
6. Back in "Create OAuth Client ID":
   - Application type: "Web application"
   - Add authorized JavaScript origins: `http://localhost` or your domain
   - Click "Create"
7. Copy the Client ID and save it

**Step 4: Configure in the Tracker**

1. Open your enablement tracker
2. Click the ⚙️ settings icon
3. In the "Cloud Sync (Google Drive)" section:
   - Paste your **Client ID**
   - Paste your **API Key**
   - Check "Auto-sync on changes" (recommended)
   - Click "Save Configuration"

**Step 5: Connect to Google Drive**

1. Click "Connect to Google Drive"
2. Sign in with your Google account
3. Grant permissions when prompted
4. Your data will automatically sync to Google Drive

### Using Cloud Sync

Once configured:

- **Automatic Sync**: Changes are automatically saved to Google Drive within 2 seconds
- **Cross-Device**: Open the tracker on any device, sign in, and your data syncs
- **Conflict Resolution**: If data exists on both cloud and local, you'll be asked which to keep
- **Manual Sync**: Click "Sync Now" in settings to force an immediate sync
- **Sync Status**: Check the top of the page to see when you last synced

### First Time on a New Device

1. Open the tracker on your new device
2. Go to Settings > Cloud Sync
3. Enter the same Client ID and API Key
4. Click "Save Configuration"
5. Click "Connect to Google Drive"
6. Sign in with the same Google account
7. Your data will automatically load from the cloud

### Troubleshooting Sync

**"Cloud sync not configured" error:**
- Make sure you entered both Client ID and API Key correctly
- Click "Save Configuration" after entering credentials

**"Authentication failed" error:**
- Check that your Google Cloud project is set up correctly
- Ensure you added yourself as a test user in OAuth consent screen
- Try disconnecting and reconnecting

**Data not syncing:**
- Check the sync status in the header
- Make sure "Auto-sync on changes" is enabled
- Try clicking "Sync Now" manually
- Check browser console for errors

**"Quota exceeded" error:**
- Google Drive has daily API limits for free projects
- Wait 24 hours or upgrade your Google Cloud project

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
│   ├── storage.js         # localStorage wrapper
│   ├── models.js          # Data models and business logic
│   ├── ui.js              # UI controller
│   ├── utils.js           # Helper functions
│   └── components/
│       ├── header.js      # Header component
│       ├── sidebar.js     # Sidebar navigation
│       ├── activity-list.js   # Activity list rendering
│       ├── activity-form.js   # Activity form modal
│       └── stats-dashboard.js # Statistics dashboard
└── README.md              # This file
```

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

- All data stays in your browser - nothing is sent to any server
- No tracking, no analytics, no external dependencies
- Your data is as secure as your browser's localStorage
- Export your data to create backups and ensure you don't lose anything

## Future Enhancements

Possible features to add:
- Dark mode toggle
- Calendar view of activities
- Tags/labels for activities
- Pomodoro timer integration
- Export to CSV/PDF
- Keyboard shortcuts
- Mobile responsive improvements
- Service Worker for offline support

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

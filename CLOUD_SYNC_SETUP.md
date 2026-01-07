# Quick Google Drive Sync Setup Guide

Follow these steps to enable cross-device syncing for your Technical Enablement Tracker.

## What You'll Need

- A Google account
- About 5-10 minutes for initial setup

## Setup Steps

### 1. Create Google Cloud Project (One-time setup)

1. Go to: https://console.cloud.google.com/
2. Click "Select a project" dropdown → "New Project"
3. Name it: "Enablement Tracker" → Click "Create"
4. Wait for the project to be created, then select it

### 2. Enable Google Drive API

1. In the left menu, go to: **APIs & Services** → **Library**
2. Search for: "Google Drive API"
3. Click on it → Click **"Enable"**

### 3. Get Your API Key

1. Go to: **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"API key"**
3. **Copy the API Key** and save it (you'll paste it in the tracker later)
4. Click "Close"

### 4. Get Your OAuth Client ID

1. Still in **Credentials**, click **"Create Credentials"** → **"OAuth 2.0 Client ID"**

2. If you see "Configure Consent Screen":
   - Click **"Configure Consent Screen"**
   - Choose **"External"** → Click **"Create"**
   - Fill in:
     - App name: "Enablement Tracker"
     - User support email: (your email)
     - Developer contact: (your email)
   - Click **"Save and Continue"**
   - Skip "Scopes" → Click **"Save and Continue"**
   - In "Test users", click **"Add Users"**
   - Add your email → Click **"Add"**
   - Click **"Save and Continue"** → **"Back to Dashboard"**

3. Go back to **Credentials** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
   - Application type: **"Web application"**
   - Name: "Enablement Tracker Client"
   - Under "Authorized JavaScript origins", click **"Add URI"**:
     - Add: `file://` (if opening locally)
     - Or add your domain if hosting online
   - Click **"Create"**
   - **Copy the Client ID** and save it

### 5. Configure the Tracker

1. Open your **Technical Enablement Tracker** (index.html)
2. Click the **⚙️ Settings** icon (top right)
3. Scroll to **"Cloud Sync (Google Drive)"** section
4. Paste:
   - **Client ID**: (from step 4)
   - **API Key**: (from step 3)
5. Make sure **"Auto-sync on changes"** is checked
6. Click **"Save Configuration"**

### 6. Connect to Google Drive

1. In the same settings section, click **"Connect to Google Drive"**
2. A Google sign-in window will appear
3. Sign in with your Google account
4. Click **"Continue"** when asked to verify it's you
5. Review permissions and click **"Continue"**
6. You should see "Connected to Google Drive" message

✅ **Done!** Your data will now automatically sync to Google Drive.

## Using on Additional Devices

To access your data on another device (phone, tablet, work computer):

1. Open the tracker on the new device
2. Go to **Settings** → **Cloud Sync**
3. Enter the **same Client ID and API Key**
4. Click **"Save Configuration"**
5. Click **"Connect to Google Drive"**
6. Sign in with the **same Google account**
7. Your data will automatically load!

## Verification

To verify sync is working:

1. Check the top of the page for **sync status** (should say "Last synced: just now")
2. Make a change (create an activity)
3. Wait 2-3 seconds
4. The sync status should update
5. Open the tracker on another device → changes should appear

## Where is My Data Stored?

Your data is stored in:
- **Your browser's localStorage** (local backup)
- **Your Google Drive** in a folder called "EnablementTracker"
- File name: `enablement-tracker-data.json`

You can find this file in your Google Drive if you want to view or manually back it up.

## Privacy

- Only **you** can access your data
- It's stored in **your personal Google Drive**
- No data is sent to any third-party servers
- The app only has permission to create and access its own files (not your other Drive files)

## Troubleshooting

**"Could not load GAPI" error:**
- Make sure you have an internet connection
- The app needs to load Google's API libraries

**Sign-in popup is blocked:**
- Allow popups for this site in your browser
- Try clicking "Connect to Google Drive" again

**"Access denied" error:**
- Make sure you added yourself as a test user in OAuth consent screen
- Check that the OAuth Client ID is configured correctly

**Changes not syncing:**
- Check sync status in the header
- Try clicking "Sync Now" manually
- Check browser console (F12) for error messages

**Need to reset:**
- Go to Settings → "Disconnect"
- Then "Connect to Google Drive" again

## Tips

- The setup only needs to be done once
- Same credentials work on all your devices
- Data syncs automatically every time you make a change
- You can still use export/import as manual backup
- Sync works offline - changes will sync when you're back online

## Cost

Google Drive API is **free** for personal use:
- 15 GB of Drive storage (free tier)
- More than enough for this tracker (data is typically < 1 MB)
- No credit card required

---

**Need help?** Check the browser console (press F12) for error messages, or review the full README.md file.

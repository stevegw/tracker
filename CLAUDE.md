# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Technical Enablement Tracker** - A vanilla JavaScript web app for tracking learning activities and technical skills development.

**Key Constraint**: Zero build process. No npm, webpack, bundlers, or transpilers. Files are served directly to the browser.

## Architecture

### MVC Pattern with Component-Based UI

- **Models** (`js/models.js`): CategoryModel, ActivityModel, StatsModel - all business logic
- **Views** (Components in `js/components/`): UI rendering with object literal singletons
- **Controller** (`js/ui.js`): UIController orchestrates all components

### Data Storage: Hybrid Local + Cloud

```
User Action
  ↓
Model.update()
  ↓
Storage.save() → localStorage (immediate, always works)
  ↓
SupabaseSync.save() → Cloud (async, when authenticated)
  ↓
UIController.refresh() → Re-render UI
```

**Critical**: Changes must ALWAYS save to localStorage first. Cloud sync is secondary and optional.

## Key Files & Their Roles

| File | Purpose | When to Edit |
|------|---------|--------------|
| `js/models.js` | Data structures, CRUD operations, business logic | Adding fields, changing data behavior |
| `js/ui.js` | Component orchestration, event handling | New filters, keyboard shortcuts, global UI logic |
| `js/storage.js` | localStorage wrapper (STORAGE_KEYS) | Changing data persistence format |
| `index.html` | ALL HTML structure including modals | Adding UI elements, forms, modals |
| `css/main.css` | CSS variables, layout, theming | Colors, spacing, fonts, dark mode |
| `css/components.css` | Component-specific styles | Styling specific UI components |

### Component Files

Each component follows this pattern:
```javascript
const ComponentName = {
    init() { /* Set up event listeners */ },
    render() { /* Update DOM */ },
    show() { /* Display modal/section */ },
    hide() { /* Hide modal/section */ }
};
```

## Data Structures

### Activity Object
```javascript
{
    id: "uuid",
    title: "string",
    description: "string",
    categoryId: "uuid or null",
    status: "not-started | in-progress | completed",
    dueDate: timestamp or null,
    completedAt: timestamp or null,
    notes: "string",
    cadence: "one-time | daily | weekly | monthly",
    resources: [{ title: "string", url: "string" }],
    timeSpent: number,  // milliseconds
    createdAt: timestamp,
    updatedAt: timestamp,
    isWelcomeActivity: boolean  // For sample data
}
```

### Recurring Tasks

When an activity with `cadence !== 'one-time'` is marked completed:
1. Original task completes normally
2. New instance auto-created with same properties
3. Due date calculated: daily (+1 day), weekly (+7 days), monthly (+1 month)
4. See `ActivityListComponent.createRecurringInstance()` for logic

## Version Management & Deployment

**Critical for every deployment:**

1. Update `version.json`: `{"version":"1.0.X"}`
2. Update ALL `?v=1.0.X` query strings in `index.html`
3. Commit with semantic message
4. Push to GitHub → GitHub Pages auto-deploys
5. Users auto-refresh on next visit (no manual action needed)

**How auto-refresh works:**
- `version.js` loads with `cache: 'no-cache'`
- Compares server version vs localStorage version
- Mismatch triggers hard reload with "Updating..." message
- Query strings force browsers to fetch new files

**Version numbering:**
- Major (1.0.0): Architecture changes
- Minor (0.1.0): New features
- Patch (0.0.1): Bug fixes, small improvements

## Common Development Tasks

### Adding a Field to Activities

1. **Update model** (`js/models.js`):
   ```javascript
   // In ActivityModel.create()
   newField: data.newField || defaultValue
   ```

2. **Update form** (`index.html`):
   ```html
   <div class="form-group">
       <label for="activity-newfield">Label</label>
       <input id="activity-newfield" />
   </div>
   ```

3. **Update form component** (`js/components/activity-form.js`):
   - Read value in `handleSubmit()`
   - Set value in `show()` for edit mode

4. **Update display** (`js/components/activity-list.js`):
   - Add to `createActivityCard()` or `createBadges()`

### Adding a Modal Dialog

1. Add modal HTML to `index.html`:
   ```html
   <div class="modal" id="my-modal">
       <div class="modal-content modal-small">
           <div class="modal-header">
               <h2>Title</h2>
               <button class="modal-close" id="my-modal-close">&times;</button>
           </div>
           <div class="modal-body">
               <!-- Content -->
           </div>
       </div>
   </div>
   ```

2. Create component file `js/components/my-component.js`:
   ```javascript
   const MyComponent = {
       show() {
           document.getElementById('my-modal').classList.add('active');
       },
       hide() {
           document.getElementById('my-modal').classList.remove('active');
       },
       init() {
           document.getElementById('my-modal-close').addEventListener('click', () => this.hide());
       }
   };
   ```

3. Load in `index.html` and initialize in `UIController.init()`

### Smart Command Bar Natural Language Parsing

The command bar (`js/components/command-bar.js`) parses:
- **Dates**: "tomorrow", "Friday", "next Monday", "3/15"
- **Categories**: "@category-name" (auto-creates if doesn't exist)
- **Cadence**: "#daily", "/weekly", "#monthly"
- **Priority**: "#urgent", "#important" (parsed but not currently used)

Example: `"Review AWS docs by Friday @learning #daily"`
→ Creates daily activity in "learning" category due this Friday

### Filters & Search

All filtering happens in `UIController.applyFilters()`:
- Reads filter values from DOM
- Builds filter object
- Calls `ActivityModel.filterAndSort()`
- Passes results to `ActivityListComponent.render()`

Filters are in a modal (`filters-modal`) triggered by "Filters & Sort" button.

## Supabase Integration

### Configuration
- URL and anon key in `js/supabase-client.js`
- Tables: `categories`, `activities`
- Row Level Security (RLS) ensures users only see their data

### Sync Logic
- `js/supabase-sync.js` handles all cloud operations
- `loadFromSupabase()` called on auth state change
- `save*()` methods called after localStorage saves
- Converts between camelCase (JS) and snake_case (DB)

**Important**: Supabase is optional. App works fully offline with localStorage only.

## Styling & Theming

### CSS Variables (`css/main.css`)
```css
--primary-color, --primary-hover
--background, --surface, --border
--text-primary, --text-secondary
--spacing-xs through --spacing-xxl
--radius-sm, --radius-md, --radius-lg
--shadow-sm, --shadow-md, --shadow-lg
```

### Dark Mode
- Toggle via Settings modal
- Applies `body.dark-mode` class
- Dark theme variables defined in `body.dark-mode { }` block

### Font Scaling
- Settings: small, normal, large, xlarge (default), xxlarge, xxxlarge
- Applies classes like `body.font-xlarge`
- Existing users migrated from "normal" to "xlarge" on v1.0.20+

## Mobile Responsiveness

- Breakpoint: 768px
- Sidebar becomes overlay at mobile
- `UIController.closeMobileSidebar()` called after category selection
- Touch-friendly button sizes (minimum 44px)
- Command bar hint text hidden on small screens

## Testing & Debugging

**No automated tests.** Manual testing approach:

1. **Sample data**: Run `createSampleData()` in console
2. **localStorage inspection**: DevTools → Application → Local Storage
3. **Supabase monitoring**: Network tab for API calls
4. **Console logging**: Extensive `console.log()` throughout codebase

**Common debugging scenarios:**
- Auth issues: Check `AuthComponent.handleAuthStateChange()`
- Sync problems: Monitor Network tab for Supabase requests
- UI not updating: Verify `UIController.refresh()` is called
- Filter not working: Check `UIController.applyFilters()` logic

## Browser Compatibility

- **Minimum versions**: Chrome/Edge 90+, Firefox 88+, Safari 14+
- **Required**: localStorage, cookies (for auth), ES6 support
- **Notifications**: HTTPS or localhost only

## Important Notes

### Don't Break These Rules

1. **Never use build tools** - Files must work directly in browser
2. **localStorage before cloud** - Always save local first
3. **UIController.refresh() after changes** - Or UI won't update
4. **Update version.json AND query strings** - Or cache will break
5. **Components are singletons** - Don't use `new ComponentName()`
6. **Timestamps in milliseconds** - Use `Date.now()`, not seconds

### UX Philosophy

- **Offline-first**: App must work without internet
- **Instant feedback**: Changes appear immediately (no loading spinners for local ops)
- **Casual, friendly**: Like Apple Reminders, not enterprise software
- **Celebrations**: Confetti on completion, streak milestones
- **No friction**: Command bar for quick entry, minimal clicks

### Security Considerations

- Supabase anon key is intentionally public
- RLS policies prevent cross-user data access
- localStorage is unencrypted (browser security responsibility)
- Export/import for user-controlled backups

## Common Patterns

### Adding a badge to activity cards
```javascript
// In ActivityListComponent.createBadges()
badges.push(`
    <span class="activity-badge badge-mytype">
        ${icon} ${label}
    </span>
`);
```

### Triggering a celebration
```javascript
CelebrationComponent.celebrate(activityCardElement);
// For milestones:
CelebrationComponent.celebrateStreak(streakDays);
```

### Creating a new model instance
```javascript
const model = new ActivityModel();  // Loads from Storage
model.create(data);  // Saves to Storage + Supabase
```

### Refreshing specific components
```javascript
HeaderComponent.update();        // Stats in header
SidebarComponent.render();        // Category list
UIController.applyFilters();      // Activity list
// Or refresh everything:
UIController.refresh();
```

## Recent Major Features (Context for Future Work)

- **v1.0.26**: Filters moved to modal dialog (space-saving)
- **v1.0.24**: Auto-repeat for recurring tasks
- **v1.0.23**: Cadence field (daily/weekly/monthly)
- **v1.0.22**: Dark mode toggle
- **v1.0.21**: Complete font scaling system
- **v1.0.18**: Visual category tags on cards
- **v1.0.17**: Compact cards with dropdown menus
- **v1.0.11**: Smart command bar, celebrations, welcome activities

## File Loading Order (MUST PRESERVE)

From `index.html`:
1. External: Supabase SDK, Canvas Confetti
2. `version.js` (no cache!)
3. `utils.js`, `storage.js`, `supabase-client.js`
4. `models.js`, `supabase-sync.js`
5. All components
6. `ui.js`
7. `app.js` (entry point)

**Why**: Dependencies between files. Models need utils/storage, components need models, UI needs components, app needs everything.

# Developer Release Workflow

Since we have disabled auto-updates, updates must be triggered manually by the user. As a developer, you need to follow this process to release a new version.

## 1. Version Bump
1.  Open `package.json`
2.  Increment the `version` field (e.g., `1.0.0` -> `1.0.1`)
3.  Open `src/components/SettingsView.tsx`
4.  Update the `APP_VERSION` constant to match:
    ```typescript
    const APP_VERSION = "1.0.1";
    ```

## 2. Commit & Push
Committing to `main` will automatically trigger the GitHub Action we set up.

```bash
git add .
git commit -m "Release: v1.0.1 - Brief description of changes"
git push origin main
```

## 3. GitHub Action (Automated)
-   The "Deploy to GitHub Pages" action will run.
-   It builds the app.
-   It generates a new `sw.js` (Service Worker) with a unique revision hash.
-   It deploys the new `dist` folder to the `gh-pages` environment.

## 4. User Experience
1.  The user opens the app.
2.  The app checks `sw.js` in the background (or when they click "Check for Updates" in Settings).
3.  The browser detects a byte-difference in `sw.js`.
4.  **Settings Page**: The "Check for Updates" button turns **Orange** and says "New version ready to install".
5.  **User Action**: User clicks "Backup & Update".
6.  **Process**:
    -   App triggers a data export (backup).
    -   App calls `updateServiceWorker(true)`.
    -   The new Service Worker takes over (skipWaiting).
    -   Page reloads to load the new assets.

## 5. Verification
-   After pushing, go to the live site.
-   Go to Settings.
-   Click "Check for Updates".
-   If you see the orange button, the update flow is working.

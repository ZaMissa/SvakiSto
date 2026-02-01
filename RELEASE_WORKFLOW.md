# Developer Release Workflow

Since we have disabled auto-updates, updates must be triggered manually by the user. As a developer, you need to follow this process to release a new version.

## 1. Version Bump
1.  Open `package.json` and increment `version`.
2.  Open `src/version.ts` and increment `APP_VERSION`.
3.  Open `public/version.json` and increment `version` + add release notes.

## 2. Commit & Push
Committing to `main` will automatically trigger the GitHub Action we set up.

```bash
git add .
git commit -m "chore(release): bump to v1.3.5 - Description"
git push origin main
```

## 3. GitHub Action (Automated)
-   The "Deploy to GitHub Pages" action will run.
-   It builds the app.
-   It generates a new `sw.js` (Service Worker) with a unique revision hash.
-   It deploys the new `dist` folder to the `gh-pages` environment.

## 4. User Experience (Update Flow)
1.  **Detection**: The app checks for updates automatically on load (or manually via Settings > "Check for Update").
2.  **Notification**: A toast or status indicator shows "New version found!".
3.  **Action**: User clicks "Update Available".
4.  **Safety First**: A modal appears offering **Backup & Update** or **Skip Backup**.
    *   *Note*: An internal hidden backup is created automatically even if the user skips.
5.  **Update**: On confirmation, the new Service Worker activates and the page reloads.

## 5. Verification
-   After pushing, go to the live site.
-   Go to Settings.
-   Click "Check for Updates" manually to verify the new version is detected.

# Deploying SvakiSto Manager

This guide explains how to deploy the application to GitHub Pages (or any static host).

## Prerequisites
- A GitHub account.
- A repository for this project.

## Automated Deployment (Recommended)

1. **Push to GitHub**:
   Ensure your code is pushed to your GitHub repository.

2. **Configure GitHub Pages**:
   - Go to your Repository Settings > Pages.
   - Under "Build and deployment", select **GitHub Actions** as the source.
   - Select the **Static HTML** workflow (or configure a custom workflow).

   *Alternatively, use the `gh-pages` branch method:*
   - Install `gh-pages`: `npm install gh-pages --save-dev`
   - Add script to `package.json`: `"deploy": "gh-pages -d dist"`
   - Run `npm run build && npm run deploy`

## Manual Deployment

1. **Build the Project**:
   Run the build command to generate the static files.
   ```powershell
   npm run build
   ```
   This creates a `dist` folder.

2. **Verify Output**:
   Check if `dist/index.html` and `dist/sw.js` exist.

3. **Upload**:
   - Upload the contents of the `dist` folder to your web server.
   - **GitHub Pages**: You can switch the "Pages" source to "Deploy from a branch" and push the `dist` folder content to a `gh-pages` branch.

## PWA Notes
- The application uses `vite-plugin-pwa` to generate a Service Worker (`sw.js`).
- The app must be served over **HTTPS** for the PWA features (offline mode, installation) to work. GitHub Pages provides HTTPS by default.
- Using `base: './'` in `vite.config.ts` ensures the app works in subdirectories (e.g., `user.github.io/repo-name`).

## Update Safety
- The application checks for updates by looking for a `version.json` file.
- When deploying a new version:
  1. Increment the version in `package.json`.
  2. Update `public/version.json` with the new version.
  3. Build and deploy.
- Users will be notified of the update and prompted to backup their data before reloading.

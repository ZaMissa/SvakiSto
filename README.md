# SvakiSto 🖥️
**Secure AnyDesk Client Manager | Siguran AnyDesk Menadžer Klijenata**

![PWA Ready](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge&logo=pwa) ![React](https://img.shields.io/badge/React-v18-blue?style=for-the-badge&logo=react) ![Vite](https://img.shields.io/badge/Vite-Rapid-yellow?style=for-the-badge&logo=vite) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[🇬🇧 English](#english) | [🇷🇸 Srpski](#srpski)

---

## <a name="english"></a>🇬🇧 English

### 🚀 Overview
**SvakiSto** is a modern, offline-first Progressive Web App (PWA) designed to manage large lists of AnyDesk clients securely. Built for speed and privacy, it stores all your data locally in your browser using IndexedDB (Dexie.js), meaning your sensitive passwords and client lists never leave your device unless you explicitly export them.

### ✨ Key Features
-   **🔐 Zero-Knowledge Privacy**: All data is stored locally. No external servers.
-   **📂 Visual Hierarchy**: Organize clients into `Client > Object > Station` structures.
-   **⚡ Quick Actions**: Copy passwords or launch AnyDesk with a single click.
-   **📱 Mobile-First**: Fully responsive design with a dedicated mobile experience.
-   **🕵️ Manager Mode**: Advanced search, sort by name or date, and mobile-optimized inspection.
-   **🛡️ Safety Backups**: Automatic preemptive backups before every update.
-   **🔄 Smart Updates**: Manual check button, auto-detection, and safe update flows.
-   **🌍 Bilingual**: Instant switching between English and Serbian.
-   **🌓 Appearance**: Light, Dark, or System Sync modes.
-   **🛠️ Developer Friendly**: Clean architecture with separated concerns.

### 🏗️ Project Structure
The project is organized for scalability and maintainability:
-   `src/components`: Core UI components (Settings, FileTree, Dashboard).
-   `src/db`: Database schema and Dexie.js configuration.
-   `src/hooks`: Custom hooks (e.g., `usePWA`).
-   `src/utils`: Helper functions (Security, Formatting).
-   `src/assets`: Static assets like images and icons.

### 🛠️ Installation (Local)
1.  Clone the repository:
    ```bash
    git clone https://github.com/ZaMissa/SvakiSto.git
    cd SvakiSto
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    Or to preview the build locally:
    ```bash
    npm run preview
    ```

### 📦 Deployment & Release
This app is ready for GitHub Pages.
-   **Automated Workflow**: Pushing to `main` triggers the build and deploy action.
-   **Manual Release**: Follow the guide in [RELEASE_WORKFLOW.md](RELEASE_WORKFLOW.md) for versioning and release steps.

---

## <a name="srpski"></a>🇷🇸 Srpski

### 🚀 Pregled
**SvakiSto** je moderna, brza PWA aplikacija dizajnirana za bezbedno upravljanje velikim listama AnyDesk klijenata. Napravljena sa fokusom na privatnost, svi vaši podaci se čuvaju lokalno u vašem pretraživaču koristeći IndexedDB (Dexie.js). Vaše osetljive lozinke i liste klijenata nikada ne napuštaju vaš uređaj osim ako ih sami ne izvezete.

### ✨ Ključne Funkcionalnosti
-   **🔐 Potpuna Privatnost**: Svi podaci ostaju na vašem uređaju. Nema eksternih servera.
-   **📂 Vizuelna Hijerarhija**: Organizujte klijente kroz strukturu `Klijent > Objekat > Stanica`.
-   **⚡ Brze Akcije**: Kopirajte lozinke ili pokrenite AnyDesk jednim klikom.
-   **📱 Prilagođeno Mobilnim Uređajima**: Potpuno responzivan dizajn sa posebnim mobilnim prikazom.
-   **🕵️ Menadžer Mod**: Napredna pretraga, sortiranje po imenu ili datumu.
-   **📥 Uvoz/Izvoz**: Bezbedno pravljenje rezervnih kopija putem AES-enkriptovanih JSON fajlova.
-   **🌍 Dvojezičnost**: Trenutno prebacivanje između Engleskog i Srpskog jezika.
-   **🌓 Tamna Tema**: Moderan izgled sa automatskom ili ručnom promenom teme.

### 🛠️ Instalacija (Lokalno)
1.  Klonirajte repozitorijum:
    ```bash
    git clone https://github.com/ZaMissa/SvakiSto.git
    cd SvakiSto
    ```
2.  Instalirajte zavisnosti:
    ```bash
    npm install
    ```
3.  Pokrenite server:
    ```bash
    npm run dev
    ```

### 📦 Postavljanje (Deployment)
Aplikacija je spremna za GitHub Pages.
-   Pogledajte [RELEASE_WORKFLOW.md](RELEASE_WORKFLOW.md) za detaljno uputstvo o verzijama i objavljivanju.

---

### 🏗️ Tech Stack
-   **Framework**: React 18 + TypeScript
-   **Build Tool**: Vite + PWA Plugin
-   **Styling**: TailwindCSS
-   **Database**: Dexie.js (IndexedDB wrapper)
-   **Encryption**: Crypto-js (AES)
-   **Utilities**: date-fns, clsx, Lucide React

---
&copy; 2026 SvakiSto Development. Open Source.

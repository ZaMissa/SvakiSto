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
-   **📥 Import/Export**: Securely backup your database with AES-encrypted JSON files.
-   **🌍 Bilingual**: Instant switching between English and Serbian.
-   **🌓 Dark Mode**: Sleek UI with automatic or manual theme switching.
-   **🕵️ Manager Mode**: Advanced search, sorting, and bulk management.

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

### 📦 Deployment
This app is ready for GitHub Pages.
1.  Build the project: `npm run build`
2.  Deploy the `dist` folder or use the automated workflow.

---

## <a name="srpski"></a>🇷🇸 Srpski

### 🚀 Pregled
**SvakiSto** je moderna, brza PWA aplikacija dizajnirana za bezbedno upravljanje velikim listama AnyDesk klijenata. Napravljena sa fokusom na privatnost, svi vaši podaci se čuvaju lokalno u vašem pretraživaču koristeći IndexedDB (Dexie.js). Vaše osetljive lozinke i liste klijenata nikada ne napuštaju vaš uređaj osim ako ih sami ne izvezete.

### ✨ Ključne Funkcionalnosti
-   **🔐 Potpuna Privatnost**: Svi podaci ostaju na vašem uređaju. Nema eksternih servera.
-   **📂 Vizuelna Hijerarhija**: Organizujte klijente kroz strukturu `Klijent > Objekat > Stanica`.
-   **⚡ Brze Akcije**: Kopirajte lozinke ili pokrenite AnyDesk jednim klikom.
-   **📱 Prilagođeno Mobilnim Uređajima**: Potpuno responzivan dizajn sa posebnim mobilnim prikazom.
-   **📥 Uvoz/Izvoz**: Bezbedno pravljenje rezervnih kopija putem AES-enkriptovanih JSON fajlova.
-   **🌍 Dvojezičnost**: Trenutno prebacivanje između Engleskog i Srpskog jezika.
-   **🌓 Tamna Tema**: Moderan izgled sa automatskom ili ručnom promenom teme.
-   **🕵️ Menadžer Mod**: Napredna pretraga, sortiranje i upravljanje podacima.

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
1.  Napravite build: `npm run build`
2.  Postavite `dist` folder ili koristite automatizovani workflow.

---

### 🏗️ Tech Stack
-   **Framework**: React 18 + TypeScript
-   **Build Tool**: Vite
-   **Styling**: TailwindCSS
-   **Database**: Dexie.js (IndexedDB wrapper)
-   **Encryption**: Crypto-js (AES)
-   **Icons**: Lucide React

---
&copy; 2026 SvakiSto Development. Open Source.

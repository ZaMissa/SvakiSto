import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .use(LanguageDetector as any)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          dashboard: "Dashboard",
          clients: "Clients",
          settings: "Settings",
          search: "Search stations...",
          // ... existing keys ...
          "Enter client name:": "Enter client name:",
          "Enter object name:": "Enter object name:",
          "Enter station name:": "Enter station name:",
          "Enter AnyDesk ID:": "Enter AnyDesk ID:",
          "Enter new name:": "Enter new name:",
          "Right-click to add Client": "Right-click to add Client",
          "Station Details": "Station Details",
          // ... keep exiting keys mappings implies keeping full obj? 
          // Re-writing full obj for safety as tool replaces chunks.
          lastUsed: "Last Used",
          frequentlyUsed: "Frequently Used",
          newStation: "New Station",
          add: "Add",
          edit: "Edit",
          delete: "Delete",
          cancel: "Cancel",
          save: "Save",
          password: "Password",
          anydeskId: "AnyDesk ID",
          name: "Name",
          copyPassword: "Copy Password",
          launch: "Launch",
          theme: "Theme",
          language: "Language",
          import: "Import Database",
          export: "Export Database",
          update: "Update Available",
          noStations: "No stations found.",
          confirmDelete: "Are you sure you want to delete this?",
          changelog: "Changelog / Import Preview",
          clientsAndObjects: "Clients & Objects"
        }
      },
      sr: {
        translation: {
          dashboard: "Komandna tabla",
          clients: "Klijenti",
          settings: "Podešavanja",
          search: "Pretraga stanica...",
          // New Keys
          "Enter client name:": "Unesite ime klijenta:",
          "Enter object name:": "Unesite ime objekta:",
          "Enter station name:": "Unesite ime stanice:",
          "Enter AnyDesk ID:": "Unesite AnyDesk ID:",
          "Enter new name:": "Unesite novo ime:",
          "Right-click to add Client": "Desni klik za dodavanje klijenta",
          "Station Details": "Detalji Stanice",
          // ... existing
          lastUsed: "Poslednje korišćeno",
          frequentlyUsed: "Često korišćeno",
          newStation: "Nova stanica",
          add: "Dodaj",
          edit: "Izmeni",
          delete: "Obriši",
          cancel: "Otkaži",
          save: "Sačuvaj",
          password: "Lozinka",
          anydeskId: "AnyDesk ID",
          name: "Naziv",
          copyPassword: "Kopiraj lozinku",
          launch: "Pokreni",
          theme: "Tema",
          language: "Jezik",
          import: "Uvezi bazu",
          export: "Izvezi bazu",
          update: "Ažuriranje dostupno",
          noStations: "Nema pronađenih stanica.",
          confirmDelete: "Da li ste sigurni da želite ovo da obrišete?",
          changelog: "Istorija promena / Pregled uvoza",
          clientsAndObjects: "Klijenti i Objekti"
        }
      }
    }
  });

export default i18n;

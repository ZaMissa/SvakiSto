import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Download, Upload, RefreshCw } from 'lucide-react';
import { db } from '../db/db';
import clsx from 'clsx';
import CryptoJS from 'crypto-js';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Mock update check
    fetch('./version.json').then(async res => {
      if (res.ok) {
        const remote = await res.json();
        // In a real app, compare remote.version with local version
        console.log("Remote version:", remote.version);
        setUpdateAvailable(false); // Default to false for now
      }
    }).catch(() => { });
  }, []);

  // Export/Import State
  const [password, setPassword] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [changelog, setChangelog] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'sr' : 'en');
  };

  // Custom Export
  const handleExport = async () => {
    const clients = await db.clients.toArray();
    const objects = await db.objects.toArray();
    const stations = await db.stations.toArray();

    const data = {
      meta: {
        date: new Date().toISOString(),
        version: "1.0",
        exportedBy: "User" // Could be dynamic if we had user auth
      },
      clients,
      objects,
      stations
    };

    let jsonString = JSON.stringify(data, null, 2);

    if (password) {
      try {
        const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
        jsonString = JSON.stringify({ encrypted: true, content: encrypted });
      } catch (e) {
        alert("Encryption failed");
        return;
      }
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svakisto_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImportFile(e.target.files[0]);
      setShowImportModal(true);
      setChangelog([]);
      setPreviewData(null);
    }
  };

  const analyzeImport = async () => {
    if (!importFile) return;
    const text = await importFile.text();
    let data;

    try {
      const parsed = JSON.parse(text);
      if (parsed.encrypted) {
        if (!password) {
          alert("This file is password protected. Please enter password above.");
          return;
        }
        const bytes = CryptoJS.AES.decrypt(parsed.content, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Wrong password");
        data = JSON.parse(decrypted);
      } else {
        data = parsed;
      }
    } catch (e) {
      alert("Failed to parse file or wrong password.");
      return;
    }

    // Generate Changelog
    const logs: string[] = [];
    logs.push(`Import Date: ${new Date().toLocaleString()}`);
    logs.push(`Source Date: ${data.meta?.date || 'Unknown'}`);
    logs.push(`Clients: ${data.clients?.length || 0}`);
    logs.push(`Objects: ${data.objects?.length || 0}`);
    logs.push(`Stations: ${data.stations?.length || 0}`);

    setChangelog(logs);
    setPreviewData(data);
  };

  const executeImport = async () => {
    if (!previewData) return;

    // Clear current DB (User requested replacement? Or merge? "Restore" usually means replace or merge. 
    // Requirements said "Export and Import database". Usually implies backup/restore. 
    // I will wipe and replace for cleanliness, or we could upsert.
    // Let's wipe and replace but warn.)

    await db.transaction('rw', db.clients, db.objects, db.stations, async () => {
      await db.clients.clear();
      await db.objects.clear();
      await db.stations.clear();

      await db.clients.bulkAdd(previewData.clients);
      await db.objects.bulkAdd(previewData.objects);
      await db.stations.bulkAdd(previewData.stations);
    });

    alert("Import successful!");
    setShowImportModal(false);
    setImportFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>

      {/* Visual Settings */}
      <section className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Appearance</h2>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
            {t('theme')}
          </span>
          <button onClick={toggleTheme} className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg font-medium">
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-xl">Aa</span>
            {t('language')}
          </span>
          <button onClick={toggleLanguage} className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg font-medium uppercase">
            {i18n.language}
          </button>
        </div>
      </section>

      {/* Data Management */}
      <section className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Data Management</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1">Encryption Password (Optional)</label>
            <input
              type="password"
              placeholder="Enter password for export/import..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
              <Download size={20} />
              {t('export')}
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 cursor-pointer">
              <Upload size={20} />
              {t('import')}
              <input type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>
        </div>
      </section>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{t('changelog')}</h3>

            {!previewData ? (
              <div className="text-center py-6">
                <p className="mb-4">File selected: {importFile?.name}</p>
                <button onClick={analyzeImport} className="bg-anydesk text-white px-6 py-2 rounded-xl">Analyze File</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-sm font-mono space-y-1">
                  {changelog.map((log, i) => <div key={i}>{log}</div>)}
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowImportModal(false)} className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">Cancel</button>
                  <button onClick={executeImport} className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600">Confirm Overwrite</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Updates */}
      <section className="glass-card p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", updateAvailable ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500")}>
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 className="font-bold">App Version: 1.0.0</h3>
            <p className="text-sm text-slate-500">Checking against remote repo...</p>
          </div>
        </div>
      </section>
    </div>
  );
}

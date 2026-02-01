import React, { useState } from 'react';
import { Download, Upload, Trash2, Lock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { decryptData } from '../../utils/security';
import { db } from '../../db/db';
import { generateBackupData, downloadBackup } from '../../utils/exportUtils';

interface DataManagementProps {
  appVersion: string;
}

export const DataManagement: React.FC<DataManagementProps> = ({ appVersion }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [filename, setFilename] = useState('svakisto_backup');

  // Import States
  const [importPassword, setImportPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [importContent, setImportContent] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [changelog, setChangelog] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setImportFile] = useState<File | null>(null);

  // --- CLEAR DATA ---
  const handleClearData = async () => {
    if (confirm(t("DANGER: This will delete ALL your data"))) {
      await db.transaction('rw', db.clients, db.objects, db.stations, db.groups, async () => {
        await db.clients.clear();
        await db.objects.clear();
        await db.stations.clear();
        await db.groups.clear();
      });
      alert(t("All data has been cleared."));
    }
  };

  // --- EXPORT ---
  const handleExport = async () => {
    try {
      const data = await generateBackupData(appVersion);
      await downloadBackup(data, password, filename || "svakisto_backup");
    } catch (e) {
      alert("Export failed");
    }
  };

  // --- IMPORT ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      const text = await file.text();
      setImportContent(text);

      try {
        const parsed = JSON.parse(text);
        if (parsed.encrypted) {
          setImportPassword('');
          setShowPasswordModal(true);
        } else {
          analyzeData(parsed);
        }
      } catch (e) {
        alert("Invalid File Format");
      }
    }
    e.target.value = '';
  };

  const handleDecrypt = () => {
    if (!importContent || !importPassword) return;
    try {
      const decrypted = decryptData(importContent, importPassword);
      const data = JSON.parse(decrypted);
      setShowPasswordModal(false);
      analyzeData(data);
    } catch (e) {
      alert(t("Incorrect Password or Corrupted File"));
    }
  };

  const analyzeData = (data: any) => {
    const logs: string[] = [];
    logs.push(`${t('Import Date')}: ${new Date().toLocaleString()}`);
    logs.push(`${t('Source Date')}: ${data.meta?.date || 'Unknown'}`);
    logs.push(`${t('Groups')}: ${data.groups?.length || 0}`);
    logs.push(`${t('clients')}: ${data.clients?.length || 0}`);
    logs.push(`${t('clientsAndObjects')}: ${data.objects?.length || 0}`);
    logs.push(`Stations: ${data.stations?.length || 0}`);

    setChangelog(logs);
    setPreviewData(data);
    setShowChangelogModal(true);
  };

  const executeImport = async () => {
    if (!previewData) return;
    await db.transaction('rw', db.clients, db.objects, db.stations, db.groups, async () => {
      await db.clients.clear();
      await db.objects.clear();
      await db.stations.clear();
      await db.groups.clear();
      await db.clients.bulkAdd(previewData.clients || []);
      await db.objects.bulkAdd(previewData.objects || []);
      await db.stations.bulkAdd(previewData.stations || []);
      await db.groups.bulkAdd(previewData.groups || []);
    });
    alert(t("Import successful!"));
    setShowChangelogModal(false);
    setPreviewData(null);
    setImportFile(null);
    setImportContent(null);
  };

  return (
    <>
      <section className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">{t('Data Management')}</h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-500 mb-1">{t('Filename')}</label>
              <input
                type="text"
                placeholder={t("Enter custom filename...")}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none"
                value={filename}
                onChange={e => setFilename(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-500 mb-1">Password (Optional)</label>
              <input
                type="password"
                placeholder={t("Set a password for the export...")}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <button onClick={handleClearData} className="w-full flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">
              <Trash2 size={20} />
              {t('Clear App Data')}
            </button>
          </div>
        </div>
      </section>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-xl font-bold mb-4 text-anydesk">
              <Lock size={24} />
              <h3>{t('Encrypted Backup')}</h3>
            </div>
            <p className="text-slate-500 mb-4 text-sm">{t('This file is protected. Please enter the password to verify and preview content.')}</p>

            <input
              type="password"
              autoFocus
              placeholder="Enter import password..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none mb-4"
              value={importPassword}
              onChange={e => setImportPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDecrypt()}
            />

            <div className="flex gap-3">
              <button onClick={() => { setShowPasswordModal(false); setImportFile(null); }} className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">{t('cancel')}</button>
              <button onClick={handleDecrypt} className="flex-1 py-2 rounded-xl bg-anydesk text-white hover:bg-anydesk-dark">{t('Unlock')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Changelog/Preview Modal */}
      {showChangelogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{t('changelog')}</h3>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-sm font-mono space-y-1">
                {changelog.map((log, i) => <div key={i}>{log}</div>)}
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <p>{t('Warning: Importing will')} <strong>{t('overwrite')}</strong> {t('all current data. This cannot be undone.')}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowChangelogModal(false); setPreviewData(null); }} className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">{t('cancel')}</button>
                <button onClick={executeImport} className="flex-1 py-2 rounded-xl bg-anydesk text-white hover:bg-anydesk-dark">{t('Confirm Import')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { useTranslation } from 'react-i18next';
import { generateBackupData, downloadBackup, createInternalBackup } from '../../utils/exportUtils';
import { UpdateModal } from '../UpdateModal';

// ... (keep APP_VERSION prop interface if needed, or remove if unused in this file scope)
interface UpdateManagerProps {
  appVersion: string;
}

export const UpdateManager: React.FC<UpdateManagerProps> = ({ appVersion }) => {
  const { needRefresh, updateServiceWorker, checking, handleCheckUpdate } = usePWA(appVersion);
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto-Backup as soon as update is detected
  React.useEffect(() => {
    if (needRefresh) {
      createInternalBackup(appVersion).catch(console.error);
    }
  }, [needRefresh, appVersion]);

  const handleUpdateClick = () => {
    setShowModal(true);
  };

  const performUpdate = async () => {
    setIsUpdating(true);
    // Always create an internal safety backup silently
    await createInternalBackup(appVersion);
    updateServiceWorker(true);
  };

  const handleConfirmBackup = async (filename: string) => {
    try {
      const data = await generateBackupData(appVersion);
      await downloadBackup(data, undefined, filename || "svakisto_backup");

      // Give browser a moment to start download before updating/reloading
      setTimeout(() => {
        performUpdate();
      }, 1500);
    } catch (e) {
      console.error("Backup failed", e);
      // Fallback to just updating if backup fails? Or alert?
      // For now, proceed with update as internal backup still runs in performUpdate
      performUpdate();
    }
  };

  return (
    <section className="glass-card p-6 rounded-2xl mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">{t('System Up to Date')}</h2>
          <p className="text-slate-500 text-sm">
            {needRefresh ? t('New version found!') : t('Running latest version')} {appVersion}
          </p>
        </div>

        {needRefresh ? (
          <button
            onClick={handleUpdateClick}
            disabled={isUpdating}
            className="bg-anydesk text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-anydesk-dark transition-colors shadow-lg shadow-anydesk/20 animate-pulse"
          >
            {isUpdating ? (
              <span>{t('Restarting App...')}</span>
            ) : (
              <>
                <RefreshCw size={18} />
                {t('Update Available')}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleCheckUpdate}
            disabled={checking}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-anydesk transition-colors px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
            {checking ? t('Checking...') : t('Check for Update')}
          </button>
        )}
      </div>

      <UpdateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirmBackup={handleConfirmBackup}
        onSkipBackup={performUpdate}
      />
    </section >
  );
};

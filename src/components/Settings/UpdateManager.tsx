import React from 'react';
import { Download, Share, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { usePWA } from '../../hooks/usePWA';

interface UpdateManagerProps {
  pwa: ReturnType<typeof usePWA>;
}

export const UpdateManager: React.FC<UpdateManagerProps> = ({ pwa }) => {
  const { t } = useTranslation();
  const {
    isStandalone,
    deferredPrompt,
    isIOS,
    handleInstallClick,
    needRefresh,
    checking,
    handleCheckUpdate,
    updateServiceWorker,
    currentVersion
  } = pwa;

  const handleUpdateFlow = () => {
    // In a real app we might want to backup first, but here we just update
    if (confirm(t("updateBackupPrompt") || "Update available. Update now?")) {
      updateServiceWorker(true);
    }
  };

  return (
    <>
      {/* Install App Section */}
      {(!isStandalone && (deferredPrompt || isIOS)) && (
        <section className="glass-card p-6 rounded-2xl space-y-4 border-2 border-anydesk/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-anydesk/10 flex items-center justify-center text-anydesk">
              <Download size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg">{t('Install App')}</h2>
              <p className="text-sm text-slate-500">{t('Install for the best experience')}</p>
            </div>
          </div>

          {isIOS ? (
            <div className="text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-2">
              <p className="flex items-center gap-2 font-medium">1. {t('Tap the Share button')} <Share size={16} /></p>
              <p className="flex items-center gap-2 font-medium">2. {t('Select "Add to Home Screen"')} <span className="text-xl leading-none">+</span></p>
            </div>
          ) : (
            <button onClick={handleInstallClick} className="w-full bg-anydesk text-white py-3 rounded-xl font-bold shadow-lg shadow-anydesk/20 hover:bg-anydesk-dark transition-all">
              {t('Install Now')}
            </button>
          )}
        </section>
      )}

      {/* Updates Section */}
      <section className="glass-card p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", needRefresh ? "bg-amber-100 text-amber-500" : "bg-green-100 text-green-500")}>
            <RefreshCw size={20} className={clsx((checking || needRefresh) && "animate-spin")} />
          </div>
          <div>
            <h3 className="font-bold">{needRefresh ? t('Update Available') : t('System Up to Date')}</h3>
            <p className="text-sm text-slate-500">
              {needRefresh
                ? t('New version ready to install')
                : checking
                  ? t('Checking for updates...')
                  : `${t('Version')} ${currentVersion}`}
            </p>
          </div>
        </div>

        {needRefresh ? (
          <button onClick={handleUpdateFlow} className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all">
            {t('Backup & Update')}
          </button>
        ) : (
          <button onClick={handleCheckUpdate} disabled={checking} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50">
            {t('Check for Updates')}
          </button>
        )}
      </section>
    </>
  );
};

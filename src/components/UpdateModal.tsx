import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Download, RefreshCw, X } from 'lucide-react';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBackup: (filename: string) => void;
  onSkipBackup: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, onConfirmBackup, onSkipBackup }) => {
  const { t } = useTranslation();
  const [filename, setFilename] = useState('svakisto_backup');

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
            <RefreshCw size={32} />
          </div>
          <h2 className="text-xl font-bold">{t('Update Available')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('backup_update_desc')}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <label className="block text-left text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('Filename')}
          </label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('Enter custom filename...')}
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onConfirmBackup(filename)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download size={18} />
            {t('Backup & Update')}
          </button>

          <button
            onClick={onSkipBackup}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors"
          >
            {t('Skip Backup')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

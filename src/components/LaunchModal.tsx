import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MonitorPlay, Key, Eye, EyeOff, Copy, X } from 'lucide-react';
import { type Station } from '../db/db';

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station;
  onLaunch: () => void;
}

export default function LaunchModal({ isOpen, onClose, station, onLaunch }: LaunchModalProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (station.password) {
      navigator.clipboard.writeText(station.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-anydesk/10 rounded-full flex items-center justify-center mb-4 text-anydesk">
            <MonitorPlay size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {t('Launch')} {station.name}
          </h3>
          <p className="text-sm text-slate-500">{station.anydeskId}</p>
        </div>

        {station.password && (
          <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Key size={12} />
                {t('password')}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-anydesk font-medium hover:underline flex items-center gap-1"
              >
                {copied ? t('Copied!') : t('Copy')}
                {!copied && <Copy size={12} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-lg bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {showPassword ? station.password : '••••••••••••'}
              </div>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onLaunch}
          className="w-full bg-anydesk text-white font-bold py-3.5 rounded-xl hover:bg-anydesk-dark transition-all transform active:scale-95 shadow-lg shadow-anydesk/20 flex items-center justify-center gap-2"
        >
          <MonitorPlay size={20} />
          {t('Open AnyDesk')}
        </button>
      </div>
    </div>
  );
}

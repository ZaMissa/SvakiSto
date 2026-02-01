import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MonitorPlay, Key, Copy, Check, ExternalLink } from 'lucide-react';
import { db, type Station } from '../db/db';

interface StationActionPanelProps {
  station: Station;
  onClose?: () => void; // Optional if embedded
}

export default function StationActionPanel({ station, onClose }: StationActionPanelProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = async () => {
    if (station.password) {
      await navigator.clipboard.writeText(station.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLaunch = async () => {
    // 1. Auto-copy password
    if (station.password) {
      await navigator.clipboard.writeText(station.password);
    }

    // 2. Update usage stats
    db.stations.update(station.id, {
      lastUsed: new Date(),
      usageCount: (station.usageCount || 0) + 1
    });

    // 3. Trigger Protocol
    window.location.href = `anydesk:${station.anydeskId}`;

    if (onClose) onClose();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{station.name}</h2>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 font-mono text-sm">
          <MonitorPlay size={14} />
          {station.anydeskId}
        </div>
      </div>

      {/* Main Action Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 space-y-6">

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          className="w-full bg-anydesk text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-anydesk/30 hover:bg-anydesk-dark hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <ExternalLink size={24} />
          {t('launch')}
        </button>

        <div className="relative h-px bg-slate-100 dark:bg-slate-700">
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white dark:bg-slate-800 px-2 text-slate-400 text-xs uppercase tracking-widest font-medium">
            {t('password')}
          </span>
        </div>

        {/* Password Section */}
        {station.password ? (
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={station.password}
                readOnly
                className="w-full text-center font-mono text-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-10 focus:ring-2 focus:ring-anydesk/50 outline-none transition-all"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <Key size={18} />
              </button>
              <button
                onClick={handleCopyPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-anydesk p-1"
                title={t('copyPassword')}
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400">
              {t('help_cards_launch')}
            </p>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            No password saved.
          </div>
        )}
      </div>

      {/* Stats Mini */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Usage</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{station.usageCount || 0}</span>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Last Used</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {station.lastUsed ? new Date(station.lastUsed).toLocaleDateString() : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}

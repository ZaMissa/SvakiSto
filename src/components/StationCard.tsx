import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MonitorPlay, Key } from 'lucide-react';
import { type Station, db } from '../db/db';

interface StationCardProps {
  station: Station;
  clientName?: string;
  objectName?: string;
}

export default function StationCard({ station, clientName, objectName }: StationCardProps) {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);

  const handleCopyPassword = () => {
    if (station.password) {
      navigator.clipboard.writeText(station.password);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleLaunch = async () => {
    // 1. Auto-copy password if exists
    if (station.password) {
      await navigator.clipboard.writeText(station.password);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }

    // 2. Update usage stats
    db.stations.update(station.id, {
      lastUsed: new Date(),
      usageCount: (station.usageCount || 0) + 1
    });

    // 3. Trigger Protocol
    const protocolUrl = `anydesk:${station.anydeskId}`;
    window.location.href = protocolUrl;
  };

  return (
    <div className="glass-card p-4 rounded-xl space-y-3 group hover:border-anydesk/30 transition-all cursor-default relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-anydesk flex items-center justify-center shrink-0">
            <MonitorPlay size={20} />
          </div>
          <div className="min-w-0"> {/* FIX: min-w-0 for truncation */}
            {/* Breadcrumbs */}
            {(clientName || objectName) && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5 truncate">
                {clientName && <span>{clientName}</span>}
                {clientName && objectName && <span className="text-slate-300">/</span>}
                {objectName && <span>{objectName}</span>}
              </div>
            )}
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1" title={station.name}>
              {station.name}
            </h3>
            <p className="text-sm text-slate-500 font-mono">{station.anydeskId}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleLaunch}
          className="flex-1 bg-anydesk text-white text-sm font-medium py-2 rounded-lg hover:bg-anydesk-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-anydesk/20 active:scale-95"
          title={t('Launch AnyDesk')}
        >
          <MonitorPlay size={16} />
          {t('Launch')}
        </button>

        {station.password && (
          <button
            onClick={handleCopyPassword}
            className="flex-none w-10 h-9 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors active:scale-95 relative"
            title={t('copyPassword')}
          >
            <Key size={16} />
            {showToast && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                {t('Copied!')}
              </div>
            )}
          </button>
        )}
      </div>

      {/* Stats/Meta (Optional: Last Used) */}
      {station.lastUsed && (
        <p className="text-[10px] text-slate-400 text-center">
          {new Date(station.lastUsed).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

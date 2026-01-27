import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MonitorPlay, Key } from 'lucide-react';
import { type Station, db } from '../db/db';

interface StationCardProps {
  station: Station;
}

export default function StationCard({ station }: StationCardProps) {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);

  const handleCopyPassword = () => {
    if (station.password) {
      navigator.clipboard.writeText(station.password);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleLaunch = () => {
    if (station.password) {
      handleCopyPassword();
    }

    // Update usage stats
    db.stations.update(station.id, {
      lastUsed: new Date(),
      usageCount: (station.usageCount || 0) + 1
    });

    // Launch AnyDesk
    // setTimeout to allow toast to be seen if copied
    setTimeout(() => {
      window.location.href = `anydesk:${station.anydeskId}`;
    }, station.password ? 500 : 0);
  };

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 group hover:border-anydesk/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white truncate" title={station.name}>{station.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono mt-1">
            <span className="opacity-70">{t('ID')}:</span>
            <span>{station.anydeskId}</span>
          </div>
        </div>
        <div className="bg-anydesk/10 text-anydesk p-2 rounded-full">
          <MonitorPlay size={20} />
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <button
          onClick={handleLaunch}
          className="flex-1 bg-anydesk hover:bg-anydesk-dark text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <MonitorPlay size={16} />
          {t('launch')}
        </button>
        {station.password && (
          <button
            onClick={handleCopyPassword}
            className="w-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-slate-600 dark:text-slate-300 transition-colors relative"
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
    </div>
  );
}

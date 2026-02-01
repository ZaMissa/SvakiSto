import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MonitorPlay } from 'lucide-react';
import { type Station, db } from '../db/db';
import LaunchModal from './LaunchModal';

interface StationCardProps {
  station: Station;
  clientName?: string;
  objectName?: string;
}

export default function StationCard({ station, clientName, objectName }: StationCardProps) {
  const { t } = useTranslation();
  const [launchModalOpen, setLaunchModalOpen] = useState(false);

  const handleLaunchClick = () => {
    setLaunchModalOpen(true);
  };

  const executeLaunch = async () => {
    // 1. Auto-copy password if exists (User request: "show password" implies manual copy might be preferred, but keeping auto-copy is good UX)
    // Actually, usually launch modals let you copy manually. But let's keep auto-copy as a "convenience" unless it conflicts.
    // Let's just copy it to be safe.
    if (station.password) {
      await navigator.clipboard.writeText(station.password);
    }

    // 2. Update usage stats
    db.stations.update(station.id, {
      lastUsed: new Date(),
      usageCount: (station.usageCount || 0) + 1
    });

    // 3. Trigger Protocol
    const protocolUrl = `anydesk:${station.anydeskId}`;
    window.location.href = protocolUrl;

    setLaunchModalOpen(false);
  };

  return (
    <>
      <div
        onClick={handleLaunchClick}
        className="glass-card p-4 rounded-xl space-y-3 group hover:border-anydesk/30 transition-all cursor-pointer relative hover:shadow-lg hover:shadow-anydesk/5 active:scale-[0.98]"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-anydesk flex items-center justify-center shrink-0">
              <MonitorPlay size={20} />
            </div>
            <div className="min-w-0">
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

        {/* Stats/Meta (Last Used) */}
        {station.lastUsed && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 text-right">
              {t('lastUsed')}: {new Date(station.lastUsed).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <LaunchModal
        isOpen={launchModalOpen}
        onClose={() => setLaunchModalOpen(false)}
        station={station}
        onLaunch={executeLaunch}
      />
    </>
  );
}

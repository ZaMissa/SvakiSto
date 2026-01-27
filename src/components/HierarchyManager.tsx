import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Station } from '../db/db';
import FileExplorer from './FileTree/FileExplorer';
import StationCard from './StationCard';
import { MonitorPlay } from 'lucide-react';

export default function HierarchyManager() {
  const { t } = useTranslation();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.8))] -m-4 md:-m-8">

      {/* Sidebar Tree */}
      <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-700 dark:text-slate-200">Explorer</h2>
        </div>
        <FileExplorer
          onStationSelect={setSelectedStation}
          selectedStationId={selectedStation?.id}
        />
      </div>

      {/* Main Content Area */}
      <div className="hidden md:flex flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 items-start justify-center">
        {selectedStation ? (
          <div className="w-full max-w-lg space-y-6">
            <h2 className="text-2xl font-bold mb-4">{t('Station Details')}</h2>
            <div className="scale-110">
              <StationCard station={selectedStation} />
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="font-semibold border-b pb-2 mb-2">Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-slate-500">Created</span>
                  <span>{new Date(selectedStation.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Usage Count</span>
                  <span>{selectedStation.usageCount || 0}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Last Used</span>
                  <span>{selectedStation.lastUsed ? new Date(selectedStation.lastUsed).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">
            <MonitorPlay size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a station from the explorer to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

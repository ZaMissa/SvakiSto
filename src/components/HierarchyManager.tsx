import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type Station } from '../db/db';
import FileExplorer from './FileTree/FileExplorer';
import StationCard from './StationCard';
import { MonitorPlay, Search, ArrowDownAZ, Calendar, X } from 'lucide-react';
import clsx from 'clsx';

export default function HierarchyManager() {
  const { t } = useTranslation();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  // Mobile Modal logic
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // Desktop layout uses flex container. Mobile uses fixed positioning to "lock" properly.
    <div className="md:flex md:h-[calc(100vh-theme(spacing.8))] md:-m-8">

      {/* Sidebar Tree */}
      {/* Mobile: Fixed between Header (h-16) and Footer (h-16) */}
      <div className={clsx(
        "flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden",
        "fixed inset-x-0 top-16 bottom-16 z-30 md:static md:w-80 md:h-full md:z-auto"
      )}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 dark:text-slate-200">{t('Manager')}</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setSortBy('name')}
                className={`p-1.5 rounded-lg ${sortBy === 'name' ? 'bg-slate-200 dark:bg-slate-700 text-anydesk' : 'text-slate-400 hover:text-slate-600'}`}
                title={t('sortByName')}
              >
                <ArrowDownAZ size={18} />
              </button>
              <button
                onClick={() => setSortBy('date')}
                className={`p-1.5 rounded-lg ${sortBy === 'date' ? 'bg-slate-200 dark:bg-slate-700 text-anydesk' : 'text-slate-400 hover:text-slate-600'}`}
                title={t('sortByDate')}
              >
                <Calendar size={18} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-anydesk/50 border border-transparent focus:border-anydesk"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FileExplorer
            onStationSelect={setSelectedStation}
            selectedStationId={selectedStation?.id}
            searchQuery={searchQuery}
            sortBy={sortBy}
          />
        </div>
      </div>

      {/* Main Content Area (Desktop) */}
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

      {/* Mobile Station Modal */}
      {isMobile && selectedStation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6 relative border border-white/20">
            <button
              onClick={() => setSelectedStation(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-center pr-8">{t('Station Details')}</h3>
            <div className="flex justify-center">
              <StationCard station={selectedStation} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

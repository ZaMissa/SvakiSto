import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import StationCard from './StationCard';
import FileExplorer from './FileTree/FileExplorer';
import { Clock, TrendingUp, Search, Database, Plus } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();

  // Queries
  const lastUsed = useLiveQuery(() =>
    db.stations.orderBy('lastUsed').reverse().limit(4).toArray()
  );

  const frequent = useLiveQuery(() =>
    db.stations.orderBy('usageCount').reverse().limit(4).toArray()
  );

  const [search, setSearch] = React.useState('');
  const [showAddModal, setShowAddModal] = React.useState(false);

  const searchResults = useLiveQuery(() => {
    if (!search) return [];
    return db.stations
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.anydeskId.includes(search))
      .limit(10)
      .toArray();
  }, [search]);

  return (
    <div className="space-y-8 pb-20">

      {/* Search Hero */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-anydesk shadow-sm text-lg outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="aspect-square h-auto bg-anydesk text-white rounded-2xl flex items-center justify-center hover:bg-anydesk-dark transition-colors shadow-lg shadow-anydesk/20"
          title={t('newStation')}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Add Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="font-bold text-lg">{t('Manage Stations')}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-0 relative">
              <div className="absolute inset-0">
                {/* We reuse FileExplorer here. Since we are in a 'Manager' mode, we might not need selection,
                             or selection could assume 'editing'. For 'Add Station' prompt, FileExplorer context menu handles creation.
                             This view just gives them access to the tree to do that. */}
                <FileExplorer
                  onStationSelect={() => { }} // No-op for selection in this mode
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-500 text-center">
              Right-click on folders to add items.
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {search && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('search')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {searchResults?.map(station => (
              <StationCard key={station.id} station={station} />
            ))}
            {searchResults?.length === 0 && (
              <p className="text-slate-500 col-span-full">{t('noStations')}</p>
            )}
          </div>
        </div>
      )}

      {!search && (
        <>
          {/* Last Used section */}
          {lastUsed && lastUsed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs font-bold">
                <Clock size={14} />
                {t('lastUsed')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {lastUsed.map(station => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            </section>
          )}

          {/* Frequent section */}
          {frequent && frequent.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs font-bold">
                <TrendingUp size={14} />
                {t('frequentlyUsed')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {frequent.map(station => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State hint */}
          {(!lastUsed?.length && !frequent?.length) && (
            <div className="text-center py-20 opacity-50">
              <Database size={48} className="mx-auto mb-4 text-slate-300" />
              <p>No stations yet. Click + to add some!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

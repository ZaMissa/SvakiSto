import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import StationCard from './StationCard';
import { Clock, TrendingUp, Search, Database } from 'lucide-react';

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
      <div className="relative">
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
              <p>No stations yet. Go to Clients to add some!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

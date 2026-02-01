import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Station } from '../db/db'; // Ensure Group interface is exported if needed, or infer
import FileExplorer from './FileTree/FileExplorer';
import ContextMenu, { type ContextMenuAction } from './FileTree/ContextMenu';
import StationCard from './StationCard';
import { MonitorPlay, Search, ArrowDownAZ, Calendar, X, Plus, Tag } from 'lucide-react';
import clsx from 'clsx';

export default function HierarchyManager() {
  const { t } = useTranslation();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const groups = useLiveQuery(() => db.groups.toArray());

  // Mobile Modal logic
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddGroup = async () => {
    const name = prompt(t("Enter group name:"));
    if (name) {
      await db.groups.add({ name, color: 'blue' }); // default color
    }
  };

  // Group Context Menu Logic
  const [groupContextMenu, setGroupContextMenu] = useState<{
    x: number;
    y: number;
    groupId: number;
  } | null>(null);

  const handleGroupContextMenu = (e: React.MouseEvent, groupId: number) => {
    e.preventDefault();
    setGroupContextMenu({ x: e.clientX, y: e.clientY, groupId });
  };

  const handleGroupAction = async (action: ContextMenuAction) => {
    if (!groupContextMenu) return;
    const { groupId } = groupContextMenu;
    setGroupContextMenu(null);

    if (action === 'edit') {
      const group = await db.groups.get(groupId);
      if (group) {
        const newName = prompt(t("Edit group name:"), group.name);
        if (newName && newName.trim() !== "") {
          await db.groups.update(groupId, { name: newName });
        }
      }
    } else if (action === 'delete') {
      if (confirm(t("Are you sure you want to delete this group? Clients will remain but become ungrouped."))) {
        // Option A: Just delete group, clients with this groupId effectively become "Ungrouped" if we don't clear field.
        // It's cleaner to clear the field.
        await db.clients.where('groupId').equals(groupId).modify({ groupId: undefined });
        await db.groups.delete(groupId);
        if (selectedGroupId === groupId) setSelectedGroupId(null);
      }
    }
  };

  return (
    // Desktop layout uses flex container. Mobile uses fixed positioning to "lock" properly.
    <div className="md:flex md:h-[calc(100vh-theme(spacing.8))] md:-m-8">

      {/* Sidebar Tree */}
      {/* Mobile: Fixed between Header (h-16) and Footer (h-16) */}
      <div className={clsx(
        "flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden",
        "fixed inset-x-0 top-16 bottom-16 z-30 md:static md:w-80 lg:w-96 2xl:w-[28rem] md:h-full md:z-auto transition-all duration-300"
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

          {/* Horizontal Group Filter */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGroupId(null)}
              className={clsx(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                selectedGroupId === null
                  ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              )}
            >
              All
            </button>
            <button
              onClick={() => setSelectedGroupId(-1)}
              className={clsx(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                selectedGroupId === -1
                  ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              )}
            >
              Uncategorized
            </button>
            {groups?.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                onContextMenu={(e) => handleGroupContextMenu(e, g.id)}
                className={clsx(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border group relative",
                  selectedGroupId === g.id
                    ? "bg-anydesk text-white border-anydesk"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                )}
              >
                <Tag size={10} />
                {g.name}
              </button>
            ))}
            {groupContextMenu && (
              <ContextMenu
                x={groupContextMenu.x}
                y={groupContextMenu.y}
                type="group"
                onAction={handleGroupAction}
                onClose={() => setGroupContextMenu(null)}
              />
            )}
            <button
              onClick={handleAddGroup}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 border border-dashed border-slate-300 dark:border-slate-600"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <FileExplorer
            onStationSelect={setSelectedStation}
            selectedStationId={selectedStation?.id}
            searchQuery={searchQuery}
            sortBy={sortBy}
            filterGroupId={selectedGroupId} // Pass filter
          />
        </div>
      </div>

      {/* Main Content Area (Desktop) */}
      <div className="hidden md:flex flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 items-center justify-center min-h-[500px]">
        {selectedStation ? (
          <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">{selectedStation.name}</h2>
              <div className="flex items-center gap-2 text-slate-500">
                <MonitorPlay size={18} />
                <span className="font-mono text-lg">{selectedStation.anydeskId}</span>
              </div>
            </div>

            <div className="scale-110 origin-top-left w-full">
              <StationCard station={selectedStation} />
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="font-semibold border-b border-slate-100 dark:border-slate-700 pb-2 mb-2 text-slate-800 dark:text-slate-200">Statistics</h3>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <span className="block text-slate-500 mb-1">Created</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(selectedStation.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Usage Count</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedStation.usageCount || 0}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-slate-500 mb-1">Last Used</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedStation.lastUsed ? new Date(selectedStation.lastUsed).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <MonitorPlay size={48} className="opacity-40" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-600 dark:text-slate-300">No Station Selected</h3>
            <p className="max-w-xs mx-auto text-slate-500">Select a station from the list to view connection details, passwords, and history.</p>
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

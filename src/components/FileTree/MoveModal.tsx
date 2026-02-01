import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import type { Client, ClientObject } from '../../db/db';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  moveTarget: { type: 'object' | 'station'; id: number } | null;
  clients: Client[] | undefined;
  objects: ClientObject[] | undefined;
  onExecuteMove: (newParentId: number) => void;
}

export default function MoveModal({
  isOpen,
  onClose,
  moveTarget,
  clients,
  objects,
  onExecuteMove,
}: MoveModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!moveTarget) return [];
    const q = searchTerm.toLowerCase().trim();

    if (moveTarget.type === 'object') {
      // Targets are clients
      if (!clients) return [];
      return clients
        .filter(c => c.name.toLowerCase().includes(q))
        .map(c => ({
          id: c.id,
          name: c.name,
          subtitle: t('Client') // Or group name if available
        }));
    } else {
      // Targets are objects -> Need to show Client Name
      if (!objects) return [];
      return objects
        .filter(o => o.name.toLowerCase().includes(q))
        .map(o => {
          const parentClient = clients?.find(c => c.id === o.clientId);
          return {
            id: o.id,
            name: o.name,
            subtitle: parentClient?.name || t('Unknown Client')
          };
        });
    }
  }, [moveTarget, clients, objects, searchTerm, t]);

  if (!isOpen || !moveTarget) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {t('Move')} {moveTarget.type === 'object' ? t('Object') : t('Station')}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          {t('Select Destination')}
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-anydesk/50 transition-all"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
          {filteredItems.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              {t('No results found')}
            </div>
          ) : (
            filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => onExecuteMove(item.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-slate-200 border border-transparent transition-all group"
              >
                <div className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-anydesk">{item.name}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">{item.subtitle}</div>
              </button>
            ))
          )}
        </div>

        <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors font-medium">
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

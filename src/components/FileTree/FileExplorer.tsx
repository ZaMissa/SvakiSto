import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronsDownUp } from 'lucide-react';
import { db, type Station } from '../../db/db';
import ContextMenu, { type ContextMenuAction } from './ContextMenu';
import FileNode from './FileNode';

interface FileExplorerProps {
  onStationSelect: (station: Station) => void;
  selectedStationId?: number;
  searchQuery?: string;
  sortBy?: 'name' | 'date';
}

export default function FileExplorer({
  onStationSelect,
  selectedStationId,
  searchQuery = '',
  sortBy = 'name'
}: FileExplorerProps) {
  const { t } = useTranslation();

  // Data
  const rawClients = useLiveQuery(() => db.clients.toArray());
  const rawObjects = useLiveQuery(() => db.objects.toArray());
  const rawStations = useLiveQuery(() => db.stations.toArray());

  // State
  const [expandedClients, setExpandedClients] = useState<Set<number>>(new Set());
  const [expandedObjects, setExpandedObjects] = useState<Set<number>>(new Set());

  // Search & Filter Logic
  const { clients, objects, stations } = useMemo(() => {
    if (!rawClients || !rawObjects || !rawStations) {
      return { clients: [], objects: [], stations: [] };
    }

    let filteredClients = [...rawClients];
    let filteredObjects = [...rawObjects];
    let filteredStations = [...rawStations];

    const q = searchQuery.toLowerCase().trim();

    if (q) {
      // 1. Find matching stations
      const matchingStations = rawStations.filter(s => s.name.toLowerCase().includes(q) || s.anydeskId.includes(q));
      const matchStationObjIds = new Set(matchingStations.map(s => s.objectId));

      // 2. Find matching objects (by name OR by having matching stations)
      const matchingObjects = rawObjects.filter(o =>
        o.name.toLowerCase().includes(q) || matchStationObjIds.has(o.id)
      );
      const matchObjectIds = new Set(matchingObjects.map(o => o.id));
      const matchObjectClientIds = new Set(matchingObjects.map(o => o.clientId));

      // 3. Find matching clients (by name OR by having matching objects)
      const matchingClients = rawClients.filter(c =>
        c.name.toLowerCase().includes(q) || matchObjectClientIds.has(c.id)
      );
      const matchClientIds = new Set(matchingClients.map(c => c.id));

      // Filter the lists to only show relevant paths
      // Show station if it matches OR if its object matches (and we show all children of matched object? Maybe distinct logic)
      // Let's stick to "Show if match or parent matches"
      // Actually, usually "Search" filters down.
      // If I search "Roda", I want to see Client "Roda" and all its children.
      // If I search "Station1", I want to see Client -> Object -> Station1.

      filteredClients = matchingClients;

      filteredObjects = rawObjects.filter(o => matchObjectIds.has(o.id) || (matchClientIds.has(o.clientId) && rawClients.find(c => c.id === o.clientId)?.name.toLowerCase().includes(q)));
      // Logic refinement: 
      // If client matches name, show all its objects? Yes.
      // If object matches name, show all its stations? Yes.

      // Let's simplified set based approach:
      // Keep node IF (name matches) OR (descendant matches) OR (ancestor matches name)

      // To simplify for this artifact:
      // 1. Mark IDs that are "kept"
      const keptStationIds = new Set<number>();
      const keptObjectIds = new Set<number>();
      const keptClientIds = new Set<number>();

      // Bottom-up marking (Descendant matches)
      rawStations.forEach(s => {
        if (s.name.toLowerCase().includes(q) || s.anydeskId.includes(q)) {
          keptStationIds.add(s.id);
          keptObjectIds.add(s.objectId);
          const obj = rawObjects.find(o => o.id === s.objectId);
          if (obj) keptClientIds.add(obj.clientId);
        }
      });

      rawObjects.forEach(o => {
        if (o.name.toLowerCase().includes(q)) {
          keptObjectIds.add(o.id);
          keptClientIds.add(o.clientId);
          // And show all children?
          rawStations.filter(s => s.objectId === o.id).forEach(s => keptStationIds.add(s.id));
        }
      });

      rawClients.forEach(c => {
        if (c.name.toLowerCase().includes(q)) {
          keptClientIds.add(c.id);
          // Show all children
          rawObjects.filter(o => o.clientId === c.id).forEach(o => {
            keptObjectIds.add(o.id);
            rawStations.filter(s => s.objectId === o.id).forEach(s => keptStationIds.add(s.id));
          });
        }
      });

      filteredStations = rawStations.filter(s => keptStationIds.has(s.id));
      filteredObjects = rawObjects.filter(o => keptObjectIds.has(o.id));
      filteredClients = rawClients.filter(c => keptClientIds.has(c.id));
    }

    // Sort
    const sorter = (a: any, b: any) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    };

    filteredClients.sort(sorter);
    filteredObjects.sort(sorter);
    filteredStations.sort(sorter);

    return { clients: filteredClients, objects: filteredObjects, stations: filteredStations };
  }, [rawClients, rawObjects, rawStations, searchQuery, sortBy]);

  // Auto-expand on search
  useEffect(() => {
    if (searchQuery.trim() && clients && objects) {
      setExpandedClients(new Set(clients.map(c => c.id)));
      setExpandedObjects(new Set(objects.map(o => o.id)));
    }
  }, [searchQuery, clients, objects]);

  // Collapse All
  const collapseAll = () => {
    setExpandedClients(new Set());
    setExpandedObjects(new Set());
  };

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'root' | 'client' | 'object' | 'station';
    targetId?: number;
    hasPassword?: boolean;
  } | null>(null);

  // Background Click Handler for Root Context Menu
  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'root'
    });
  };

  // Node Context Menu Handler
  const handleNodeContextMenu = (e: React.MouseEvent, type: 'client' | 'object' | 'station', id: number, hasPassword?: boolean) => {
    // Prevent event bubbling to background
    // e.stopPropagation() is handled in FileNode, but good to be safe
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      targetId: id,
      hasPassword
    });
  };

  // Toggle Handlers
  const toggleClient = (id: number) => {
    const newSet = new Set(expandedClients);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedClients(newSet);
  };

  const toggleObject = (id: number) => {
    const newSet = new Set(expandedObjects);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedObjects(newSet);
  };

  // Input Modal State
  const [inputModal, setInputModal] = useState<{
    open: boolean;
    type: 'addClient' | 'addObject' | 'addStation' | 'edit';
    targetId?: number;
    itemType?: 'client' | 'object' | 'station'; // Add this to know what we are editing
    initialValue?: string;
    secondValue?: string;
  }>({ open: false, type: 'addClient' });

  const [inputValue, setInputValue] = useState('');
  const [secondInputValue, setSecondInputValue] = useState('');

  // Clean open handler
  const openInputModal = (type: typeof inputModal.type, targetId?: number, initialValue = '', secondValue = '', itemType?: 'client' | 'object' | 'station') => {
    setInputModal({ open: true, type, targetId, initialValue, secondValue, itemType });
    setInputValue(initialValue);
    setSecondInputValue(secondValue);
  };

  // Action Handlers
  const handleAction = async (action: ContextMenuAction) => {
    if (!contextMenu) return;
    const { type, targetId } = contextMenu;
    setContextMenu(null);

    switch (action) {
      case 'add':
        if (type === 'root') openInputModal('addClient');
        else if (type === 'client') openInputModal('addObject', targetId);
        else if (type === 'object') openInputModal('addStation', targetId);
        break;

      case 'edit':
        if (!targetId || type === 'root') return;
        let currentName = '';
        if (type === 'client') currentName = (await db.clients.get(targetId))?.name || '';
        else if (type === 'object') currentName = (await db.objects.get(targetId))?.name || '';
        else if (type === 'station') currentName = (await db.stations.get(targetId))?.name || '';

        // Pass 'type' as itemType so we know what table to update
        openInputModal('edit', targetId, currentName, '', type);
        break;

      case 'delete':
        if (!targetId || !confirm(t('confirmDelete'))) return;
        if (type === 'client') {
          const objs = await db.objects.where('clientId').equals(targetId).toArray();
          for (const o of objs) await db.stations.where('objectId').equals(o.id).delete();
          await db.objects.where('clientId').equals(targetId).delete();
          await db.clients.delete(targetId);
        } else if (type === 'object') {
          await db.stations.where('objectId').equals(targetId).delete();
          await db.objects.delete(targetId);
        } else if (type === 'station') {
          await db.stations.delete(targetId);
        }
        break;

      case 'launch':
        if (type === 'station' && targetId) {
          const station = await db.stations.get(targetId);
          if (station) {
            if (station.password) navigator.clipboard.writeText(station.password);
            window.location.href = `anydesk:${station.anydeskId} `;
            await db.stations.update(targetId, { lastUsed: new Date(), usageCount: (station.usageCount || 0) + 1 });
          }
        }
        break;

      case 'copyPassword':
        if (type === 'station' && targetId) {
          const station = await db.stations.get(targetId);
          if (station?.password) navigator.clipboard.writeText(station.password);
        }
        break;

      case 'move':
        if (targetId && (type === 'object' || type === 'station')) {
          setMoveTarget({ type, id: targetId });
          setMoveModalOpen(true);
        }
        break;
    }
  };

  const handleSaveInput = async () => {
    if (!inputValue.trim()) return;
    const { type, targetId, itemType } = inputModal;

    if (type === 'addClient') {
      await db.clients.add({ name: inputValue, createdAt: new Date() });
    } else if (type === 'addObject' && targetId) {
      await db.objects.add({ clientId: targetId, name: inputValue, createdAt: new Date() });
      setExpandedClients(prev => new Set(prev).add(targetId));
    } else if (type === 'addStation' && targetId) {
      if (!secondInputValue.trim()) return alert("AnyDesk ID is required");
      await db.stations.add({
        objectId: targetId,
        name: inputValue,
        anydeskId: secondInputValue,
        usageCount: 0,
        createdAt: new Date()
      });
      setExpandedObjects(prev => new Set(prev).add(targetId));
    } else if (type === 'edit' && targetId && itemType) {
      // Precise update based on itemType
      if (itemType === 'client') await db.clients.update(targetId, { name: inputValue });
      else if (itemType === 'object') await db.objects.update(targetId, { name: inputValue });
      else if (itemType === 'station') await db.stations.update(targetId, { name: inputValue });
    }

    setInputModal({ ...inputModal, open: false });
  };

  // Move Logic
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ type: 'object' | 'station', id: number } | null>(null);

  const executeMove = async (newParentId: number) => {
    if (!moveTarget) return;

    if (moveTarget.type === 'object') {
      // Move Object to Client
      await db.objects.update(moveTarget.id, { clientId: newParentId });
    } else if (moveTarget.type === 'station') {
      // Move Station to Object
      await db.stations.update(moveTarget.id, { objectId: newParentId });
    }
    setMoveModalOpen(false);
    setMoveTarget(null);
  };

  return (
    <div
      className="h-full flex flex-col"
      onContextMenu={handleBackgroundContextMenu}
    >
      {/* Sticky New Client Button */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 flex gap-2">
        <button
          onClick={() => openInputModal('addClient')}
          className="flex-1 flex items-center justify-center gap-2 bg-anydesk text-white px-4 py-2 rounded-xl hover:bg-anydesk-dark transition-colors shadow-lg shadow-anydesk/20 font-medium text-sm"
        >
          <Plus size={16} />
          {t('addClient')}
        </button>
        <button
          onClick={collapseAll}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={t('Collapse All')}
        >
          <ChevronsDownUp size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 select-none">
        {/* Root Context Menu Hint (Empty State) */}
        {clients?.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <p>{t('Right-click to add Client')}</p>
          </div>
        )}

        {/* Tree Rendering */}
        <div className="space-y-1">
          {clients?.map(client => (
            <React.Fragment key={`c - ${client.id} `}>
              <FileNode
                item={client}
                type="client"
                level={0}
                isExpanded={expandedClients.has(client.id)}
                onToggle={() => toggleClient(client.id)}
                onContextMenu={(e) => handleNodeContextMenu(e, 'client', client.id)}
              />

              {/* Objects Level */}
              {expandedClients.has(client.id) && objects?.filter(o => o.clientId === client.id).map(obj => (
                <React.Fragment key={`o - ${obj.id} `}>
                  <FileNode
                    item={obj}
                    type="object"
                    level={1}
                    isExpanded={expandedObjects.has(obj.id)}
                    onToggle={() => toggleObject(obj.id)}
                    onContextMenu={(e) => handleNodeContextMenu(e, 'object', obj.id)}
                  />

                  {/* Stations Level */}
                  {expandedObjects.has(obj.id) && stations?.filter(s => s.objectId === obj.id).map(station => (
                    <FileNode
                      key={`s - ${station.id} `}
                      item={station}
                      type="station"
                      level={2}
                      isSelected={selectedStationId === station.id}
                      onSelect={() => onStationSelect(station)}
                      onContextMenu={(e) => handleNodeContextMenu(e, 'station', station.id, !!station.password)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            type={contextMenu.type}
            hasPassword={contextMenu.hasPassword}
            onAction={handleAction}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Move Modal */}
        {moveModalOpen && moveTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">{t('Select Destination')}</h3>
              <div className="max-h-60 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl mb-4">
                {moveTarget.type === 'object' && clients?.map(c => (
                  <button
                    key={c.id}
                    onClick={() => executeMove(c.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-sm truncate"
                  >
                    {c.name}
                  </button>
                ))}
                {moveTarget.type === 'station' && objects?.map(o => (
                  <button
                    key={o.id}
                    onClick={() => executeMove(o.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-sm truncate"
                  >
                    {o.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setMoveModalOpen(false)} className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50">{t('cancel')}</button>
            </div>
          </div>
        )}

        {/* Input/Add/Edit Modal */}
        {inputModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">
                {inputModal.type === 'addClient' && t('addClient')}
                {inputModal.type === 'addObject' && t('addObject')}
                {inputModal.type === 'addStation' && t('addStation')}
                {inputModal.type === 'edit' && t('edit')}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">{t('name')}</label>
                  <input
                    autoFocus
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveInput()}
                  />
                </div>

                {/* Extra fields for Station */}
                {inputModal.type === 'addStation' && (
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">{t('anydeskId')}</label>
                    <input
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none"
                      value={secondInputValue}
                      onChange={e => setSecondInputValue(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setInputModal({ ...inputModal, open: false })} className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">{t('cancel')}</button>
                <button onClick={handleSaveInput} className="flex-1 py-2 rounded-xl bg-anydesk text-white hover:bg-anydesk-dark">{t('save')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

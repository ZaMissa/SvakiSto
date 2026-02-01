import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronsDownUp } from 'lucide-react';
import { db, type Station } from '../../db/db';
import ContextMenu, { type ContextMenuAction } from './ContextMenu';
import FileNode from './FileNode';
import MoveModal from './MoveModal';

interface FileExplorerProps {
  onStationSelect: (station: Station) => void;
  selectedStationId?: number;
  searchQuery?: string;
  sortBy?: 'name' | 'date';
  filterGroupId?: number | null;
}

export default function FileExplorer({
  onStationSelect,
  selectedStationId,
  searchQuery = '',
  sortBy = 'name',
  filterGroupId = null
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

    // 0. Filter by Group (Top Level)
    let filteredClients = rawClients;
    if (filterGroupId === -1) {
      filteredClients = filteredClients.filter(c => !c.groupId);
    } else if (filterGroupId !== null) {
      filteredClients = filteredClients.filter(c => c.groupId === filterGroupId);
    }

    // Clone arrays for subsequent filtering
    filteredClients = [...filteredClients];
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
      const matchObjectClientIds = new Set(matchingObjects.map(o => o.clientId));

      // 3. Find matching clients (by name OR by having matching objects)
      const matchingClients = filteredClients.filter(c => // use filteredClients here
        c.name.toLowerCase().includes(q) || matchObjectClientIds.has(c.id)
      );

      filteredClients = matchingClients;

      const keptStationIds = new Set<number>();
      const keptObjectIds = new Set<number>();
      const keptClientIds = new Set<number>();

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
          rawStations.filter(s => s.objectId === o.id).forEach(s => keptStationIds.add(s.id));
        }
      });

      filteredClients.forEach(c => {
        if (c.name.toLowerCase().includes(q)) {
          keptClientIds.add(c.id);
          rawObjects.filter(o => o.clientId === c.id).forEach(o => {
            keptObjectIds.add(o.id);
            rawStations.filter(s => s.objectId === o.id).forEach(s => keptStationIds.add(s.id));
          });
        }
      });

      // Ensure we keep all clients that passed the initial matching logic (which includes clients with matching descendants)
      matchingClients.forEach(c => keptClientIds.add(c.id));

      filteredStations = rawStations.filter(s => keptStationIds.has(s.id));
      filteredObjects = rawObjects.filter(o => keptObjectIds.has(o.id));
      filteredClients = filteredClients.filter(c => keptClientIds.has(c.id));
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
  }, [rawClients, rawObjects, rawStations, searchQuery, sortBy, filterGroupId]);

  // Auto-expand on search
  // Auto-expand on search
  useEffect(() => {
    if (searchQuery.trim() && stations && objects) {
      // Logic: Only expand if a *descendant* matches.
      // 1. If a Station matches, expand its Object.
      // 2. If an Object matches (or is expanded due to station), expand its Client.

      const newExpandedObjects = new Set<number>();
      const newExpandedClients = new Set<number>();

      // Find objects that contain matching stations
      stations.forEach(s => {
        if (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.anydeskId.includes(searchQuery)) {
          newExpandedObjects.add(s.objectId);
        }
      });

      // Find clients that contain objects that are either matched themselves OR contain matching stations
      objects.forEach(o => {
        const objectMatchesName = o.name.toLowerCase().includes(searchQuery.toLowerCase());
        const objectHasMatchingStation = newExpandedObjects.has(o.id);

        if (objectMatchesName || objectHasMatchingStation) {
          // If object matches strictly by name, we prefer NOT to expand it (user request: "appear collapsed").
          // But we MUST expand the Client to show this Object.
          newExpandedClients.add(o.clientId);
        }
      });

      // Override: If strict minimal expansion is requested:
      // "appear collapsed when presenting objects or clients" -> 
      // This implies: If I search "Client A", show Client A collapsed.
      // If I search "Object B", show Client A expanded, Object B collapsed.
      // If I search "Station C", show Client A expanded, Object B expanded.

      setExpandedObjects(newExpandedObjects);
      setExpandedClients(newExpandedClients);
    }
  }, [searchQuery, stations, objects]);

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
    itemType?: 'client' | 'object' | 'station';
    initialValue?: string;
    secondValue?: string;
  }>({ open: false, type: 'addClient' });

  const [inputValue, setInputValue] = useState('');
  const [secondInputValue, setSecondInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  const groups = useLiveQuery(() => db.groups.toArray());
  const [selectedGroupValue, setSelectedGroupValue] = useState<number | undefined>(undefined);

  // Clean open handler
  const openInputModal = (type: typeof inputModal.type, targetId?: number, initialValue = '', secondValue = '', itemType?: 'client' | 'object' | 'station', initialPassword = '', initialGroupId?: number) => {
    setInputModal({ open: true, type, targetId, initialValue, secondValue, itemType });
    setInputValue(initialValue);
    setSecondInputValue(secondValue);
    setPasswordValue(initialPassword);
    setSelectedGroupValue(initialGroupId);
  };

  // Action Handlers
  const handleAction = async (action: ContextMenuAction) => {
    if (!contextMenu) return;
    const { type, targetId } = contextMenu;
    setContextMenu(null);

    switch (action) {
      case 'add':
        if (type === 'root') openInputModal('addClient', undefined, '', '', undefined, '', filterGroupId || undefined);
        else if (type === 'client') openInputModal('addObject', targetId);
        else if (type === 'object') openInputModal('addStation', targetId);
        break;

      case 'edit':
        if (!targetId || type === 'root') return;
        let currentName = '';
        let currentSecond = '';
        let currentPassword = '';
        let currentGroupId: number | undefined;

        if (type === 'client') {
          const c = await db.clients.get(targetId);
          currentName = c?.name || '';
          currentGroupId = c?.groupId;
        }
        else if (type === 'object') currentName = (await db.objects.get(targetId))?.name || '';
        else if (type === 'station') {
          const s = await db.stations.get(targetId);
          currentName = s?.name || '';
          currentSecond = s?.anydeskId || '';
          currentPassword = s?.password || '';
        }

        // Pass 'type' as itemType so we know what table to update
        openInputModal('edit', targetId, currentName, currentSecond, type, currentPassword, currentGroupId);
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
            window.location.href = `anydesk:${station.anydeskId}`;
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
      await db.clients.add({
        name: inputValue,
        groupId: selectedGroupValue,
        createdAt: new Date()
      });
    } else if (type === 'addObject' && targetId) {
      await db.objects.add({ clientId: targetId, name: inputValue, createdAt: new Date() });
      setExpandedClients(prev => new Set(prev).add(targetId));
    } else if (type === 'addStation' && targetId) {
      if (!secondInputValue.trim()) return alert("AnyDesk ID is required");
      await db.stations.add({
        objectId: targetId,
        name: inputValue,
        anydeskId: secondInputValue,
        password: passwordValue,
        usageCount: 0,
        createdAt: new Date()
      });
      setExpandedObjects(prev => new Set(prev).add(targetId));
    } else if (type === 'edit' && targetId && itemType) {
      if (itemType === 'client') await db.clients.update(targetId, { name: inputValue, groupId: selectedGroupValue });
      else if (itemType === 'object') await db.objects.update(targetId, { name: inputValue });
      else if (itemType === 'station') await db.stations.update(targetId, { name: inputValue, anydeskId: secondInputValue, password: passwordValue });
    }

    setInputModal({ ...inputModal, open: false });
  };

  // Bulk Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Toggle Selection
  const toggleSelection = (type: 'client' | 'object' | 'station', id: number) => {
    const key = `${type}-${id}`;
    const newSet = new Set(selectedIds);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (!confirm(t('Are you sure you want to delete selected items?'))) return;

    // Process deletions
    const toDelete = Array.from(selectedIds).map(str => {
      const [type, idStr] = str.split('-');
      return { type: type as 'client' | 'object' | 'station', id: parseInt(idStr) };
    });

    // Delete stations first, then objects, then clients to prevent orphans (or just handle standard deletion)
    // Actually, simple sequential delete works if we handle dependencies.

    for (const item of toDelete) {
      if (item.type === 'station') await db.stations.delete(item.id);
      if (item.type === 'object') {
        await db.stations.where('objectId').equals(item.id).delete();
        await db.objects.delete(item.id);
      }
      if (item.type === 'client') {
        const objs = await db.objects.where('clientId').equals(item.id).toArray();
        for (const o of objs) await db.stations.where('objectId').equals(o.id).delete();
        await db.objects.where('clientId').equals(item.id).delete();
        await db.clients.delete(item.id);
      }
    }

    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const [bulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);

  // Re-use single move logic for bulk?
  // We need a bulk move executor.
  const executeBulkMove = async (newParentId: number) => {
    const toMove = Array.from(selectedIds).map(str => {
      const [type, idStr] = str.split('-');
      return { type: type as 'client' | 'object' | 'station', id: parseInt(idStr) };
    });

    for (const item of toMove) {
      if (item.type === 'object') await db.objects.update(item.id, { clientId: newParentId });
      if (item.type === 'station') await db.stations.update(item.id, { objectId: newParentId });
    }

    setBulkMoveModalOpen(false);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  // Move Logic
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ type: 'object' | 'station', id: number } | null>(null);

  const executeMove = async (newParentId: number) => {
    if (bulkMoveModalOpen) {
      await executeBulkMove(newParentId);
      return;
    }

    if (!moveTarget) return;

    if (moveTarget.type === 'object') {
      await db.objects.update(moveTarget.id, { clientId: newParentId });
    } else if (moveTarget.type === 'station') {
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
      {/* Sticky Toolbar */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 flex gap-2">
        {isSelectionMode ? (
          <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedIds(new Set());
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium text-sm"
            >
              {t('cancel')}
            </button>
            <div className="flex-1 text-center flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200">
              {selectedIds.size} {t('Selected')}
            </div>
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => {
                    // Determine if we can move (must be objects or stations)
                    // Mixed types are tricky. Let's say we only support moving Objects OR Stations, not clients.
                    // Or handle mix. MoveModal expects clients or objects as destination.
                    // For simplicity, let's open MoveModal and let it handle?
                    // But MoveModal currently takes raw Clients/Objects as targets. 
                    // We need to know what we are moving to filter destinations.

                    // Heuristic: If we are moving Stations, we show Objects as targets.
                    // If moving Objects, we show Clients.
                    // If mixed... we probably disable move or show Clients (and re-parent objects) but stations?

                    const types = Array.from(selectedIds).map(s => s.split('-')[0]);
                    if (types.includes('client')) {
                      alert(t("Cannot move Clients"));
                      return;
                    }

                    // If we have stations, we can move to Object.
                    // If we have Objects, we move to Client.
                    // If mixed... it's messy.
                    // Lets assume user selects same type or we warn.

                    const hasStations = types.includes('station');
                    const hasObjects = types.includes('object');

                    if (hasStations && hasObjects) {
                      alert(t("Please select only Objects OR Stations to move"));
                      return;
                    }

                    // Hack: Set a dummy 'moveTarget' to trigger the right list in MoveModal
                    if (hasStations) setMoveTarget({ type: 'station', id: -1 });
                    else setMoveTarget({ type: 'object', id: -1 });

                    setBulkMoveModalOpen(true);
                    setMoveModalOpen(true);
                  }}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium text-sm"
                >
                  {t('Move')}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-xl font-medium text-sm"
                >
                  {t('Delete')}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => openInputModal('addClient', undefined, '', '', undefined, '', filterGroupId || undefined)}
              className="flex-1 flex items-center justify-center gap-2 bg-anydesk text-white px-4 py-2 rounded-xl hover:bg-anydesk-dark transition-colors shadow-lg shadow-anydesk/20 font-medium text-sm"
            >
              <Plus size={16} />
              {t('addClient')}
            </button>
            <button
              onClick={() => setIsSelectionMode(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              {t('Select')}
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={t('Collapse All')}
            >
              <ChevronsDownUp size={18} />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 select-none pb-20"> {/* Extra padding for footer/mobile */}
        {clients?.length === 0 && (
          <div className="text-center text-slate-400 mt-10 p-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus size={24} className="opacity-50" />
            </div>
            <p>{filterGroupId ? t('No clients in this group') : t('No clients yet')}</p>
            <button
              onClick={() => openInputModal('addClient', undefined, '', '', undefined, '', filterGroupId || undefined)}
              className="mt-2 text-anydesk font-medium hover:underline text-sm"
            >
              {t('Create new Client')}
            </button>
          </div>
        )}

        <div className="space-y-1">
          {clients?.map(client => {
            const clientObjects = objects?.filter(o => o.clientId === client.id) || [];
            return (
              <React.Fragment key={`c - ${client.id} `}>
                <FileNode
                  item={client}
                  type="client"
                  level={0}
                  isExpanded={expandedClients.has(client.id)}
                  onToggle={() => toggleClient(client.id)}
                  onContextMenu={(e) => handleNodeContextMenu(e, 'client', client.id)}
                  isSelectionMode={isSelectionMode}
                  isChecked={selectedIds.has(`client-${client.id}`)}
                  onCheck={() => toggleSelection('client', client.id)}
                />

                {expandedClients.has(client.id) && (
                  <>
                    {clientObjects.map(obj => {
                      const objStations = stations?.filter(s => s.objectId === obj.id) || [];
                      return (
                        <React.Fragment key={`o - ${obj.id} `}>
                          <FileNode
                            item={obj}
                            type="object"
                            level={1}
                            isExpanded={expandedObjects.has(obj.id)}
                            onToggle={() => toggleObject(obj.id)}
                            onContextMenu={(e) => handleNodeContextMenu(e, 'object', obj.id)}
                            isSelectionMode={isSelectionMode}
                            isChecked={selectedIds.has(`object-${obj.id}`)}
                            onCheck={() => toggleSelection('object', obj.id)}
                          />

                          {expandedObjects.has(obj.id) && (
                            <>
                              {objStations.map(station => (
                                <FileNode
                                  key={`s - ${station.id} `}
                                  item={station}
                                  type="station"
                                  level={2}
                                  isSelected={selectedStationId === station.id}
                                  onSelect={() => onStationSelect(station)}
                                  onContextMenu={(e) => handleNodeContextMenu(e, 'station', station.id, !!station.password)}
                                  isSelectionMode={isSelectionMode}
                                  isChecked={selectedIds.has(`station-${station.id}`)}
                                  onCheck={() => toggleSelection('station', station.id)}
                                />
                              ))}
                              {!isSelectionMode && objStations.length === 0 && (
                                <div className="pl-12 py-1">
                                  <button
                                    onClick={() => openInputModal('addStation', obj.id)}
                                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-anydesk transition-colors px-2 py-1 rounded-lg hover:bg-anydesk/5 border border-dashed border-slate-300 dark:border-slate-700 w-full"
                                  >
                                    <Plus size={12} />
                                    {t('addStation')}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {!isSelectionMode && clientObjects.length === 0 && (
                      <div className="pl-8 py-1">
                        <button
                          onClick={() => openInputModal('addObject', client.id)}
                          className="text-xs flex items-center gap-1 text-slate-400 hover:text-anydesk transition-colors px-2 py-1 rounded-lg hover:bg-anydesk/5 border border-dashed border-slate-300 dark:border-slate-700 w-full"
                        >
                          <Plus size={12} />
                          {t('addObject')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
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

        <MoveModal
          isOpen={moveModalOpen}
          onClose={() => {
            setMoveModalOpen(false);
            if (bulkMoveModalOpen) setBulkMoveModalOpen(false);
          }}
          moveTarget={bulkMoveModalOpen && moveTarget ? moveTarget : moveTarget}
          clients={rawClients}
          objects={rawObjects}
          onExecuteMove={executeMove}
        />

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

                {(inputModal.type === 'addClient' || (inputModal.type === 'edit' && inputModal.itemType === 'client')) && (
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">{t('Group (Optional)')}</label>
                    <select
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none appearance-none"
                      value={selectedGroupValue || ''}
                      onChange={e => setSelectedGroupValue(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">{t('No Group')}</option>
                      {groups?.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(inputModal.type === 'addStation' || (inputModal.type === 'edit' && inputModal.itemType === 'station')) && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">{t('anydeskId')}</label>
                      <input
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none font-mono"
                        value={secondInputValue}
                        onChange={e => setSecondInputValue(e.target.value)}
                        placeholder="123 456 789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">{t('password')} ({t('optional')})</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none font-mono"
                        value={passwordValue}
                        onChange={e => setPasswordValue(e.target.value)}
                        placeholder="Secret123"
                      />
                    </div>
                  </>
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

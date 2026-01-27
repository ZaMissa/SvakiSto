import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db, type Station } from '../../db/db';
import ContextMenu, { type ContextMenuAction } from './ContextMenu';
import FileNode from './FileNode';

interface FileExplorerProps {
  onStationSelect: (station: Station) => void;
  selectedStationId?: number;
}

export default function FileExplorer({ onStationSelect, selectedStationId }: FileExplorerProps) {
  const { t } = useTranslation();

  // Data
  const clients = useLiveQuery(() => db.clients.toArray());
  const objects = useLiveQuery(() => db.objects.toArray());
  const stations = useLiveQuery(() => db.stations.toArray());

  // State
  const [expandedClients, setExpandedClients] = useState<Set<number>>(new Set());
  const [expandedObjects, setExpandedObjects] = useState<Set<number>>(new Set());

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

  // Action Handlers
  const handleAction = async (action: ContextMenuAction) => {
    if (!contextMenu) return;
    const { type, targetId } = contextMenu;
    setContextMenu(null); // Close menu immediately

    switch (action) {
      case 'add':
        if (type === 'root') {
          const name = prompt(t('Enter client name:'));
          if (name) await db.clients.add({ name, createdAt: new Date() });
        } else if (type === 'client' && targetId) {
          const name = prompt(t('Enter object name:'));
          if (name) await db.objects.add({ clientId: targetId, name, createdAt: new Date() });
          setExpandedClients(prev => new Set(prev).add(targetId)); // Auto expand
        } else if (type === 'object' && targetId) {
          // For stations, ideally we use a modal form, but for quick start:
          const name = prompt(t('Enter station name:'));
          if (name) {
            const anydeskId = prompt(t('Enter AnyDesk ID:'));
            if (anydeskId) {
              await db.stations.add({
                objectId: targetId,
                name,
                anydeskId,
                usageCount: 0,
                createdAt: new Date()
              });
              setExpandedObjects(prev => new Set(prev).add(targetId)); // Auto expand
            }
          }
        }
        break;

      case 'edit':
        if (!targetId) return;
        const newName = prompt(t('Enter new name:'));
        if (newName) {
          if (type === 'client') await db.clients.update(targetId, { name: newName });
          if (type === 'object') await db.objects.update(targetId, { name: newName });
          if (type === 'station') await db.stations.update(targetId, { name: newName });
        }
        break;

      case 'delete':
        if (!targetId || !confirm(t('confirmDelete'))) return;
        if (type === 'client') {
          // Manual Cascade
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
            if (station.password) {
              navigator.clipboard.writeText(station.password);
              // We could show a toast here if we had a global toast context, 
              // for now we rely on the user knowing flow or add simple alert
            }
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
    }
  };

  return (
    <div
      className="h-full overflow-y-auto p-4 select-none"
      onContextMenu={handleBackgroundContextMenu}
    >
      {/* Root Context Menu Hint (Empty State) */}
      {clients?.length === 0 && (
        <div className="text-center text-slate-400 mt-10">
          <p>{t('Right-click to add Client')}</p>
        </div>
      )}

      {/* Tree Rendering */}
      <div className="space-y-1">
        {clients?.map(client => (
          <React.Fragment key={`c-${client.id}`}>
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
              <React.Fragment key={`o-${obj.id}`}>
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
                    key={`s-${station.id}`}
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
    </div>
  );
}

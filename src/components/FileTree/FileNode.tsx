import React from 'react';
import { ChevronRight, ChevronDown, Folder, Monitor, MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import { type Client, type ClientObject, type Station } from '../../db/db';

interface FileNodeProps {
  item: Client | ClientObject | Station;
  type: 'client' | 'object' | 'station';
  isExpanded?: boolean;
  isSelected?: boolean;
  level: number;
  onToggle?: () => void;
  onSelect?: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function FileNode({
  item,
  type,
  isExpanded,
  isSelected,
  level,
  onToggle,
  onSelect,
  onContextMenu
}: FileNodeProps) {

  const Icon = type === 'client' ? Folder : type === 'object' ? Monitor : Monitor; // Using Monitor for both Obj and Station for now, can differentiate
  const isLeaf = type === 'station';

  return (
    <div
      className={clsx(
        "flex items-center gap-2 py-2 px-2 cursor-pointer select-none transition-colors rounded-lg",
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
      )}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isLeaf && onToggle) onToggle();
        if (onSelect) onSelect();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e);
      }}
    >
      {/* Expander Icon */}
      {!isLeaf && (
        <span className="text-slate-400">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
      {isLeaf && <div className="w-4" />} {/* Spacer for leaf nodes */}

      {/* Type Icon */}
      <div className={clsx(
        "w-5 h-5 flex items-center justify-center rounded",
        type === 'client' && "text-blue-500",
        type === 'object' && "text-indigo-500",
        type === 'station' && (isSelected ? "text-anydesk" : "text-slate-500")
      )}>
        {type === 'station' ? (
          <div className="relative">
            <Monitor size={18} />
            {/* @ts-expect-error - checking for password existence dynamically */}
            {item.password && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-slate-900" />}
          </div>
        ) : (
          <Icon size={18} />
        )}
      </div>

      <span className="truncate flex-1 font-medium text-sm">{item.name}</span>

      {/* Mobile/Touch Context Trigger */}
      <button
        className="md:hidden p-1 text-slate-400"
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e);
        }}
      >
        <MoreVertical size={16} />
      </button>

    </div>
  );
}

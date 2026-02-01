import React from 'react';
import { ChevronRight, Folder, Monitor, MoreVertical } from 'lucide-react';
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

  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isExpanded && elementRef.current) {
      setTimeout(() => {
        // 'nearest' avoids jumping the whole list if it's already visible, 
        // preventing the "hide top part" issue.
        elementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [isExpanded]);

  const Icon = type === 'client' ? Folder : type === 'object' ? Monitor : Monitor; // Using Monitor for both Obj and Station for now, can differentiate
  const isLeaf = type === 'station';

  return (
    <div
      ref={elementRef}
      className={clsx(
        "flex items-center gap-2 py-2 px-2 cursor-pointer select-none transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800", // Basic layout + borders
        isSelected && "bg-anydesk/10 dark:bg-anydesk/20 text-anydesk", // Selected state
        !isSelected && type === 'client' && "bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-100", // Client row
        !isSelected && type === 'object' && "bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300", // Object row
        !isSelected && type === 'station' && "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400" // Station row
      )}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
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
        <span className={clsx("text-slate-400 transition-transform", isExpanded && "rotate-90")}>
          <ChevronRight size={16} />
        </span>
      )}
      {isLeaf && <div className="w-4" />}

      {/* Type Icon */}
      <div className={clsx(
        "w-5 h-5 flex items-center justify-center rounded shrink-0",
        type === 'client' && "text-anydesk",
        type === 'object' && "text-slate-500 dark:text-slate-400",
        type === 'station' && (isSelected ? "text-anydesk" : "text-slate-400")
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

      <span className="truncate flex-1 text-sm">{item.name}</span>

      {/* Mobile/Touch Context Trigger */}
      <button
        className="md:hidden p-2 text-slate-400 active:text-slate-600"
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

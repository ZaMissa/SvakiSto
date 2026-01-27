import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Plus, MonitorPlay, Key } from 'lucide-react';

export type ContextMenuAction = 'add' | 'edit' | 'delete' | 'launch' | 'copyPassword';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'root' | 'client' | 'object' | 'station';
  onAction: (action: ContextMenuAction) => void;
  onClose: () => void;
  hasPassword?: boolean;
}

export default function ContextMenu({ x, y, type, onAction, onClose, hasPassword }: ContextMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', (e) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        onClose();
      }
    });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', onClose);
    };
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${y}px`,
    left: `${x}px`,
  };

  // Simple viewport adjustment logic
  if (menuRef.current) {
    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x + rect.width > viewportWidth) {
      menuStyle.left = `${x - rect.width}px`;
    }
    if (y + rect.height > viewportHeight) {
      menuStyle.top = `${y - rect.height}px`;
    }
  }

  // Effect to re-measure after render (for accurate rect)
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newLeft = x;
      let newTop = y;

      if (x + rect.width > viewportWidth) {
        newLeft = x - rect.width;
      }
      if (y + rect.height > viewportHeight) {
        newTop = y - rect.height;
      }

      // Ensure strictly non-negative
      if (newLeft < 0) newLeft = 10;
      if (newTop < 0) newTop = 10;

      menuRef.current.style.left = `${newLeft}px`;
      menuRef.current.style.top = `${newTop}px`;
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x, opacity: 0 }} // Start invisible, fade in via animation class but position via effect
      onClick={(e) => e.stopPropagation()}
    >
      {(type === 'root' || type === 'client' || type === 'object') && (
        <button
          onClick={() => onAction('add')}
          className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
        >
          <Plus size={16} />
          {t('add')}
        </button>
      )}

      {type === 'station' && (
        <button
          onClick={() => onAction('launch')}
          className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
        >
          <MonitorPlay size={16} />
          {t('launch')}
        </button>
      )}

      {type === 'station' && hasPassword && (
        <button
          onClick={() => onAction('copyPassword')}
          className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
        >
          <Key size={16} />
          {t('copyPassword')}
        </button>
      )}

      {type !== 'root' && (
        <>
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 font-bold" />
          <button
            onClick={() => onAction('edit')}
            className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
          >
            <Edit2 size={16} />
            {t('edit')}
          </button>
          <button
            onClick={() => onAction('delete')}
            className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 text-sm"
          >
            <Trash2 size={16} />
            {t('delete')}
          </button>
        </>
      )}
    </div>
  );
}

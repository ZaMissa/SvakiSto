import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { type Station } from '../db/db';
import StationActionPanel from './StationActionPanel';

interface StationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station | null;
}

export default function StationDrawer({ isOpen, onClose, station }: StationDrawerProps) {
  if (!isOpen || !station) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl pointer-events-auto p-6 flex flex-col animate-in slide-in-from-right duration-300 relative border-l border-white/10 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="mt-8">
          <StationActionPanel station={station} onClose={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}

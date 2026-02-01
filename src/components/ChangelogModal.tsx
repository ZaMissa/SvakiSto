import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles } from 'lucide-react';
import { APP_VERSION } from '../version';

interface ReleaseNotes {
  version: string;
  notes: {
    en: string[];
    sr: string[];
  };
}

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string; // Optional override
}

export default function ChangelogModal({ isOpen, onClose, title }: ChangelogModalProps) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<ReleaseNotes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/version.json')
        .then(res => res.json())
        .then((json: ReleaseNotes) => {
          setData(json);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch changelog", err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLang = i18n.language === 'sr' ? 'sr' : 'en';
  const notes = data?.notes[currentLang] || data?.notes['en'] || [];
  const displayVersion = data?.version || APP_VERSION;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl relative border border-white/10 flex flex-col max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
            <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {title || t('What\'s New')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            v{displayVersion}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[100px] bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 mb-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 space-x-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <ul className="space-y-3">
              {notes.map((note, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="text-blue-500 mt-1.5 shrink-0">•</span>
                  <span>{note}</span>
                </li>
              ))}
              {!data && <li className="text-slate-400 italic text-center">{t('No release notes available.')}</li>}
            </ul>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95"
        >
          {t('Awesome!')}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, History, ChevronRight, ChevronDown } from 'lucide-react';
import { APP_VERSION } from '../version';

interface ReleaseNoteItem {
  version: string;
  date?: string;
  notes: {
    en: string[];
    sr: string[];
  };
}

interface VersionData {
  latest: string;
  history: ReleaseNoteItem[];
}

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function ChangelogModal({ isOpen, onClose, title }: ChangelogModalProps) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  // Toggle expand/collapse
  const toggleVersion = (v: string) => {
    const newSet = new Set(expandedVersions);
    if (newSet.has(v)) newSet.delete(v);
    else newSet.add(v);
    setExpandedVersions(newSet);
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Add timestamp to bust cache
      fetch(`/version.json?t=${Date.now()}`)
        .then(res => res.json())
        .then((json: VersionData) => {
          setData(json);
          setLoading(false);
          // Auto-expand the latest version or current app version
          if (json.history && json.history.length > 0) {
            setExpandedVersions(new Set([json.history[0].version]));
          }
        })
        .catch(err => {
          console.error("Failed to fetch changelog", err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLang = i18n.language === 'sr' ? 'sr' : 'en';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative border border-white/10 flex flex-col max-h-[85vh]">
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
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('version')}: {APP_VERSION}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px] pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 space-x-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div className="space-y-4">
              {data?.history?.map((release, idx) => {
                const isExpanded = expandedVersions.has(release.version);
                const releaseNotes = release.notes[currentLang] || release.notes['en'] || [];
                const isLatest = idx === 0;

                return (
                  <div key={release.version} className={`border rounded-xl transition-colors ${isExpanded ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    <button
                      onClick={() => toggleVersion(release.version)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isLatest ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          <History size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            v{release.version}
                            {isLatest && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold uppercase tracking-wide">Latest</span>}
                          </div>
                          <div className="text-xs text-slate-400">{release.date || 'Unknown Date'}</div>
                        </div>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="h-px w-full bg-slate-200 dark:bg-slate-700 mb-3" />
                        <ul className="space-y-2">
                          {releaseNotes.map((note, nIdx) => (
                            <li key={nIdx} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <span className="text-blue-400 mt-1.5 shrink-0 text-[10px]">●</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}

              {!data && <div className="text-slate-400 italic text-center py-10">{t('No release notes available.')}</div>}
            </div>
          )}
        </div>

        <div className="pt-6 mt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

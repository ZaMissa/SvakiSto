import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../version';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-4 px-6 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-xs text-slate-400 dark:text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        <span>&copy; {year} SvakiSto Manager</span>
        <span className="hidden md:inline">•</span>
        <span>{t('version')} {APP_VERSION}</span>
      </div>

      <div className="flex items-center gap-1">
        <span>{t('developedBy')}</span>
        <a
          href="https://dekic.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-600 dark:text-slate-400 hover:text-anydesk transition-colors"
        >
          DekicTech
        </a>
      </div>
    </footer>
  );
}

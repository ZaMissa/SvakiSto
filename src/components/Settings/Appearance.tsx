import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AppearanceProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export const Appearance: React.FC<AppearanceProps> = ({ theme, setTheme }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <section className="glass-card p-6 rounded-2xl space-y-6">
      <h2 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-700 pb-2">{t('Appearance')}</h2>

      {/* Theme Switcher */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
          <span className="font-medium">{t('theme')}</span>
        </span>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-600 shadow text-anydesk' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-600 shadow text-anydesk' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-600 shadow text-anydesk' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            {t('System')}
          </button>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span className="text-xl font-serif">Aa</span>
          <span className="font-medium">{t('language')}</span>
        </span>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${i18n.language === 'en' ? 'bg-white dark:bg-slate-600 shadow text-anydesk' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('sr')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${i18n.language === 'sr' ? 'bg-white dark:bg-slate-600 shadow text-anydesk' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Srpski
          </button>
        </div>
      </div>
    </section>
  );
};

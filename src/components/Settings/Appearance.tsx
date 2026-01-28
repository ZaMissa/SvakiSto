import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AppearanceProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export const Appearance: React.FC<AppearanceProps> = ({ theme, setTheme }) => {
  const { t, i18n } = useTranslation();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'sr' : 'en';
    await i18n.changeLanguage(newLang);
  };

  return (
    <section className="glass-card p-6 rounded-2xl space-y-4">
      <h2 className="font-semibold text-lg border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">{t('Appearance')}</h2>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          {t('theme')}
        </span>
        <button onClick={toggleTheme} className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg font-medium capitalize">
          {theme === 'light' ? 'Light' : 'Dark'} Mode
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="text-xl">Aa</span>
          {t('language')}
        </span>
        <button onClick={toggleLanguage} className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg font-medium uppercase">
          {i18n.language}
        </button>
      </div>
    </section>
  );
};

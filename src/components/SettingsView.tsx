import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePWA } from '../hooks/usePWA';
import { Appearance } from './Settings/Appearance';
import { DataManagement } from './Settings/DataManagement';
import { UpdateManager } from './Settings/UpdateManager';

const APP_VERSION = "1.1.0";

export default function Settings() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Use extracted hook
  const pwa = usePWA(APP_VERSION);

  useEffect(() => {
    // Theme application - direct DOM manipulation
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Pass SetTheme to Appearance
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>

      <UpdateManager pwa={pwa} />
      <Appearance theme={theme} setTheme={handleSetTheme} />
      <DataManagement appVersion={APP_VERSION} />
    </div>
  );
}

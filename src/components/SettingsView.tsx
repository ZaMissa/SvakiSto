import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Appearance } from './Settings/Appearance';
import { DataManagement } from './Settings/DataManagement';
import { UpdateManager } from './Settings/UpdateManager';

import { APP_VERSION } from '../version';

export default function Settings() {
  const { t } = useTranslation();
  // Theme State: 'light' | 'dark' | 'system'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = document.documentElement;
    const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System
        if (systemQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // Listen for system changes ONLY if theme is 'system'
    if (theme === 'system') {
      systemQuery.addEventListener('change', applyTheme);
      return () => systemQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  // Pass SetTheme to Appearance
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>

      <UpdateManager appVersion={APP_VERSION} />
      <Appearance theme={theme} setTheme={handleSetTheme} />
      <DataManagement appVersion={APP_VERSION} />
    </div>
  );
}

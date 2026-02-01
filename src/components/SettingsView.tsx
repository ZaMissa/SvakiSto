import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

import { Appearance } from './Settings/Appearance';
import { DataManagement } from './Settings/DataManagement';
import { UpdateManager } from './Settings/UpdateManager';

import { APP_VERSION } from '../version';

export default function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  // Pass SetTheme to Appearance
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme as any);
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

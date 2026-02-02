import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Database,
  Settings,
  MousePointer2,
  ShieldCheck,
  MonitorPlay,
  Key,
  Gamepad2,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { TUTORIAL_DATA, checkTutorialSolution } from '../data/tutorialData';
import { db } from '../db/db';
import { importData, createInternalBackup } from '../utils/exportUtils';
import { APP_VERSION } from '../version';

export default function HelpView() {
  const { t } = useTranslation();
  const [gameStatus, setGameStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [gameMessage, setGameMessage] = useState('');

  const startTutorial = async () => {
    if (!window.confirm("This will BACKUP your current data internally and replace it with the Tutorial dataset. Are you sure?")) return;

    try {
      // 1. Backup
      await createInternalBackup(APP_VERSION);

      // 2. Wipe & Import
      await db.transaction('rw', db.clients, db.objects, db.stations, db.groups, async () => {
        await db.clients.clear();
        await db.objects.clear();
        await db.stations.clear();
        await db.groups.clear();
      });

      await importData(JSON.stringify(TUTORIAL_DATA));
      alert("Tutorial Loaded! Go to Manager view and fix the mess!");
      setGameStatus('idle');
      setGameMessage('');
    } catch (e) {
      console.error(e);
      alert("Failed to start tutorial.");
    }
  };

  const checkSolution = async () => {
    try {
      const errors = await checkTutorialSolution(db);
      if (errors.length === 0) {
        setGameStatus('success');
        setGameMessage("Great Job! The office is organized!");
        // Confetti here ideally
      } else {
        setGameStatus('error');
        setGameMessage(errors[0]); // Show first error hint
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Help & Documentation')}</h1>
        <p className="text-slate-500 text-lg">
          {t('helpIntro')}
        </p>
      </header>

      {/* 1. Dashboard */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-anydesk border-b border-slate-200 dark:border-slate-700 pb-2">
          <LayoutDashboard size={24} />
          <h2 className="text-xl font-bold">{t('help_dashboard_title')}</h2>
        </div>
        <div className="prose dark:prose-invert text-slate-600 dark:text-slate-300">
          <p>{t('help_dashboard_desc')}</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>{t('lastUsed')}:</strong> {t('help_dashboard_last_used')}</li>
            <li><strong>{t('frequentlyUsed')}:</strong> {t('help_dashboard_frequent')}</li>
            <li><strong>{t('search')}:</strong> {t('help_dashboard_search')}</li>
            <li>
              <strong>{t('newStation')}:</strong> {t('help_dashboard_quick_add')}
            </li>
          </ul>
        </div>
      </section>

      {/* 2. File Manager */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-anydesk border-b border-slate-200 dark:border-slate-700 pb-2">
          <Database size={24} />
          <h2 className="text-xl font-bold">{t('help_manager_title')}</h2>
        </div>
        <div className="prose dark:prose-invert text-slate-600 dark:text-slate-300">
          <p>{t('help_manager_desc')}</p>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-3 mt-2 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold flex items-center gap-2">
              <MousePointer2 size={16} />
              {t('help_manager_interactions')}
            </h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>{t('help_manager_lclick')}</li>
              <li>{t('help_manager_rclick')}</li>
              <li>{t('help_manager_rclick_station')}</li>
              <li>{t('help_manager_empty')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-anydesk border-b border-slate-200 dark:border-slate-700 pb-2">
          <MonitorPlay size={24} />
          <h2 className="text-xl font-bold">{t('help_cards_title')}</h2>
        </div>
        <div className="prose dark:prose-invert text-slate-600 dark:text-slate-300">
          <p>{t('help_cards_desc')}</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li className="flex items-center gap-2">
              <span className="bg-anydesk text-white px-2 py-1 rounded text-xs font-bold text-center min-w-[60px]">{t('launch')}</span>
              {t('help_cards_launch')}
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs"><Key size={12} /></span>
              {t('help_cards_key')}
            </li>
          </ul>
        </div>
      </section>

      {/* 4. Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-anydesk border-b border-slate-200 dark:border-slate-700 pb-2">
          <Settings size={24} />
          <h2 className="text-xl font-bold">{t('help_settings_title')}</h2>
        </div>
        <div className="prose dark:prose-invert text-slate-600 dark:text-slate-300">
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>{t('help_settings_appearance')}</li>
            <li>{t('help_settings_pwa')}</li>
            <li>
              {t('help_settings_data')}
              <span className="flex items-center gap-1 mt-1 text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-2 rounded">
                <ShieldCheck size={16} />
                {t('password')} & {t('Encrypted Backup')}
              </span>
            </li>
          </ul>
        </div>
      </section>

    </div>
  );
}

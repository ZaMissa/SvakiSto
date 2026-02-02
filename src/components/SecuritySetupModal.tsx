import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SecuritySetupModalProps {
  isOpen: boolean;
  onClose: (password: string) => void;
  isInitialSetup?: boolean;
}

export const SecuritySetupModal: React.FC<SecuritySetupModalProps> = ({ isOpen, onClose, isInitialSetup = false }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setError(t('Password must be at least 4 characters'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('Passwords do not match'));
      return;
    }
    onClose(password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-300 relative overflow-hidden transition-all">

        {/* Help Toggle */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="absolute top-4 right-4 text-slate-400 hover:text-blue-500 transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full z-10"
          title={t('Why is this needed?')}
        >
          {showInfo ? <ShieldCheck size={20} /> : <div className="font-serif italic font-bold w-5 h-5 flex items-center justify-center">i</div>}
        </button>

        {showInfo ? (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
                <ShieldCheck size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {t('security_info_title')}
              </h2>
            </div>
            <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              <p className="font-medium text-center mb-4">{t('security_greet_title')} {t('security_greet_desc')}</p>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                <p>🔒 <strong>{t('Encryption')}:</strong> {t('security_info_1')}</p>
                <p>🚫 <strong>{t('Privacy')}:</strong> {t('security_info_2')}</p>
                <p>🚀 <strong>{t('Access')}:</strong> {t('security_info_3')}</p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition-all mt-4"
            >
              {t('Back')}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full text-green-600 dark:text-green-400 mb-4 shadow-inner">
                <ShieldCheck size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {isInitialSetup ? t('Setup Security') : t('Change Security Password')}
              </h2>
              <p className="text-slate-500 mt-2">
                {isInitialSetup
                  ? t('To protect your Anydesk credentials, please set a default password for all your Data Backups.')
                  : t('Update your default encryption password.')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t('Create Password')}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t('Confirm Password')}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-mono"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium text-center bg-red-50 dark:bg-red-900/10 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-all mt-4"
              >
                {t('Save & Secure')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if biometric lock is enabled
    const biometricEnabled = localStorage.getItem('biometric_enabled') === 'true';
    if (biometricEnabled) {
      setIsLocked(true);
      // Attempt auto-unlock on mount (optional, might be aggressive)
      // handleUnlock(); 
    }
    setIsLoading(false);
  }, []);

  const handleUnlock = async () => {
    try {
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        rpId: window.location.hostname,
        userVerification: 'required',
        timeout: 60000,
      };

      await navigator.credentials.get({ publicKey });
      setIsLocked(false);
    } catch (e) {
      console.error('Unlock failed', e);
      // Do nothing, stay locked
      alert(t('biometric_unlock_failed'));
    }
  };

  if (isLoading) return null; // Or a splash screen

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-6 text-white space-y-8">
        <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-300">
          <div className="p-6 bg-slate-800 rounded-full shadow-2xl border border-slate-700">
            <Lock size={64} className="text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('App Locked')}</h1>
          <p className="text-slate-400 text-center max-w-xs">{t('biometric_lock_desc')}</p>
        </div>

        <button
          onClick={handleUnlock}
          className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 transition-all active:scale-95"
        >
          <Unlock size={24} />
          {t('Unlock with Biometrics')}
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

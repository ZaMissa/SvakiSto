import React, { useState, useEffect } from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BiometricsSettings: React.FC = () => {
  const { t } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if biometrics are supported (WebAuthn)
    if (window.PublicKeyCredential) {
      // We can only truly know if a platform authenticator is available by waiting for the promise
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => setIsSupported(available))
        .catch(() => setIsSupported(false));
    }

    // Load saved preference
    const saved = localStorage.getItem('biometric_enabled') === 'true';
    setIsEnabled(saved);
  }, []);

  const handleToggle = async () => {
    if (!isEnabled) {
      // Enabling
      try {
        // Create a dummy credential to register/prompt usage
        const publicKey: PublicKeyCredentialCreationOptions = {
          challenge: new Uint8Array(32),
          rp: { name: 'SvakiSto' },
          user: {
            id: new Uint8Array(16),
            name: 'user@svakisto.local',
            displayName: 'SvakiSto User',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        };

        await navigator.credentials.create({ publicKey });

        // If successful (user verified), save state
        localStorage.setItem('biometric_enabled', 'true');
        setIsEnabled(true);
      } catch (e) {
        console.error('Biometric registration failed', e);
        alert(t('biometric_error'));
      }
    } else {
      // Disabling - should ideally ask for auth again, but for now simple toggle
      if (window.confirm(t('biometric_disable_confirm'))) {
        localStorage.setItem('biometric_enabled', 'false');
        setIsEnabled(false);
      }
    }
  };

  if (!isSupported) {
    // Optional: Hide entirely or show unsupported message
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
          <Fingerprint size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('Biometrics')}</h2>
          <p className="text-sm text-slate-500">{t('biometric_desc')}</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 dark:text-slate-200 block">
            {t('biometric_enable_title')}
          </label>
          <p className="text-xs text-slate-400 max-w-sm">
            {t('biometric_enable_desc')}
          </p>
        </div>

        <button
          onClick={handleToggle}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${isEnabled ? 'translate-x-7' : ''}`} />
        </button>
      </div>

      {isEnabled && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg border border-blue-100 dark:border-blue-800">
          <ShieldCheck size={18} className="shrink-0 mt-0.5" />
          <p>{t('biometric_active_msg')}</p>
        </div>
      )}
    </div>
  );
};

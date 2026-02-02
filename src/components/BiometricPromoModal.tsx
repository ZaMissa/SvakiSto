import { useEffect, useState } from 'react';
import { Fingerprint, X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function BiometricPromoModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Check if already handled
    const promoShown = localStorage.getItem('biometric_promo_shown');
    const isEnabled = localStorage.getItem('biometric_enabled') === 'true';

    if (promoShown || isEnabled) return;

    // 2. Check support
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => {
          if (available) {
            // Delay slightly for smooth entry
            setTimeout(() => setIsOpen(true), 2000);
          }
        })
        .catch(() => { });
    }
  }, []);

  const handleEnable = () => {
    localStorage.setItem('biometric_promo_shown', 'true');
    setIsOpen(false);
    navigate('/settings');
  };

  const handleDismiss = () => {
    localStorage.setItem('biometric_promo_shown', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-10 duration-500 relative">

        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
            <Fingerprint size={32} />
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {t('biometric_promo_title')}
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t('biometric_promo_desc')}
          </p>

          <div className="w-full space-y-3 pt-2">
            <button
              onClick={handleEnable}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              {t('Enable Now')}
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-3 text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t('Maybe Later')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

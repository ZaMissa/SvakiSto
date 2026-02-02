import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../version';
import ChangelogModal from './ChangelogModal';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, CircleHelp } from 'lucide-react';
import clsx from 'clsx';
import Footer from './Footer';
import { useUpdateNotification } from '../hooks/useUpdateNotification';

export default function Layout() {
  const { t } = useTranslation();
  const { hasUnseenUpdate, markAsSeen } = useUpdateNotification();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t('dashboard') },
    { to: "/manager", icon: Database, label: t('Manager') },
    { to: "/settings", icon: Settings, label: t('settings'), badge: hasUnseenUpdate },
    { to: "/help", icon: CircleHelp, label: t('help') || 'Help' },
  ];

  // Swipe Logic
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Determine current index
    const currentIndex = navItems.findIndex(item => item.to === location.pathname);
    if (currentIndex === -1) return;

    if (isLeftSwipe) {
      // Move Next (Forward)
      if (currentIndex < navItems.length - 1) {
        navigate(navItems[currentIndex + 1].to);
      }
    } else if (isRightSwipe) {
      // Move Previous (Backward)
      if (currentIndex > 0) {
        navigate(navItems[currentIndex - 1].to);
      }
    }
  };

  // Changelog Logic
  const [showChangelog, setShowChangelog] = useState(false);
  useEffect(() => {
    // Check if we have seen this version's changelog via the notification hook logic
    // OR we can keep the separate "auto-pop" logic if desired. 
    // The user said: "notification point... as long as user dont see"... implies if they SEE it via modal, it clears.

    // Auto-pop logic:
    // If we have a FRESH update (APP_VERSION changed), we might still want to pop it?
    // User requirement: "send updates that user is needed to acknowledge before update available dissapears"
    // This implies manual acknowledgement.
    // Let's rely on the Red Dot mostly, but maybe Auto-Pop is still friendly?
    // Let's keep Auto-Pop but make sure it calls markAsSeen.

    const lastAutoPop = localStorage.getItem('last_autopop_version');
    if (lastAutoPop !== APP_VERSION) {
      // Only auto-pop if NOT silent?
      // We'd need to fetch version.json here to know if silent.
      // The hook does that.
      // Simplified: Let's Auto-Pop. If the user closes it, we mark seen.
      // If it's silent, maybe we shouldn't Auto-Pop? 
      // For now, let's just Auto-Pop on version change (client side detection).
      setTimeout(() => setShowChangelog(true), 1000);
      localStorage.setItem('last_autopop_version', APP_VERSION);
    }
  }, []);

  const handleChangelogClose = () => {
    setShowChangelog(false);
    markAsSeen();
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      onContextMenu={(e) => {
        // Prevent default browser context menu globally
        e.preventDefault();
      }}
    >
      <ChangelogModal isOpen={showChangelog} onClose={handleChangelogClose} />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4">
        <div className="mb-8 flex items-center gap-2 text-anydesk font-bold text-xl">
          <Database size={28} />
          <span>SvakiSto</span>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium relative",
                isActive
                  ? "bg-anydesk text-white shadow-lg shadow-anydesk/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon size={20} />
              {item.label}
              {/* Badge */}
              {item.badge && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Header / Content */}
      <main
        className="flex-1 flex flex-col min-w-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="md:hidden h-16 bg-anydesk text-white flex items-center px-4 sticky top-0 z-50 shadow-md">
          <Database size={24} className="mr-2" />
          <h1 className="font-bold text-lg">SvakiSto</h1>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
          {location.pathname !== '/manager' && <Footer />}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-around items-center sticky bottom-0 z-50">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative",
                isActive
                  ? "text-anydesk"
                  : "text-slate-400"
              )}
            >
              <div className="relative">
                <item.icon size={20} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}

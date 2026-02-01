import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../version';
import ChangelogModal from './ChangelogModal';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, CircleHelp } from 'lucide-react';
import clsx from 'clsx';
import Footer from './Footer';

export default function Layout() {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t('dashboard') },
    { to: "/manager", icon: Database, label: t('Manager') },
    { to: "/settings", icon: Settings, label: t('settings') },
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
    // Check if we have seen this version's changelog
    const lastVersion = localStorage.getItem('last_seen_version');

    // If no last version (first run) or different version, show changelog
    // Option: Don't show on very first install? Usually 'last_seen_version' is null.
    // Let's show it so they see "What's New" or welcome features.
    // Or better: If null, maybe just set it to current?
    // User requested: "show changelog on update".
    // If I just installed 1.3.11, I want to see features.

    if (lastVersion !== APP_VERSION) {
      // Small delay to ensure app is ready/Animation smooth
      setTimeout(() => setShowChangelog(true), 1000);
      localStorage.setItem('last_seen_version', APP_VERSION);
    }
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      onContextMenu={(e) => {
        // Prevent default browser context menu globally
        e.preventDefault();
      }}
    >
      <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
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
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                isActive
                  ? "bg-anydesk text-white shadow-lg shadow-anydesk/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon size={20} />
              {item.label}
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
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                isActive
                  ? "text-anydesk"
                  : "text-slate-400"
              )}
            >
              <item.icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}

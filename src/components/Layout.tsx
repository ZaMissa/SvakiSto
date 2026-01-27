import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Database, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t('dashboard') },
    { to: "/clients", icon: Database, label: t('clients') },
    { to: "/settings", icon: Settings, label: t('settings') },
  ];

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      onContextMenu={(e) => {
        // Prevent default browser context menu globally
        e.preventDefault();
      }}
    >
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
      <main className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden h-16 bg-anydesk text-white flex items-center px-4 sticky top-0 z-50 shadow-md">
          <Database size={24} className="mr-2" />
          <h1 className="font-bold text-lg">SvakiSto</h1>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
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

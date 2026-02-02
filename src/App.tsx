import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import HierarchyManager from './components/HierarchyManager';
import Settings from './components/SettingsView';
import HelpView from './components/HelpView';

import { AuthGuard } from './components/AuthGuard';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <AuthGuard>
            <Layout />
          </AuthGuard>
        }>
          <Route index element={<Dashboard />} />
          <Route path="manager" element={<HierarchyManager />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;

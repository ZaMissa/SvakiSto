import { Component, type ErrorInfo, type ReactNode } from 'react';
import { db } from '../db/db';
import { downloadBackup } from '../utils/exportUtils';
import { Download, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  backups: any[];
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, backups: [] };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, backups: [] };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Attempt to fetch backups on error
    db.backups.orderBy('createdAt').reverse().toArray().then(backups => {
      this.setState({ backups });
    }).catch(e => console.error("Failed to load backups in boundary", e));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-red-100 dark:border-red-900 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Something went wrong</h1>
              <p className="text-slate-500 dark:text-slate-400">The application encountered a critical error and cannot continue.</p>
            </div>

            {this.state.backups.length > 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Recover Data</h3>
                <p className="text-xs text-slate-500 mb-4">We found auto-backups on this device. Download one to save your data.</p>
                <div className="space-y-2">
                  {this.state.backups.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => downloadBackup(b.data, undefined, `recovery_backup_${new Date(b.createdAt).getTime()}`)}
                      className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-anydesk hover:text-anydesk transition-colors text-sm"
                    >
                      <span>{new Date(b.createdAt).toLocaleString()}</span>
                      <Download size={16} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 italic">No local backups found.</div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
            >
              Try Reloading
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

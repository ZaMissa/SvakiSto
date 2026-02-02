import { useState, useEffect } from 'react';
import { APP_VERSION } from '../version';

export const useUpdateNotification = () => {
  const [hasUnseenUpdate, setHasUnseenUpdate] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const jsonPath = `${baseUrl}version.json`.replace('//', '/');
        const res = await fetch(`${jsonPath}?t=${Date.now()}`);
        const data = await res.json();

        const latest = data.history?.[0]; // Assuming sorted desc
        if (!latest) return;

        const lastSeen = localStorage.getItem('last_seen_changelog_version');

        // Logic:
        // 1. If latest version in JSON > last_seen (meaning user hasn't ack'd it)
        // 2. AND latest version is NOT silent
        // 3. AND latest version >= currentAppVersion (ensure we don't notify for future versions if we are somehow behind? or maybe we do?)
        //    Actually, we notify if there is "news".

        // Simple check: Is the latest history item newer than what we last saw?
        // AND is it not silent?

        if (latest.version !== lastSeen && !latest.silent) {
          setHasUnseenUpdate(true);
          setRemoteVersion(latest.version);
        } else {
          setHasUnseenUpdate(false);
        }
      } catch (err) {
        console.error("Failed to check updates", err);
      }
    };

    checkUpdates();
  }, []);

  const markAsSeen = () => {
    if (remoteVersion) {
      localStorage.setItem('last_seen_changelog_version', remoteVersion);
      setHasUnseenUpdate(false);
    } else {
      // Fallback to current app version if remote fetch failed but we want to clear?? 
      // No, should rely on remote. But if we open modal manually, we can just set it to APP_VERSION
      localStorage.setItem('last_seen_changelog_version', APP_VERSION);
      setHasUnseenUpdate(false);
    }
  };

  return { hasUnseenUpdate, markAsSeen };
};

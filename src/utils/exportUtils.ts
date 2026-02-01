import { db } from '../db/db';
import { encryptData } from './security'; // Assuming security is here

export interface BackupData {
  meta: {
    date: string;
    version: string;
    exportedBy: string;
  };
  clients: any[];
  objects: any[];
  stations: any[];
  groups: any[];
}

export const generateBackupData = async (version: string): Promise<BackupData> => {
  const clients = await db.clients.toArray();
  const objects = await db.objects.toArray();
  const stations = await db.stations.toArray();
  const groups = await db.groups.toArray();

  return {
    meta: {
      date: new Date().toISOString(),
      version: version,
      exportedBy: "SvakiSto AutoBackup"
    },
    clients,
    objects,
    stations,
    groups
  };
};

export const downloadBackup = async (data: BackupData, password?: string, filenamePrefix = "backups") => {
  let jsonString = JSON.stringify(data, null, 2);

  if (password) {
    try {
      jsonString = encryptData(jsonString, password);
    } catch (e) {
      console.error("Encryption failed", e);
      throw new Error("Encryption failed");
    }
  }

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const createInternalBackup = async (version: string) => {
  const data = await generateBackupData(version);
  // Limit backups to last 3 to save space
  const count = await db.backups.count();
  if (count >= 3) {
    const oldest = await db.backups.orderBy('createdAt').first();
    if (oldest) await db.backups.delete(oldest.id!);
  }

  await db.backups.add({
    data: data,
    createdAt: new Date(),
    reason: 'update-auto-backup'
  });
  return true;
};

import Dexie, { type EntityTable } from 'dexie';

export interface Group {
  id: number;
  name: string;
  color: string;
}

export interface Client {
  id: number;
  groupId?: number;
  name: string;
  createdAt: Date;
}

export interface ClientObject {
  id: number;
  clientId: number;
  name: string;
  createdAt: Date;
}

export interface Station {
  id: number;
  objectId: number;
  name: string;
  anydeskId: string;
  password?: string;
  lastUsed?: Date;
  usageCount: number;
  createdAt: Date;
}

export interface InternalBackup {
  id?: number;
  data: any; // Full JSON backup
  createdAt: Date;
  reason: string;
}

const db = new Dexie('SvakiStoDB') as Dexie & {
  groups: EntityTable<Group, 'id'>;
  clients: EntityTable<Client, 'id'>;
  objects: EntityTable<ClientObject, 'id'>;
  stations: EntityTable<Station, 'id'>;
  backups: EntityTable<InternalBackup, 'id'>;
};

// Version 2: Add groups
// Dexie upgrades: https://dexie.org/docs/Tutorial/Design#database-versioning
db.version(1).stores({
  clients: '++id, name, createdAt',
  objects: '++id, clientId, name, createdAt',
  stations: '++id, objectId, name, anydeskId, lastUsed, usageCount, createdAt'
});

db.version(2).stores({
  groups: '++id, name',
  clients: '++id, groupId, name, createdAt' // Update index
});

db.version(3).stores({
  backups: '++id, createdAt'
});

export { db };

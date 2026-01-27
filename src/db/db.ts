import Dexie, { type EntityTable } from 'dexie';

export interface Client {
  id: number;
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

const db = new Dexie('SvakiStoDB') as Dexie & {
  clients: EntityTable<Client, 'id'>;
  objects: EntityTable<ClientObject, 'id'>;
  stations: EntityTable<Station, 'id'>;
};

db.version(1).stores({
  clients: '++id, name, createdAt',
  objects: '++id, clientId, name, createdAt',
  stations: '++id, objectId, name, anydeskId, lastUsed, usageCount, createdAt'
});

export { db };

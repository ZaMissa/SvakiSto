import { type BackupData } from '../utils/exportUtils';


// Tutorial: "The Messy Office"
// Goal: Organize Items into correct Clients/Groups.
// Groups: "Unsorted" (Initial), "IT Dept", "Marketing", "Sales" (Target)
// Clients: "Server Room", "Design Studio", "Sales Floor"

// SCENARIO:
// Everything is currently in "Unsorted" group.
// Clients are mixed up.
// Stations are mixed up.

export const TUTORIAL_DATA: BackupData = {
  meta: {
    version: "1.1.0",
    date: new Date().toISOString(),
    exportedBy: "Tutorial Mode"
  },
  groups: [
    { id: 1, name: "Unsorted", usageCount: 100 },
    { id: 2, name: "IT Dept", usageCount: 0 },
    { id: 3, name: "Marketing", usageCount: 0 },
  ],
  clients: [
    { id: 1, name: "Server Room", groupId: 1 }, // Correct Group: IT Dept (2)
    { id: 2, name: "Design Studio", groupId: 1 }, // Correct Group: Marketing (3)
    { id: 3, name: "Messy Desk", groupId: 1 }, // Should be deleted or renamed? Let's keep it simple.
  ],
  objects: [
    { id: 1, name: "Rack A", clientId: 1 }, // Correct
    { id: 2, name: "Design PC 1", clientId: 2 }, // Correct
    { id: 3, name: "Stray Printer", clientId: 1 }, // Should be in Design Studio (2) potentially? Or keep simple.
  ],
  stations: [
    { id: 1, name: "Main Server", anydeskId: "111-222-333", objectId: 1, password: "secure", usageCount: 0 }, // OK
    { id: 2, name: "Artist Mac", anydeskId: "999-888-777", objectId: 1, password: "art", usageCount: 0 }, // WRONG: In Rack A (Server Room). Should be in Design PC 1 (Design Studio).
    { id: 3, name: "Reception PC", anydeskId: "555-444-333", objectId: 2, password: "hello", usageCount: 0 }, // WRONG: In Design Studio. Should be in... maybe creating a new Client "Reception"? 
  ]
};

// Solution Validator
export const checkTutorialSolution = async (db: any) => {
  const errors: string[] = [];

  // 1. Check Groups
  const serverRoom = await db.clients.where('name').equals('Server Room').first();
  const designStudio = await db.clients.where('name').equals('Design Studio').first();
  const itGroup = await db.groups.where('name').equals('IT Dept').first();
  const mktGroup = await db.groups.where('name').equals('Marketing').first();

  if (!serverRoom || !itGroup || serverRoom.groupId !== itGroup.id) {
    errors.push("Client 'Server Room' should be in Group 'IT Dept'.");
  }

  if (!designStudio || !mktGroup || designStudio.groupId !== mktGroup.id) {
    errors.push("Client 'Design Studio' should be in Group 'Marketing'.");
  }

  // 2. Check Stations
  const artistMac = await db.stations.where('name').equals('Artist Mac').first();
  const designPC = await db.objects.where('name').equals('Design PC 1').first();

  if (!artistMac || !designPC || artistMac.objectId !== designPC.id) {
    errors.push("Station 'Artist Mac' should be inside Object 'Design PC 1'.");
  }

  return errors;
};

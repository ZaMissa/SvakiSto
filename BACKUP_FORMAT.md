# SvakiSto Backup Format Specification

## Overview
SvakiSto uses a JSON-based format for backing up and restoring data. The file can be either:
1.  **Plain JSON**: Directly readable and editable.
2.  **Encrypted JSON**: AES-encrypted string wrapper.

## 1. Plain JSON Structure
A valid backup file is a JSON object with the following structure:

```json
{
  "meta": {
    "date": "2024-03-20T10:00:00.000Z",
    "version": "1.1.0",
    "exportedBy": "User"
  },
  "groups": [
    {
      "id": 1,
      "name": "Group Name",
      "color": "blue"
    }
  ],
  "clients": [
    {
      "id": 1,
      "groupId": 1,
      "name": "Client Name",
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  ],
  "objects": [
    {
      "id": 1,
      "clientId": 1,
      "name": "Object Name",
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  ],
  "stations": [
    {
      "id": 1,
      "objectId": 1,
      "name": "Station Name",
      "anydeskId": "123 456 789",
      "password": "optional_password",
      "usageCount": 0,
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  ]
}
```

### Field Descriptions

#### **`groups`** (New in v1.1.0)
-   `id` (number): Unique identifier.
-   `name` (string): Display name of the group.
-   `color` (string): Color keyword (e.g., 'blue', 'red').

#### **`clients`**
-   `id` (number): Unique identifier.
-   `groupId` (number, optional): Must match an `id` in the `groups` array.
-   `name` (string): Display name of the client.
-   `createdAt` (string/date): ISO 8601 date string.

#### **`objects`**
-   `id` (number): Unique identifier.
-   `clientId` (number): Must match an `id` in the `clients` array used as parent.
-   `name` (string): Display name.
-   `createdAt` (string/date): ISO 8601 date string.

#### **`stations`**
-   `id` (number): Unique identifier.
-   `objectId` (number): Must match an `id` in the `objects` array used as parent.
-   `name` (string): Display name.
-   `anydeskId` (string): AnyDesk Address/ID.
-   `password` (string, optional): Plaintext password (if using plain JSON export).
-   `usageCount` (number, optional): Usage statistics.
-   `lastUsed` (string/date, optional): ISO 8601 date string.

---

## 2. Encrypted JSON Structure
If a password is set during export, the file content is wrapped:

```json
{
  "encrypted": true,
  "content": "U2FsdGVkX1+..." // AES Encrypted string of the Plain JSON above
}
```

To restore an encrypted backup, you simply select the file in the app and enter the password when prompted.

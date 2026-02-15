import { Q } from "@nozbe/watermelondb";
import type { Database } from "@nozbe/watermelondb";
import type PocketBase from "pocketbase";

import { getPocketBase } from "@/api/pocketbase";
import { Collections } from "@/types/pocketbase-types";

// ---------------------------------------------------------------------------
// Table / field mapping
// ---------------------------------------------------------------------------

/** Maps WatermelonDB table names to PocketBase collection names. */
const TABLE_TO_COLLECTION: Record<string, string> = {
  notes: Collections.Notes,
};

/** Tables that should be synced. */
const SYNC_TABLES = ["notes"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a PocketBase date string (ISO 8601) to a Unix timestamp in ms.
 * Returns 0 if value is falsy.
 */
const pbDateToTimestamp = (dateStr: string | null | undefined): number => {
  if (!dateStr) return 0;
  return new Date(dateStr).getTime();
};

/**
 * Transform a PocketBase record into a flat object suitable for writing into
 * WatermelonDB via `_raw`.
 */
const pbRecordToLocal = (
  table: string,
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const local: Record<string, unknown> = {
    server_id: record.id as string,
    created_at: pbDateToTimestamp(record.created as string),
    updated_at: pbDateToTimestamp(record.updated as string),
  };

  for (const [key, value] of Object.entries(record)) {
    if (
      ["id", "created", "updated", "collectionId", "collectionName", "expand"].includes(key)
    ) {
      continue;
    }

    local[key] = value ?? null;
  }

  return local;
};

// ---------------------------------------------------------------------------
// Upsert — core building block
// ---------------------------------------------------------------------------

/**
 * Upsert a single PocketBase record into WatermelonDB.
 */
export const upsertRecord = async (
  database: Database,
  table: string,
  pbRecord: Record<string, unknown>,
): Promise<void> => {
  const local = pbRecordToLocal(table, pbRecord);
  const serverId = local.server_id as string;

  const collection = database.get(table);

  const existing = await collection
    .query(Q.where("server_id", serverId))
    .fetch();

  await database.write(async () => {
    if (existing.length > 0) {
      const record = existing[0];
      await record.update(() => {
        const raw = record._raw as Record<string, unknown>;
        for (const [key, value] of Object.entries(local)) {
          if (key !== "id") {
            raw[key] = value;
          }
        }
      });
    } else {
      await collection.create((rec) => {
        const raw = rec._raw as Record<string, unknown>;
        for (const [key, value] of Object.entries(local)) {
          if (key !== "id") {
            raw[key] = value;
          }
        }
      });
    }
  });
};

/**
 * Delete a local record by its PocketBase server_id.
 */
export const deleteRecordByServerId = async (
  database: Database,
  table: string,
  serverId: string,
): Promise<void> => {
  const collection = database.get(table);
  const existing = await collection
    .query(Q.where("server_id", serverId))
    .fetch();

  if (existing.length > 0) {
    await database.write(async () => {
      await existing[0].destroyPermanently();
    });
  }
};

// ---------------------------------------------------------------------------
// Pull — fetch everything from PB and upsert into WMDB
// ---------------------------------------------------------------------------

const pullAll = async (database: Database, pb: PocketBase): Promise<void> => {
  for (const table of SYNC_TABLES) {
    const collectionName = TABLE_TO_COLLECTION[table];
    if (!collectionName) continue;

    try {
      const records = await pb.collection(collectionName).getFullList({
        sort: "-updated",
      });

      const existingRecords = await database.get(table).query().fetch();
      const serverIdToLocal = new Map<string, typeof existingRecords[0]>();
      for (const rec of existingRecords) {
        const sid = (rec._raw as Record<string, unknown>).server_id as string;
        if (sid) {
          serverIdToLocal.set(sid, rec);
        }
      }

      const receivedServerIds = new Set<string>();

      await database.write(async () => {
        const collection = database.get(table);

        for (const pbRec of records) {
          const raw = pbRec as unknown as Record<string, unknown>;
          const local = pbRecordToLocal(table, raw);
          const serverId = local.server_id as string;
          receivedServerIds.add(serverId);

          const existingRec = serverIdToLocal.get(serverId);

          if (existingRec) {
            await existingRec.update(() => {
              const existingRaw = existingRec._raw as Record<string, unknown>;
              for (const [key, value] of Object.entries(local)) {
                if (key !== "id") {
                  existingRaw[key] = value;
                }
              }
            });
          } else {
            await collection.create((rec) => {
              const newRaw = rec._raw as Record<string, unknown>;
              for (const [key, value] of Object.entries(local)) {
                if (key !== "id") {
                  newRaw[key] = value;
                }
              }
            });
          }
        }

        for (const [sid, rec] of serverIdToLocal) {
          if (!receivedServerIds.has(sid)) {
            await rec.destroyPermanently();
          }
        }
      });
    } catch (error) {
      console.warn(`[Sync] Failed to pull ${collectionName}:`, error);
    }
  }
};

// ---------------------------------------------------------------------------
// Public sync function with global lock
// ---------------------------------------------------------------------------

let syncInProgress = false;
let syncQueued = false;

export const sync = async (database: Database): Promise<void> => {
  if (syncInProgress) {
    syncQueued = true;
    return;
  }

  syncInProgress = true;

  try {
    const pb = await getPocketBase();
    if (!pb) {
      console.warn("[Sync] No PocketBase instance (no server URL?)");
      return;
    }
    if (!pb.authStore.isValid) {
      console.warn("[Sync] Auth not valid, skipping sync");
      return;
    }

    await pullAll(database, pb);
  } catch (error) {
    console.warn("[Sync] Failed:", error);
  } finally {
    syncInProgress = false;

    if (syncQueued) {
      syncQueued = false;
      sync(database);
    }
  }
};

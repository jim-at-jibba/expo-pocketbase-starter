import type { Database } from "@nozbe/watermelondb";
import type PocketBase from "pocketbase";
import type { UnsubscribeFunc } from "pocketbase";
import { Collections } from "@/types/pocketbase-types";
import { upsertRecord, deleteRecordByServerId } from "@/db/sync";

/** Collections we want to watch for realtime updates. */
const REALTIME_COLLECTIONS = [Collections.Notes];

/**
 * Maps PocketBase collection names to WatermelonDB table names.
 */
const COLLECTION_TO_TABLE: Record<string, string> = {
  [Collections.Notes]: "notes",
};

/**
 * Manages PocketBase SSE subscriptions for realtime updates.
 */
export class RealtimeManager {
  private pb: PocketBase;
  private database: Database;
  private unsubscribeFns: UnsubscribeFunc[] = [];
  private isSubscribed = false;

  constructor(pb: PocketBase, database: Database) {
    this.pb = pb;
    this.database = database;
  }

  async subscribe(): Promise<void> {
    if (this.isSubscribed) return;

    for (const collection of REALTIME_COLLECTIONS) {
      try {
        const table = COLLECTION_TO_TABLE[collection];
        if (!table) continue;

        const unsubscribe = await this.pb.collection(collection).subscribe("*", async (data) => {
          try {
            const record = data.record as Record<string, unknown>;

            if (data.action === "delete") {
              const serverId = record.id as string;
              await deleteRecordByServerId(this.database, table, serverId);
            } else {
              await upsertRecord(this.database, table, record);
            }
          } catch (error) {
            console.warn(`[Realtime] Failed to process ${data.action} on ${collection}:`, error);
          }
        });
        this.unsubscribeFns.push(unsubscribe);
      } catch (error) {
        console.warn(`[Realtime] Failed to subscribe to ${collection}:`, error);
      }
    }

    this.isSubscribed = true;
  }

  async unsubscribe(): Promise<void> {
    for (const fn of this.unsubscribeFns) {
      try {
        await fn();
      } catch (error) {
        console.warn("[Realtime] Failed to unsubscribe:", error);
      }
    }
    this.unsubscribeFns = [];
    this.isSubscribed = false;
  }

  get subscribed(): boolean {
    return this.isSubscribed;
  }
}

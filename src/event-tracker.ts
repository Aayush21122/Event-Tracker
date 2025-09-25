import { Collection, ObjectId } from "mongodb";
import { Database } from "./database";
import { CryptoHelper } from "./crypto";

interface AddEventParams {
  eventType: string;
  eventName: string;
  data: any;
  isEncrypted?: boolean;
  isOwn?: boolean;
}

interface StoredEvent {
  _id?: ObjectId;
  eventType: string;
  eventName: string;
  data: any;
  isEncrypted: boolean;
  isOwn: boolean;
  createdAt: Date;
}

interface GetEventsParams {
  eventType: string;
  eventName: string;
  filter?: Record<string, any>;
  isEncrypted?: boolean;
  page?: number;
  limit?: number;
}

interface GetEventsResult {
  success: boolean;
  data: StoredEvent[];
  total: number;
  message: string;
}

export class EventTracker {
  private static readonly MASTER_COLLECTION = "master_event_logs";

  /** Add a new event to the appropriate collection */
  public static async addEvent({
    eventType,
    eventName,
    data,
    isEncrypted = false,
    isOwn = true,
  }: AddEventParams): Promise<{ success: boolean; data?: StoredEvent; error?: string }> {
    try {
      if (!eventType) return { success: false, error: "eventType is required" };
      if (!eventName) return { success: false, error: "eventName is required" };
      if (!data) return { success: false, error: "Data is required" };

      eventType = eventType.toLowerCase();
      if (eventType === "master") {
        return { success: false, error: "Cannot add events to master event logs directly" };
      }

      const db = Database.getDB();

      const collectionName = isOwn
        ? this.MASTER_COLLECTION
        : eventType.endsWith("_event_logs")
        ? eventType
        : `${eventType}_event_logs`;

      const collection = db.collection<StoredEvent>(collectionName);

      const storedData: StoredEvent = {
        eventType,
        eventName,
        data: isEncrypted ? CryptoHelper.encrypt(data) : data,
        isEncrypted,
        isOwn,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(storedData);
      storedData._id = result.insertedId;

      return { success: true, data: storedData };
    } catch (err: any) {
      return { success: false, error: err.message || "Unknown error occurred" };
    }
  }

  public static async getEvents({
    eventType,
    eventName,
    filter = {},
    isEncrypted,
    page = 1,
    limit = 10,
  }: GetEventsParams): Promise<GetEventsResult> {
    eventType = eventType.toLowerCase();
    if (eventType === "master") {
      return { success: false, data: [], total: 0, message: "Cannot query master event logs directly" };
    }

    const collectionName = `${eventType}_event_logs`;
    const db = Database.getDB();

    const collections = await db.listCollections({ name: collectionName }).toArray();
    const collection: Collection<StoredEvent> = collections.length
      ? db.collection(collectionName)
      : db.collection(this.MASTER_COLLECTION);

    const baseFilter: Record<string, any> = { eventType, eventName };
    if (isEncrypted !== undefined) baseFilter.isEncrypted = isEncrypted;

    for (const key in filter) {
      baseFilter[`data.${key}`] = filter[key];
    }

    const total = await collection.countDocuments(baseFilter);
    let rows = await collection
      .find(baseFilter as any)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    if (isEncrypted === false) {
      rows = rows.filter((row) => !row.isEncrypted);
    } else if (isEncrypted === true) {
      rows = rows.map((row) => {
        if (row.isEncrypted) {
          try {
            row.data = CryptoHelper.decrypt(row.data);
          } catch {
            row.data = null;
          }
        }
        return row;
      });
    }

    return { success: true, data: rows, total, message: "Fetched Successfully" };
  }
}

import { Collection, ObjectId } from "mongodb";
import { Database } from "./db";
import { Security } from "./security";

interface AddEventParams {
  eventType: string;
  eventName: string;
  data: any;
  isEncrypted?: boolean;
  isOwn?: boolean;
}

interface StoredEvent {
  eventType: string;
  eventName: string;
  data: any;
  isEncrypted: boolean;
  isOwn: boolean;
  createdAt: Date;
  _id?: ObjectId;
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

class EventLogger {
  public static async addEvent({
    eventType,
    eventName,
    data,
    isEncrypted = false,
    isOwn = true,
  }: AddEventParams): Promise<{ success: boolean; data?: StoredEvent; error?: string }> {
    try {
      if (!eventType) {
        return { success: false, error: "eventType is required" };
      }
      eventType = eventType.toLowerCase();
      if (eventType === "master") {
        return { success: false, error: "Cannot add events to master event logs directly" };
      }
      if (!eventName) {
        return { success: false, error: "eventName is required" };
      }
      if (!data) {
        return { success: false, error: "Data is required" };
      }

      const db = Database.getDB();
      let collectionName = "master_event_logs";
      if (!isOwn) {
        collectionName = eventType.endsWith("_event_logs")
          ? eventType
          : `${eventType}_event_logs`;
      }

      const collection: Collection<StoredEvent> = db.collection(collectionName);
      const storedData: StoredEvent = {
        eventType,
        eventName,
        data: isEncrypted ? Security.encrypt(data) : data,
        isEncrypted,
        isOwn,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(storedData);
      storedData._id = result.insertedId;

      return {
        success: true,
        data: storedData,
      };
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

    const collections = await db.listCollections().toArray();
    const exists = collections.some((c) => c.name === collectionName);
    // if (!exists) {
    //   return { data: [], total: 0 };
    // }

    const collection: Collection<StoredEvent> = exists ? db.collection(collectionName) : db.collection("master_event_logs");
    const baseFilter: Record<string, any> = { eventType, eventName };
    if (isEncrypted !== undefined) {
      baseFilter.isEncrypted = isEncrypted;
    }

    const total = await collection.countDocuments(baseFilter);

    for (const key in filter) {
      baseFilter[`data.${key}`] = filter[key];
    }

    let rows: StoredEvent[] = await collection
      .find(baseFilter as any)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    if (isEncrypted === false) {
      const filteredRows = rows.filter((row) => !row.isEncrypted);
      return { success: true, data: filteredRows, total, message: "Fetched Successfully" };
    }

    if (isEncrypted === true) {
      rows = rows.map((row) => {
        try {
          row.data = Security.decrypt(row.data);
        } catch {
          row.data = null;
        }
        return row;
      });
    }
    return { success: true, data: rows, total, message: "Fetched Successfully" };
  }
}

export { EventLogger };
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTracker = void 0;
const database_1 = require("./database");
const crypto_1 = require("./crypto");
class EventTracker {
    /** Add a new event to the appropriate collection */
    static async addEvent({ eventType, eventName, data, isEncrypted = false, isOwn = true, }) {
        try {
            if (!eventType)
                return { success: false, error: "eventType is required" };
            if (!eventName)
                return { success: false, error: "eventName is required" };
            if (!data)
                return { success: false, error: "Data is required" };
            eventType = eventType.toLowerCase();
            if (eventType === "master") {
                return { success: false, error: "Cannot add events to master event logs directly" };
            }
            const db = database_1.Database.getDB();
            const collectionName = isOwn
                ? this.MASTER_COLLECTION
                : eventType.endsWith("_event_logs")
                    ? eventType
                    : `${eventType}_event_logs`;
            const collection = db.collection(collectionName);
            const storedData = {
                eventType,
                eventName,
                data: isEncrypted ? crypto_1.CryptoHelper.encrypt(data) : data,
                isEncrypted,
                isOwn,
                createdAt: new Date(),
            };
            const result = await collection.insertOne(storedData);
            storedData._id = result.insertedId;
            return { success: true, data: storedData };
        }
        catch (err) {
            return { success: false, error: err.message || "Unknown error occurred" };
        }
    }
    static async getEvents({ eventType, eventName, filter = {}, isEncrypted, page = 1, limit = 10, }) {
        eventType = eventType.toLowerCase();
        if (eventType === "master") {
            return { success: false, data: [], total: 0, message: "Cannot query master event logs directly" };
        }
        const collectionName = `${eventType}_event_logs`;
        const db = database_1.Database.getDB();
        const collections = await db.listCollections({ name: collectionName }).toArray();
        const collection = collections.length
            ? db.collection(collectionName)
            : db.collection(this.MASTER_COLLECTION);
        const baseFilter = { eventType, eventName };
        if (isEncrypted !== undefined)
            baseFilter.isEncrypted = isEncrypted;
        for (const key in filter) {
            baseFilter[`data.${key}`] = filter[key];
        }
        const total = await collection.countDocuments(baseFilter);
        let rows = await collection
            .find(baseFilter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();
        if (isEncrypted === false) {
            rows = rows.filter((row) => !row.isEncrypted);
        }
        else if (isEncrypted === true) {
            rows = rows.map((row) => {
                if (row.isEncrypted) {
                    try {
                        row.data = crypto_1.CryptoHelper.decrypt(row.data);
                    }
                    catch {
                        row.data = null;
                    }
                }
                return row;
            });
        }
        return { success: true, data: rows, total, message: "Fetched Successfully" };
    }
}
exports.EventTracker = EventTracker;
EventTracker.MASTER_COLLECTION = "master_event_logs";

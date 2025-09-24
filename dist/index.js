"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLogger = void 0;
const db_1 = require("./db");
const security_1 = require("./security");
class EventLogger {
    static async addEvent({ eventType, eventName, data, isEncrypted = false, isOwn = true, }) {
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
            const db = db_1.Database.getDB();
            let collectionName = "master_event_logs";
            if (!isOwn) {
                collectionName = eventType.endsWith("_event_logs")
                    ? eventType
                    : `${eventType}_event_logs`;
            }
            const collection = db.collection(collectionName);
            const storedData = {
                eventType,
                eventName,
                data: isEncrypted ? security_1.Security.encrypt(data) : data,
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
        const db = db_1.Database.getDB();
        const collections = await db.listCollections().toArray();
        const exists = collections.some((c) => c.name === collectionName);
        // if (!exists) {
        //   return { data: [], total: 0 };
        // }
        const collection = exists ? db.collection(collectionName) : db.collection("master_event_logs");
        const baseFilter = { eventType, eventName };
        if (isEncrypted !== undefined) {
            baseFilter.isEncrypted = isEncrypted;
        }
        const total = await collection.countDocuments(baseFilter);
        for (const key in filter) {
            baseFilter[`data.${key}`] = filter[key];
        }
        let rows = await collection
            .find(baseFilter)
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
                    row.data = security_1.Security.decrypt(row.data);
                }
                catch {
                    row.data = null;
                }
                return row;
            });
        }
        return { success: true, data: rows, total, message: "Fetched Successfully" };
    }
}
exports.EventLogger = EventLogger;

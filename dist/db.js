"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongodb_1 = require("mongodb");
class Database {
    static async initConnection(mongoUrl, dbName = "logs_db") {
        try {
            if (this.isInitialized && this.client && this.db) {
                return { success: true, db: this.db };
            }
            this.client = new mongodb_1.MongoClient(mongoUrl);
            await this.client.connect();
            this.db = this.client.db(dbName);
            this.isInitialized = true;
            const collections = await this.db
                .listCollections({}, { nameOnly: true })
                .toArray();
            if (!collections.find((c) => c.name === "master_event_logs")) {
                await this.db.createCollection("master_event_logs");
            }
            return { success: true, db: this.db };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    static getDB() {
        if (!this.isInitialized) {
            throw new Error("DB not initialized. Call initConnection first.");
        }
        return this.db;
    }
}
exports.Database = Database;
Database.isInitialized = false;

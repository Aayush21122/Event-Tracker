"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongodb_1 = require("mongodb");
class Database {
    /**
     * Initialize MongoDB connection (idempotent).
     */
    static async connect() {
        if (this.db && this.client) {
            return this.db;
        }
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI environment variable is not set.");
        }
        try {
            this.client = new mongodb_1.MongoClient(uri);
            await this.client.connect();
            this.db = this.client.db();
            console.log(`[MongoDB] Connected to database: ${this.db.databaseName}`);
            return this.db;
        }
        catch (err) {
            console.error("[MongoDB] Connection error:", err);
            throw err;
        }
    }
    /**
     * Get the active database instance.
     */
    static getDB() {
        if (!this.db) {
            throw new Error("Database not initialized. Call Database.connect() first.");
        }
        return this.db;
    }
    /**
     * Close MongoDB connection.
     */
    static async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log("[MongoDB] Connection closed.");
            this.client = null;
            this.db = null;
        }
    }
}
exports.Database = Database;
Database.client = null;
Database.db = null;

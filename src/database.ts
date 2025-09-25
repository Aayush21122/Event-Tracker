import { MongoClient, Db } from "mongodb";

export class Database {
  private static client: MongoClient | null = null;
  private static db: Db | null = null;

  /**
   * Initialize MongoDB connection (idempotent).
   */
  public static async connect(): Promise<Db> {
    if (this.db && this.client) {
      return this.db;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI environment variable is not set.");
    }

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db();

      console.log(`[MongoDB] Connected to database: ${this.db.databaseName}`);
      return this.db;
    } catch (err) {
      console.error("[MongoDB] Connection error:", err);
      throw err;
    }
  }

  /**
   * Get the active database instance.
   */
  public static getDB(): Db {
    if (!this.db) {
      throw new Error("Database not initialized. Call Database.connect() first.");
    }
    return this.db;
  }

  /**
   * Close MongoDB connection.
   */
  public static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log("[MongoDB] Connection closed.");
      this.client = null;
      this.db = null;
    }
  }
}
import { MongoClient, Db } from "mongodb";

class Database {
  private static client: MongoClient;
  private static db: Db;
  private static isInitialized = false;

  public static async initConnection(mongoUrl: string, dbName = "logs_db"): Promise<{ success: boolean; db?: Db; error?: string }> {
    try {
      if (this.isInitialized && this.client && this.db) {
        return { success: true, db: this.db };
      }

      this.client = new MongoClient(mongoUrl);
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
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public static getDB(): Db {
    if (!this.isInitialized) {
      throw new Error("DB not initialized. Call initConnection first.");
    }
    return this.db;
  }
}

export { Database };
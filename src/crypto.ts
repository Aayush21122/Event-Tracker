import crypto from "crypto";

export class CryptoHelper {
  private static readonly ALGORITHM = "aes-256-gcm";

  /**
   * Get a valid 32-byte encryption key from env or fallback.
   */
  private static getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set.");
  }
  
  const paddedKey = key.padEnd(32).slice(0, 32);
  return Buffer.from(paddedKey);
}

  /**
   * Encrypts data using AES-256-GCM (authenticated encryption).
   */
  public static encrypt<T = any>(data: T): string {
    const iv = crypto.randomBytes(12); // GCM recommended 12 bytes IV
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.getKey(), iv);

    let encrypted = cipher.update(JSON.stringify(data), "utf-8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    // format: iv:encrypted:authTag
    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  }

  /**
   * Decrypts AES-256-GCM encrypted data.
   */
  public static decrypt<T = any>(encryptedData: string): T {
    const [ivHex, encrypted, authTagHex] = encryptedData.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.getKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return JSON.parse(decrypted) as T;
  }
}

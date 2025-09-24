import crypto from "crypto";

class Security {
  private static readonly DEFAULT_KEY = "Qrfsad4Iq02Ommpbsyomd30AAQ4";

  private static getKey(): Buffer {
    const key = (process.env.EVENT_LOGGER_KEY || this.DEFAULT_KEY).padEnd(32).slice(0, 32);
    return Buffer.from(key);
  }

  public static encrypt(text: any): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.getKey(), iv);
    let encrypted = cipher.update(JSON.stringify(text), "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  public static decrypt(encryptedText: string): any {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", this.getKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  }
}

export { Security };
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoHelper = void 0;
const crypto_1 = __importDefault(require("crypto"));
class CryptoHelper {
    /**
     * Get a valid 32-byte encryption key from env or fallback.
     */
    static getKey() {
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
    static encrypt(data) {
        const iv = crypto_1.default.randomBytes(12); // GCM recommended 12 bytes IV
        const cipher = crypto_1.default.createCipheriv(this.ALGORITHM, this.getKey(), iv);
        let encrypted = cipher.update(JSON.stringify(data), "utf-8", "hex");
        encrypted += cipher.final("hex");
        const authTag = cipher.getAuthTag().toString("hex");
        // format: iv:encrypted:authTag
        return `${iv.toString("hex")}:${encrypted}:${authTag}`;
    }
    /**
     * Decrypts AES-256-GCM encrypted data.
     */
    static decrypt(encryptedData) {
        const [ivHex, encrypted, authTagHex] = encryptedData.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const decipher = crypto_1.default.createDecipheriv(this.ALGORITHM, this.getKey(), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return JSON.parse(decrypted);
    }
}
exports.CryptoHelper = CryptoHelper;
CryptoHelper.ALGORITHM = "aes-256-gcm";

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Security = void 0;
const crypto_1 = __importDefault(require("crypto"));
class Security {
    static getKey() {
        const key = (process.env.EVENT_LOGGER_KEY || this.DEFAULT_KEY).padEnd(32).slice(0, 32);
        return Buffer.from(key);
    }
    static encrypt(text) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv("aes-256-cbc", this.getKey(), iv);
        let encrypted = cipher.update(JSON.stringify(text), "utf8", "hex");
        encrypted += cipher.final("hex");
        return iv.toString("hex") + ":" + encrypted;
    }
    static decrypt(encryptedText) {
        const [ivHex, encrypted] = encryptedText.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", this.getKey(), iv);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return JSON.parse(decrypted);
    }
}
exports.Security = Security;
Security.DEFAULT_KEY = "Qrfsad4Iq02Ommpbsyomd30AAQ4";

# 📖 TREVA: A Secure Trace Events Activity Package

<br>

`TREVA` is a robust Node.js package designed for storing and managing event logs in a MongoDB database with built-in authenticated data encryption. This package simplifies the process of logging events while ensuring the confidentiality and integrity of sensitive data.

<br>

---

<br>

# ✨ Features

<br>

- **Secure Data Encryption:** Utilizes `AES-256-GCM` authenticated encryption to protect sensitive event data at rest.

- **Flexible Event Logging:** Allows for adding and retrieving both encrypted and unencrypted events.

- **Dynamic Collection Naming:** Automatically creates dedicated collections for each `eventType` for efficient data organization.

- **Environment-Based Configuration:** Securely loads critical connection and encryption keys from environment variables.

<br>

---

<br>

# 📦 Installation

<br>

To get started, install the `TREVA` package and its dependencies via npm.

```bash
npm install treva
```

<br>

---

<br>

# ⚙️ Configuration

<br>

The package relies on two crucial environment variables for secure operation. You must set these before running your application.

<br>

- **MONGO_URI:** The full MongoDB connection string. For example: `mongodb://localhost:27017/treva`.

- **ENCRYPTION_KEY:** A strong, randomly generated 32-byte encryption key for `AES-256-GCM`. It is critical to keep this key a secret.

<br>

```bash
# Example .env file content
MONGO_URI="mongodb://localhost:27017/treva"
ENCRYPTION_KEY="your-strong-random-key-here-of-32-bytes"
```

<br>

---

<br>

# 🚀 Usage

<br>

1. **Connect to the Database**

   First, you must establish a connection to your MongoDB instance. Ensure you have added `MONGO_URI` in your .env.

<br>

```typescript
import { Database } from "treva";

async function initialize() {
  try {
    await Database.connect();
    console.log("Database connection established.");
  } catch (err) {
    console.error("Failed to connect to database:", err);
  }
}

initialize();
```

<br>

---

<br>

2. **Add an Event**

    The `addEvent` method is used to securely log a new event into your database.

<br>

**Method Signature:**

```typescript
EventLogger.addEvent({
  eventType: string;
  eventName: string;
  data: object;
  encryption?: boolean;
  isOwn?: boolean;
});
```

<br>

**Parameters:**

- `eventType`: <span style="color:#FF6B6B;">(Required)</span> The type of event being logged (e.g., `"user"`, `"payment"`).

- `eventName`: <span style="color:#FF6B6B;">(Required)</span> The specific name of the event (e.g., `"user_login"`, `"credit_card_transaction"`).

- `data`: <span style="color:#FF6B6B;">(Required)</span> The event payload, which must be a JSON object.

- `encryption`: <span style="color:#A1E3A1;">(Optional)</span> A boolean flag to determine if the event's data should be encrypted before storage. Defaults to `false`.

- `isOwn`: <span style="color:#A1E3A1;">(Optional)</span> A boolean flag to control where the event is stored. Defaults to `true`.

<br>

**Behavior:**

- **Collection Management:** If `isOwn` is `true`, the event will be stored in a dedicated collection named `<eventType>_event_logs`. If `isOwn` is `false`, the event will be stored in the main `master_event_logs` collection.

- **Data Encryption:** If `encryption` is set to `true`, the `data` payload is encrypted using the provided `ENCRYPTION_KEY` before it is saved to the database. Otherwise, the data is stored as-is.

- **Mandatory Fields:** `eventType`, `eventName`, and `data` are all required parameters. If any of these are missing, the method will return an error.

<br>

---

<br>

3. **Retrieve Events**

   The getEvents method allows you to retrieve event logs with flexible filtering and pagination.

<br>

```typescript
EventLogger.getEvents({
  eventType: string;
  eventName: string;
  filter?: object;
  isEncrypted?: boolean;
  page?: number;
  limit?: number;
});
```

<br>

**Parameters:**

- `eventType`: <span style="color:#FF6B6B;">(Required)</span> The type of event to retrieve (e.g., `"user"`, `"payment"`).

- `eventName`: <span style="color:#FF6B6B;">(Required)</span> The specific name of the event (e.g., `"user_login"`, `"credit_card_transaction"`).

- `filter`: <span style="color:#A1E3A1;">(Optional)</span> An object to apply additional filters on the event's `data` field.

- `isFromMaster`: <span style="color:#A1E3A1;">(Optional)</span> A boolean flag that, when set to `true`, forces the query to run on the `master_event_logs` collection.

- `isEncrypted`: <span style="color:#A1E3A1;">(Optional)</span> A boolean flag to filter events by their encryption status. `true` fetches only encrypted data which will be automatically decrypted before being returned, while `false` fetches only unencrypted data.

- `page`: <span style="color:#A1E3A1;">(Optional)</span> The page number for pagination. Defaults to `1`.

- `limit`: <span style="color:#A1E3A1;">(Optional)</span> The maximum number of events to return per page. Defaults to `10`.

<br>

---

<br>

# 🛡️ Security

<br>

The security of your data depends entirely on the `ENCRYPTION_KEY`.

- **Do not hardcode your key**. Always use a secure environment variable.

- **Protect the key**. Store it securely and do not commit it to version control (e.g., using `.gitignore`).

- **Use a strong key**. A randomly generated 32-byte string is recommended.

<br>

---

<br>

# 📜 License

This project is licensed under the MIT License.

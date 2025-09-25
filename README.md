# 📖 Event-Tracker: A Secure Node.js Event Logging Package
<br>

`Event-Tracker` is a robust Node.js package designed for storing and managing event logs in a MongoDB database with built-in authenticated data encryption. This package simplifies the process of logging events while ensuring the confidentiality and integrity of sensitive data.
<br>
<br>

# ✨ Features
<br>

* **Secure Data Encryption:** Utilizes `AES-256-GCM` authenticated encryption to protect sensitive event data at rest.
* **Robust Database Management:** Provides an idempotent MongoDB connection and helper functions for collection management.
* **Flexible Event Logging:** Allows for adding and retrieving both encrypted and unencrypted events with a simple API.
* **Dynamic Collection Naming:** Automatically creates dedicated collections for each `eventType` for efficient data organization.
* **Environment-Based Configuration:** Securely loads critical connection and encryption keys from environment variables.

<br>

---
<br>

# 📦 Installation

<br>

To get started, install the `Event-Tracker` package and its dependencies via npm.

```bash
npm install event-tracker
```

<br>

# ⚙️ Configuration
<br>

The package relies on two crucial environment variables for secure operation. You must set these before running your application.

<br>

* **MONGO_URI:** The full MongoDB connection string. For example: `mongodb://localhost:27017/my-event-logs`.

* **ENCRYPTION_KEY:** A strong, randomly generated 32-byte encryption key for `AES-256-GCM`. It is critical to keep this key a secret.

<br>

```bash
# Example .env file content
MONGO_URI="mongodb://localhost:27017/my-event-logs"
ENCRYPTION_KEY="your-strong-random-key-here-of-32-bytes"
```

<br>

# 🚀 Usage

<br>

1. Connect to the Database

First, you must establish a connection to your MongoDB instance.

<br>

```typescript
import { Database } from "event-tracker";

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

2. Add an Event

You can add both encrypted and unencrypted events. By default, events are not encrypted.

<br>

```typescript
import { EventLogger } from "event-tracker";

// Adding an unencrypted event
EventLogger.addEvent({
  eventType: "user",
  eventName: "user_login",
  data: { userId: "john_doe", ipAddress: "192.168.1.1" }
});

// Adding an encrypted event
EventLogger.addEvent({
  eventType: "payment",
  eventName: "credit_card_transaction",
  data: { cardNumber: "1234-5678-...", amount: 99.99 },
  isEncrypted: true
});
```

<br>

3. Retrieve Events

You can retrieve events and filter them based on their type, name, and encryption status.

<br>

```typescript
import { EventLogger } from "event-tracker";

// Retrieve unencrypted user login events
const unencryptedEvents = await EventLogger.getEvents({
  eventType: "user",
  eventName: "user_login",
  isEncrypted: false
});
console.log(unencryptedEvents.data);

// Retrieve and decrypt encrypted payment events
const encryptedEvents = await EventLogger.getEvents({
  eventType: "payment",
  eventName: "credit_card_transaction",
  isEncrypted: true
});
console.log(encryptedEvents.data);
```

<br>
<br>

# 🛡️ Security

<br>

The security of your data depends entirely on the `ENCRYPTION_KEY`.

* **Do not hardcode your key**. Always use a secure environment variable.
* **Protect the key**. Store it securely and do not commit it to version control (e.g., using `.gitignore`).
* **Use a strong key**. A randomly generated 32-byte string is recommended.

<br>
<br>

# 📜 License

This project is licensed under the MIT License.



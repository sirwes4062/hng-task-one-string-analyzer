# 🧩 String Analyzer API

A simple RESTful API built with **Node.js** and **Express.js** that analyzes input strings and returns detailed properties such as length, palindrome status, character frequency, SHA-256 hash, and more.

---

## 🚀 Features
- Analyze any string and return key statistics
- Prevent duplicate entries using SHA-256 hash
- Handles invalid or missing input gracefully
- Rate limiting with `express-rate-limit`
- Supports local development with easy setup

---

## 🧱 Project Structure

```
string-analyzer/
│
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
├── README.md             # Project documentation
└── .env                  # Environment variables
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/sirwes4062/hng-task-one-string-analyzer
cd hng-task-one-string-analyzer
```

### 2️⃣ Install Dependencies
Make sure you have **Node.js (v18+)** installed, then run:
```bash
npm install
```

### 3️⃣ Start the Server
```bash
npm start
```
Or for development (with automatic reload):
```bash
npx nodemon server.js
```

The API will run at:
```
http://localhost:3000
```

---

## 🧠 Endpoints

### **POST /strings**
Analyze a new string.

#### Request
```json
{
  "value": "example string"
}
```

#### Successful Response (201 Created)
```json
{
  "id": "sha256_hash_value",
  "value": "example string",
  "properties": {
    "length": 14,
    "is_palindrome": false,
    "unique_characters": 10,
    "word_count": 2,
    "sha256_hash": "abc123...",
    "character_frequency_map": {
      "e": 2,
      "x": 1,
      ...
    }
  },
  "created_at": "2025-08-27T10:00:00Z"
}
```

#### Error Responses
- **400 Bad Request** – Missing `"value"` field  
- **409 Conflict** – String already exists  
- **422 Unprocessable Entity** – Invalid data type  

---

## 🔐 Environment Variables

Create a `.env` file (optional) if you want to customize:
```
PORT=3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=10
```

---

## 📦 Dependencies

| Package | Description |
|----------|-------------|
| express | Web framework for Node.js |
| crypto | Built-in Node.js module for hashing |
| express-rate-limit | Middleware for API rate limiting |
| dotenv | Loads environment variables from `.env` file  |

To install them manually:
```bash
npm install express express-rate-limit dotenv
```

---

## 🧹 Clear/Delete Endpoint Example

You can delete a stored string using:
```js
delete stringStore[hash];
```
This removes the analyzed string (by its hash key) from memory.

---

## 🧑‍💻 Author
**Salifu Williams Eneojo**  
📧 williamseneojo@example.com  

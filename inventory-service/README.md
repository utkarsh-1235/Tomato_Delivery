# 🧾 Inventory Service (Microservice)

## 📌 Overview

The **Inventory Service** manages product stock in a distributed food delivery system.
It ensures consistency of stock using:

* ✅ MongoDB (Persistence)
* ✅ Redis (Caching)
* ✅ Atomic DB updates (Concurrency safety)
* ✅ Microservice-ready design (Kafka-ready)

---

## ⚙️ Tech Stack

* **Framework**: NestJS
* **Database**: MongoDB (Mongoose)
* **Cache**: Redis (ioredis)
* **Testing**: Jest
* **Architecture**: Microservices (Kafka-ready)

---

## 🧠 Core Concepts

### 🔹 Available Stock

Actual stock available for purchase.

### 🔹 Reserved Stock

Temporarily locked stock during order processing.

---

## 🔄 Inventory Flow

```text
User places order
        ↓
ReserveItem → lock stock
        ↓
Payment Success → ConfirmItem
        ↓
Payment Failed → ReleaseStock
```

---

## 📦 APIs

### 1️⃣ Create Inventory Item

```http
POST /inventory/create
```

**Request Body**

```json
{
  "productId": "prod-1",
  "restaurantId": "rest-1",
  "productName": "Tomatoes",
  "description": "Fresh tomatoes",
  "availableStock": 100,
  "reserved": 0
}
```

---

### 2️⃣ Get Inventory by Product ID

```http
GET /inventory/:productId
```

✔ Uses Redis Cache
✔ TTL: 10 minutes

---

### 3️⃣ Reserve Stock

```http
POST /inventory/reserve
```

**Logic**

* Checks `availableStock >= quantity`
* Moves stock → reserved

```json
{
  "productId": "prod-1",
  "quantity": 5
}
```

---

### 4️⃣ Confirm Order (Payment Success)

```http
POST /inventory/confirm
```

**Logic**

* Checks `reserved >= quantity`
* Deducts from reserved (final purchase)

---

### 5️⃣ Release Stock (Payment Failed / Cancel)

```http
POST /inventory/release
```

**Logic**

* Checks `reserved >= quantity`
* Moves stock back to available

---

## 🧪 Test Coverage

### ✅ Covered Scenarios

* Create Inventory
* Get Inventory (Cache HIT / MISS)
* Reserve Stock
* Confirm Stock
* Release Stock

### 🧪 Run Tests

```bash
npm run test
```

---

## ⚡ Caching Strategy

| Operation   | Action           |
| ----------- | ---------------- |
| Get Item    | Cache Read       |
| Create Item | Cache Invalidate |
| Reserve     | Cache Invalidate |
| Confirm     | Cache Invalidate |
| Release     | Cache Invalidate |

---

## 🔐 Data Consistency

Atomic updates using MongoDB:

```ts
findOneAndUpdate({
  productId,
  availableStock: { $gte: quantity }
})
```

Prevents:

* Overselling ❌
* Negative stock ❌

---

## 🚀 Setup Instructions

### 1️⃣ Install Dependencies

```bash
npm install
```

---

### 2️⃣ Environment Variables

Create `.env`:

```env
MONGO_URI=mongodb://localhost:27017/inventory
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3005
```

---

### 3️⃣ Run Service

```bash
npm run start:dev
```

---

## 🐳 Docker Support

```bash
docker-compose up --build
```

---

## 📡 Future Enhancements

* 🔁 Kafka Integration (Event-driven)
* ⏳ Auto-release using Redis TTL
* 📊 Monitoring (Prometheus + Grafana)
* 🔐 Auth Integration
* 📦 Bulk Inventory APIs

---

## 🧩 Microservice Integration

| Service       | Interaction             |
| ------------- | ----------------------- |
| Order Service | Reserve stock           |
| Payment       | Confirm / Release stock |
| User Service  | Read-only (optional)    |

---

## 🏁 Conclusion

This Inventory Service ensures:

* ✅ Strong consistency
* ✅ High performance via caching
* ✅ Scalable microservice design
* ✅ Safe stock management

---

**Author**: Utkarsh Saxena
**Project**: Tomato Delivery (Microservices Architecture)

---

# 🧾 Order Service

## 📌 Overview

The **Order Service** is a microservice responsible for managing orders in the system.
It handles order creation, retrieval, updates, caching, and event-driven communication using Kafka.

---

## 🏗️ Tech Stack

* **NestJS** – Backend framework
* **MongoDB (Mongoose)** – NoSQL database
* **Redis** – Caching layer
* **Kafka** – Event-driven communication
* **Docker** – Containerization

---

## ⚙️ Features

* Create orders
* Get orders by user
* Get order by ID
* Update order
* Redis caching (read-through + invalidation)
* Kafka event publishing:

  * `order-created`
  * `order-updated`

---

## 📁 Project Structure

```
order-service/
│── src/
│   ├── orders/
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   ├── order.schema.ts
│   │   ├── dto/
│   │
│   ├── kafka/
│   │   ├── kafka.module.ts
│   │
│   ├── redis/
│   │   ├── redis.module.ts
│   │
│   ├── app.module.ts
│   ├── main.ts
│
│── .env
│── Dockerfile
│── package.json
```

---

## 🔑 Environment Variables (.env)

```
PORT=3004

DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/orderdb

REDIS_HOST=redis
REDIS_PORT=6379

KAFKA_BROKER=kafka:9092
```

---

## 🚀 Installation & Setup

### 1️⃣ Install dependencies

```
npm install
```

---

### 2️⃣ Run locally

```
npm run start:dev
```

---

### 3️⃣ Run with Docker

```
docker-compose up --build
```

---

## 🔌 Kafka Configuration

### Kafka Module

```ts
ClientsModule.register([
  {
    name: 'KAFKA_SERVICE',
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
      },
      consumer: {
        groupId: 'order-consumer',
      },
    },
  },
]);
```

---

### Connect Kafka in main.ts

```ts
app.connectMicroservice({
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['kafka:9092'],
    },
    consumer: {
      groupId: 'order-consumer',
    },
  },
});

await app.startAllMicroservices();
```

---

## 📡 Events

### 📤 Produced Events

| Event Name    | Description            |
| ------------- | ---------------------- |
| order-created | Triggered on new order |
| order-updated | Triggered on update    |

---

### Example Event Payload

```
{
  "userId": "4",
  "orderId": "abc123",
  "totalAmount": 500,
  "timestamp": "2026-04-22T10:00:00Z"
}
```

---

## 🧠 Redis Caching Strategy

### Cache Keys

```
orders:user:<userId>
order:<orderId>
```

### Flow

1. Check cache
2. If MISS → fetch from DB
3. Store in Redis (TTL: 600s)
4. Invalidate cache on create/update

---

## 📦 API Endpoints

### 1️⃣ Create Order

```
POST /orders
```

#### Request Body

```
{
  "userId": "4",
  "items": [
    {
      "productId": "p1",
      "quantity": 2,
      "price": 100
    }
  ],
  "totalAmount": 200
}
```

---

### 2️⃣ Get Orders by User

```
GET /orders/:userId
```

---

### 3️⃣ Get Order by ID

```
GET /orders/id/:id
```

---

### 4️⃣ Update Order

```
PUT /orders/:id
```

---

## 🧾 Order Schema

```ts
@Schema()
export class Order {
  @Prop()
  userId: string;

  @Prop([
    {
      productId: String,
      quantity: Number,
      price: Number,
    },
  ])
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];

  @Prop()
  totalAmount: number;
}
```

---

## 🔄 Order Flow (Architecture)

```
User → Order Service → MongoDB
                 ↓
              Redis Cache
                 ↓
              Kafka Event → Payment Service → Inventory Service
```

---

## 🧪 Testing Kafka

### Produce

```
kafka-console-producer --topic order-created --bootstrap-server localhost:9092
```

### Consume

```
kafka-console-consumer --topic order-created --bootstrap-server localhost:9092 --from-beginning
```

---

## ⚠️ Common Issues

### ❌ Kafka not sending events

* Missing `kafka.connect()`
* Wrong broker (`localhost` vs `kafka`)
* Microservice not started

---

### ❌ Redis connection error

* Check `REDIS_HOST`
* Ensure Redis container is running

---

### ❌ MongoDB connection error

* Check connection string
* Allow IP access in Atlas

---

## 🚀 Future Improvements

* Add Order Status (PENDING, CONFIRMED, FAILED)
* Integrate Payment Service
* Add Inventory Service
* Implement Saga Pattern
* Add retries & DLQ (Dead Letter Queue)

---

## 👨‍💻 Author

Utkarsh Saxena

---

## 📜 License

MIT

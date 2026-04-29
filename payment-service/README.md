# 💳 Payment Service - Tomato Delivery

## 📌 Overview
The Payment Service handles payment processing for orders in the Tomato Delivery microservices architecture. It consumes order events, processes payments, stores transaction data, and emits payment status events.

---

## 🏗️ Tech Stack
- Node.js (NestJS)
- TypeORM
- PostgreSQL
- Apache Kafka
- Docker

---

## 📁 Project Structure

payment-service/
│── src/
│ ├── payment/
│ │ ├── payment.controller.ts
│ │ ├── payment.service.ts
│ │ ├── payment.module.ts
│ │ ├── payment.entity.ts
│ │ └── dto/
│ │ └── create-payment.dto.ts
│ ├── app.module.ts
│ └── main.ts
│
│── .env
│── Dockerfile
│── package.json


---

## ⚙️ Environment Variables
Create a `.env` file inside `payment-service/`:


PORT=3010

DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=payment_db

KAFKA_BROKER=kafka:9092


---

## 🐳 Docker Configuration

### Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/main"]


---

## 🚀 Running the Service

From the `infrastructure/` folder:


docker-compose up --build


---

## 📡 Kafka Integration

### Consumed Events
- `order-created` → Trigger payment processing

### Produced Events
- `payment-success` → Payment completed successfully
- `payment-failed` → Payment failed

---

## 💳 Payment Entity

@Entity()
export class Payment {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column()
userId: string;

@Column()
orderId: string;

@Column()
amount: number;

@Column({ default: 'PENDING' })
status: string;

@CreateDateColumn()
createdAt: Date;
}


---

## 📥 DTO

export class CreatePaymentDto {
userId: string;
orderId: string;
totalAmount: number;
}


---

## 📡 Kafka Consumer

@EventPattern('order-created')
handleOrderCreated(data: any) {
return this.paymentService.processPayment(data);
}


---

## 📤 Kafka Producer

this.kafka.emit('payment-success', {
orderId: payment.orderId,
userId: payment.userId,
paymentId: payment.id,
});


---

## 🔁 Payment Flow

Order Service → Kafka (order-created)
↓
Payment Service (consume event)
↓
Process Payment
↓
Kafka (payment-success / payment-failed)
↓
Order Service updates order status


---

## ⚡ API Endpoints

### Get Payment by ID

GET /payments/:id


---

## 🧠 Features
- Event-driven architecture using Kafka
- Payment processing and tracking
- Loose coupling between services
- Independent database per service
- Scalable microservice design

---

## 🐞 Common Issues

### ❌ crypto is not defined
Cause: Node 18 in Docker  
Fix:

Use Node 20+ in Dockerfile


---

### ❌ Kafka connection error
Fix:

KAFKA_BROKER=kafka:9092


---

### ❌ Database connection error
Ensure PostgreSQL container is running and env variables are correct.

---

## 🚀 Future Improvements
- Integrate real payment gateways (Stripe, Razorpay)
- Add retry mechanism for failed payments
- Implement idempotency handling
- Use Saga pattern for distributed transactions

---

## 👨‍💻 Author
Utkarsh Saxena

---

## 📌 Summary
The Payment Service is responsible for:
- Processing payments
- Consuming order events
- Producing payment events
- Maintaining transaction records
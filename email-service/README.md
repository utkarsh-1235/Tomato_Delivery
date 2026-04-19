# 📧 Email Service (Kafka + NestJS + Nodemailer)

This service is responsible for sending emails based on Kafka events in a microservices architecture.

It listens to events like:
- user-created
- user-authenticated
- order-created (optional)

and sends emails using Gmail SMTP (Nodemailer).

---

## 🚀 Tech Stack

- NestJS
- Kafka (KafkaJS)
- Nodemailer
- Docker & Docker Compose

---

## 🧠 Architecture

User Service --> Kafka --> Email Service --> Email Sent  
Order Service --> Kafka --> Email Service --> Email Sent  

---

## 📦 Features

- Kafka event consumer
- Send welcome email on user registration
- Send login notification email
- Extendable for order/payment notifications

---

## ⚙️ Environment Variables

Create a `.env` file:

PORT=3002  
KAFKA_BROKER=kafka:9092  
EMAIL_USER=your-email@gmail.com  
EMAIL_PASS=your-app-password  

Note: Use Gmail App Password (not your actual password)

---

## 🔧 Kafka Topics

- user-created
- user-authenticated
- order-created (optional)

---

## 🏗️ Project Structure

src/
  email/
    email.controller.ts
    email.service.ts
  kafka/
    kafka.module.ts
  app.module.ts
  main.ts

---

## 🔌 Kafka Setup (main.ts)

app.connectMicroservice({
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['kafka:9092'],
    },
    consumer: {
      groupId: 'email-consumer',
    },
  },
});

await app.startAllMicroservices();

---

## 📥 Event Handlers

@EventPattern('user-created')
handleUserCreated(@Payload() message: any) {
  const data = message.value;
  return this.emailService.sendWelcomeEmail(data.email);
}

@EventPattern('user-authenticated')
handleLogin(@Payload() message: any) {
  const data = message.value;
  return this.emailService.sendWelcomeEmail(data.email);
}

Note: Do NOT use JSON.parse() as Kafka already provides parsed value

---

## 📤 Email Service

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendWelcomeEmail(to: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Welcome 🎉',
      text: 'Welcome to our platform!',
    });

    console.log('Email sent to:', to);
  }
}

---

## 🐳 Dockerfile

FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/main"]

---

## 🧩 docker-compose.yml (snippet)

email-service:
  build:
    context: ../email-service
  container_name: email-service
  ports:
    - "3002:3002"
  depends_on:
    - kafka
  env_file:
    - ../email-service/.env
  environment:
    - KAFKA_BROKER=kafka:9092

---

## ▶️ Run the Service

docker-compose up --build

---

## 🧪 Testing Flow

1. Call User Service Register API
2. Kafka emits user-created event
3. Email Service consumes event
4. Email is sent

---

## ⚠️ Common Issues

Email Authentication Error (535 / EAUTH)
- Use Gmail App Password
- Enable 2-Step Verification

Kafka Connection Issue
- Use kafka:9092 (not localhost inside Docker)

Event Not Received
- Ensure topic exists
- Restart services

JSON Parse Error
- Remove JSON.parse()

---

## 🔮 Future Improvements

- HTML email templates
- Retry mechanism
- Dead Letter Queue (DLQ)
- Notification service (SMS, push)

---

## 👨‍💻 Author

Utkarsh Saxena

---

## ⭐ Summary

This service demonstrates event-driven microservices using Kafka and asynchronous email processing.
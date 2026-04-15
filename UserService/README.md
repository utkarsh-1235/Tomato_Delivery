# 🚀 User Service - Scalable Backend (NestJS + PostgreSQL + Redis)

## 📌 Overview
This project is a **User Service** built using **NestJS**, designed for scalable applications like a **Food Delivery System**.  
It includes authentication, caching, and a modular architecture ready for microservices.

---

## 🧱 Tech Stack

- Backend Framework: NestJS
- Database: PostgreSQL (Supabase)
- ORM: TypeORM
- Caching: Redis (ioredis)
- Authentication: JWT (JSON Web Token)
- Password Hashing: bcrypt

---

## ⚙️ Features Implemented

### 👤 User Management
- User Registration
- User Login
- Fetch User Profile
- Update User Profile

### 🔐 Authentication
- JWT Token Generation
- Protected Routes using AuthGuard
- Token-based authorization

### ⚡ Caching (Redis)
- Cache user data for faster response
- Cache TTL (expiry)
- Cache invalidation on update

---

## 📁 Project Structure

src/
│
├── user/
│   ├── user.entity.ts
│   ├── UserRegisterdto.ts
│   ├── UserLoginDto.ts
│   ├── UserUpdateDto.ts
│
├── usercontroller/
│   └── usercontroller.controller.ts
│
├── userservices/
│   └── userservices.service.ts
│
├── user-module/
│   └── user-module.module.ts
│
├── redis/
│   ├── redis.module.ts
│   └── redis.provider.ts
│
├── auth/
│   └── jwt.strategy.ts
│
└── app.module.ts

---

## 🔄 Application Flow

Client Request
     ↓
Controller
     ↓
AuthGuard (JWT)
     ↓
Service Layer
     ↓
Redis Cache
   ↓      ↓
 HIT     MISS
 ↓        ↓
Return   Database (PostgreSQL)
           ↓
        Store Cache
           ↓
         Return

---

## 🔑 API Endpoints

### 📝 Register User
POST /users/register

### 🔐 Login User
POST /users/login

### 👤 Get Profile (Protected)
GET /users/profile?email=<email>

Headers:
Authorization: Bearer <token>

### ✏️ Update User
PUT /users/update?email=<email>

---

## 🛠️ Setup Instructions

### 1️⃣ Clone Repository
git clone <your-repo-url>
cd userservice

### 2️⃣ Install Dependencies
npm install

### 3️⃣ Setup Environment Variables

Create `.env` file:

DATABASE_URL=your_postgres_url
SECRET_KEY=your_jwt_secret
PORT=3001

---

### 4️⃣ Run PostgreSQL
Use Supabase or local PostgreSQL

---

### 5️⃣ Run Redis

Using Docker:
docker run -d -p 6379:6379 redis

Verify Redis:
docker exec -it <container_id> redis-cli

---

### 6️⃣ Start Application
npm run start:dev

---

## 🧪 Testing APIs
Use Postman or any API client.

---

## 🧠 Redis Commands (Debugging)

KEYS *
GET user:<email>
DEL user:<email>
FLUSHALL

---

## ⚠️ Important Notes

- Cache expires after defined TTL (e.g., 60 seconds)
- Cache is cleared when user updates profile
- JWT token is required for protected routes

---

## 🚀 Future Enhancements

- Refresh Token Implementation
- Role-Based Access Control (RBAC)
- Event-Driven Architecture (Redis Pub/Sub / Kafka)
- API Gateway Integration
- Microservices (Order, Payment, Restaurant)

---

## 🏁 Conclusion

This project demonstrates:
- Scalable backend architecture
- Secure authentication
- Performance optimization with Redis
- Real-world backend design patterns

---

## 👨‍💻 Author
Utkarsh Saxena
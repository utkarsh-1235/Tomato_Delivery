import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 Connect Kafka Microservice
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'], // ⚠️ IMPORTANT FIX
      },
      consumer: {
        groupId: 'email-consumer',
      },
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 10000));

  await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
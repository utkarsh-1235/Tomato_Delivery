import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './Kafka/kafka.module';
import { EmailModuleModule } from './emailsLogic/email-module/email-module.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
     isGlobal: true,   // 🔥 VERY IMPORTANT
    envFilePath: '.env',
     }),
  KafkaModule, EmailModuleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


  
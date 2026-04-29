import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentSchema } from './payment.schema';
import { KafkaModule } from 'src/Kafka/kafka.module';

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      TypeOrmModule.forFeature([PaymentSchema]),
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const dbUrl = config.get<string>('DATABASE_URL');
          // console.log('Loaded DB URL:', dbUrl); // ✅ correct place
      
          return {
            type: 'postgres',
            url: dbUrl,
            ssl: {
              rejectUnauthorized: false,
            },
            autoLoadEntities: true,
            synchronize: true,
            logging: true, // 🔥 enable logs
          };
        },
      }),
      KafkaModule
    ],
    providers: [PaymentService],
    controllers: [PaymentController]
})
export class PaymentModule {}

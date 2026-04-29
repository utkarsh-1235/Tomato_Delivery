import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
    imports: [
      ConfigModule,
        ClientsModule.registerAsync([
            {
              name: 'KAFKA_SERVICE',
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (config: ConfigService) => ({
                transport: Transport.KAFKA,
                options: {
                  client: {
                    clientId: 'payment-service', 
                    brokers: [config.get<string>('KAFKA_BROKER') || 'kafka:9092'],
                  },
                  consumer: {
                    groupId: 'payment-producer', 
                  },
                },
              }),
              
            },
          ]),
    ],
    exports: [ClientsModule]
})
export class KafkaModule{}
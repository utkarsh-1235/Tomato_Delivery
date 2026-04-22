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
                    clientId: 'order-service', 
                    brokers: [config.get<string>('KAFKA_BROKER') || 'kafka:9092'],
                  },
                  consumer: {
                    groupId: 'order-consumer', 
                  },
                },
              }),
              
            },
          ]),
    ],
    exports: [ClientsModule]
})
export class KafkaModule{}
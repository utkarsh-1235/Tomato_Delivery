import { Module } from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
    imports: [
        ClientsModule.register([
            {
              name: 'KAFKA_SERVICE',
              transport: Transport.KAFKA,
              options: {
                client: {
                  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
                },
                consumer: {
                  groupId: 'user-consumer',
                },
              },
            },
          ]),
    ],
    exports: [ClientsModule]
})
export class KafkaModule{}
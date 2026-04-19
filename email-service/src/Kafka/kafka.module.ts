import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
    imports: [
        ClientsModule.register([{
            name: 'KAFKA_SERVICE',
            transport: Transport.KAFKA,
            options: {
                 client: {
                    brokers: ['kafka:9092']
                 },
                 consumer: {
                    groupId: 'email-consumer'
                 }
            }

        }
        ])
    ],
    exports: [ClientsModule]
})
export class KafkaModule{}
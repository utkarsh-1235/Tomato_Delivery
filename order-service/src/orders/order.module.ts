import { Module } from '@nestjs/common';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, orderSchema } from './order/order.schema';
import { RedisModule } from './Redis/redis.module';
import { KafkaModule } from './kafka-events/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Order.name, schema: orderSchema}]),
    RedisModule,
    KafkaModule
  ],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}

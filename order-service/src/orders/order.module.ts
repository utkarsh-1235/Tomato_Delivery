import { Module } from '@nestjs/common';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, orderSchema } from './order/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Order.name, schema: orderSchema}])
  ],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}

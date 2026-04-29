import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model } from 'mongoose';
import { UpdateOrderDto } from './updateOrderDto';
import Redis from 'ioredis';
import { ClientKafka, EventPattern } from '@nestjs/microservices';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @Inject('KAFKA_SERVICE') private kafka: ClientKafka,
        @Inject('REDIS_CLIENT') private redis: Redis,
    ){}
  
    async createOrder(data: Order){
        const order = new this.orderModel(data);
        const savedOrder = await order.save();
        const cachedKey = `orders:user:${savedOrder.userId}`
        //Delete cache
        await this.redis.del(cachedKey);

        this.kafka.emit('order-created', {
            userId: savedOrder?.userId,
            orderId: savedOrder?._id,
            totalAmount: savedOrder?.totalAmount,
            timestamp: new Date()
        });
        
        return savedOrder;
    }

    async getOrderByUser(userId: string){
         
        const cachedKey = `orders:user:${userId}`
        //1 check orders in cache
        const cachedOrders = await this.redis.get(cachedKey);

        if (cachedOrders) {
            console.log('✅ Cache HIT');
            return JSON.parse(cachedOrders);
        }
        console.log('❌ Cache MISS');
        // 2 Fetch from database
         const userOrder = await this.orderModel.find({userId})

         //3 Update cache
         await this.redis.set(cachedKey,JSON.stringify(userOrder),'EX',600);

        return userOrder;
    }

    async getOrderById(id: string){
        const cachedKey = `order:${id}`;

        // 1 Check Cache
        const cachedOrder = await this.redis.get(cachedKey);
        if(cachedOrder){
            console.log('✅ Cache HIT');
            return JSON.parse(cachedOrder);
        }
        console.log('❌ Cache MISS');
        // 2 Fetch from database
        const order = await this.orderModel.findById(id);
        
        // 3 Update Cache
        await this.redis.set(cachedKey,JSON.stringify(order),'EX',600);
        return order;
    }

    async updateOrder(id: string, data: UpdateOrderDto) {
        const itemTotal = data.quantity * data.price;
        
        const cachedKey = `order:${id}`
        // Delete cache
        await this.redis.del(cachedKey);


        const updatedOrder = await this.orderModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    'items.$[item]': {
                        productId: data.productId,
                        quantity: data.quantity,
                        price: data.price,
                    },
                    totalAmount: itemTotal,
                },
            },
            {
                new: true,
                arrayFilters: [{ 'item.productId': data.productId }],
            },
        );
        if (!updatedOrder) {
            throw new Error('Order not found');
          }
        //Delete orders from users cache
        await this.redis.del(`orders:user:${updatedOrder?.userId}`);

        this.kafka.emit('order-updated', {
            id,
            userId: updatedOrder?.userId,
            orderId: updatedOrder?._id,
            totalAmount: updatedOrder?.totalAmount
        });

        return updatedOrder;
    }

    async confirmOrderUpdate(data: any){
        const { orderId, status } = data;

        console.log('📥 Payment event received:', data);
      
        const updatedOrder = await this.orderModel.findByIdAndUpdate(
          orderId,
          {
            status: status || 'CONFIRMED',
          },
          { new: true },
        );
      
        if (!updatedOrder) {
          throw new Error('Order not found');
        }
      
        // 🔥 Clear caches
        await this.redis.del(`order:${orderId}`);
        await this.redis.del(`orders:user:${updatedOrder.userId}`);
      
        return updatedOrder;
    }

}

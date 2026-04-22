import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model } from 'mongoose';
import { UpdateOrderDto } from './updateOrderDto';
import Redis from 'ioredis';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,

        @Inject('REDIS_CLIENT') private redis: Redis,
    ){}
  
    async createOrder(data){
        const order = new this.orderModel(data);
        const cachedKey = `orders:user:${data.userId}`
        //Delete cache
        await this.redis.del(cachedKey);
        
        return order.save();
    }

    async getOrderByUser(userId){
         
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

    async getOrderById(id){
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

        return this.orderModel.findByIdAndUpdate(
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
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model } from 'mongoose';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>
    ){}
  
    async createOrder(data){
        const order = new this.orderModel(data);
        return order.save();
    }

    async getOrderByUser(userId){
        const userOrder = await this.orderModel.find({userId})

        return userOrder;
    }

    async getOrderById(id){
        const order = await this.orderModel.findById(id);
        console.log(order)
        return order;
    }
}

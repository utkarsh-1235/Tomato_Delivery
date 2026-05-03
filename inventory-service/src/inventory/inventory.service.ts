import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Inventory } from './inventory.schema';
import { Model } from 'mongoose';
import { AddInventoryDto } from './inventory.dto';
import Redis from 'ioredis';

@Injectable()
export class InventoryService {
    constructor(
      @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
      @Inject('REDIS_CLIENT') private redis: Redis
    ){} 

    async createItem(data: AddInventoryDto) {
        const createdItem = new this.inventoryModel(data);
        const savedItem = await createdItem.save();
        const cachedKey = `inventory:${savedItem.productId}`

        await this.redis.del(cachedKey);
        return savedItem;
    }

    async getItemById(productId: string){
        const cachedKey = `inventory:${productId}`
        // 1. Check Cache
        const cache = await this.redis.get(cachedKey)
        if(cache){
          console.log('✅ Cache HIT');
          return JSON.parse(cache);
        }
        console.log('❌ Cache MISS');
        //  2. check in database
        const item = await this.inventoryModel.findOne({productId});
        // 3 set in cache
        if(!item){
        throw new ConflictException("Oops! Item not found");
        }
        await this.redis.set(cachedKey, JSON.stringify(item),'EX',600);
       return item;
    }

    async ReserveItem(body){
       const {productId, quantity} = body;
       if(!productId || !quantity){
         throw new ConflictException("Oops! Product and Quantity not found")
       }

       const updated = await this.inventoryModel.findOneAndUpdate(
        {
          productId,
          availableStock: {$gte: quantity}
        },
         { $inc: 
          {
            availableStock: -quantity,
            reserved: +quantity
         }},
        {new: true});

        if (!updated) throw new ConflictException('Not enough stock');
        await this.redis.del(`inventory:${productId}`);

       return updated;
    }

    async ConfirmItem(body){
      const {productId, quantity} = body;
       if(!productId || !quantity){
         throw new ConflictException("Oops! Product and Quantity not found")
       }

       const updated = await this.inventoryModel.findOneAndUpdate(
        {
          productId,
          
        },
         { $inc: 
          {
            reserved: -quantity
         }},
        {new: true});

        if (!updated) throw new ConflictException('Oops! Insufficient reserved stock');
        await this.redis.del(`inventory:${productId}`);

       return updated;
    }

    async ReleaseStock(body){
      const {productId, quantity} = body;
      if(!productId || !quantity){
        throw new ConflictException("Oops! Product and Quantity not found")
      }

      const updated = await this.inventoryModel.findOneAndUpdate(
       {
         productId,
       },
        { $inc: 
         {
          availableStock: +quantity,
           reserved: -quantity
        }},
       {new: true});

       if (!updated) throw new ConflictException('Oops! Insufficient Release stock');
       await this.redis.del(`inventory:${productId}`);

      return updated;

    }
}

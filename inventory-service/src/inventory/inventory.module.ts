import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from './inventory.schema';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Inventory.name, schema: InventorySchema}]),
    RedisModule],
  providers: [InventoryService],
  controllers: [InventoryController]
})
export class InventoryModule {}

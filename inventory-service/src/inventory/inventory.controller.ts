import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AddInventoryDto } from './inventory.dto';
import { ReservedInventory } from './reservedInventory.dto';

@Controller('inventory')
export class InventoryController {
    constructor(
        private inventoryService: InventoryService
    ){}

    @Post('create')
    createInventory(@Body() data: AddInventoryDto) {
        return this.inventoryService.createItem(data);
    }

    @Get(':productId')
    getInventoryById(@Param() productId: string){
        return this.inventoryService.getItemById(productId);
    }

    @Post('reserve')
    ReserveInventory(@Body() body: ReservedInventory){
      return this.inventoryService.ReserveItem(body);
    }

    @Post('confirm')
    ConfirmInventory(@Body() body: ReservedInventory){
      
    }

    @Post('release')
    ReleaseInventory(@Body() body: ReservedInventory){

    }
}

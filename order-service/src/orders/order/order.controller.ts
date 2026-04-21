import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
    constructor(private orderService: OrderService){}

    @Post()
    Create(@Body() body: any){
        return this.orderService.createOrder(body);
    }

    @Get('user/:userId')
    GetByUser(@Param('userId') userId: string){
        return this.orderService.getOrderByUser(userId);
    }

    @Get(':id')
    GetOrderById(@Param('id') id: string){
        return this.orderService.getOrderById(id);
    }
}

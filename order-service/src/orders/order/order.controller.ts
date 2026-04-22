import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './updateOrderDto';

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

    @Put('update/:id')
    updateOrderById(@Param('id') id: string, @Body() data: UpdateOrderDto){
        return this.orderService.updateOrder(id, data);
    }
}

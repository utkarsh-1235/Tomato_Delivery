import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './updateOrderDto';
import { EventPattern, Payload } from '@nestjs/microservices';

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

    @EventPattern('payment-success')
    handlePaymentSuccess(@Payload() message: any){
        console.log('📥 Event received:', message.value)
        const data = JSON.parse(message.value);
        
        return this.orderService.confirmOrderUpdate(data);
    }

    @EventPattern('payment-failed')
    handlePaymentFailed(@Payload() message: any){
        console.log('📥 Event received:', message.value)
        const data = JSON.parse(message.value);

        
    }

}

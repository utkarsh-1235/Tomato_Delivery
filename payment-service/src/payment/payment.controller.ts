import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './PaymentDto/CreatePayment.dto';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentController {
    constructor(private paymentService: PaymentService){}
    
   @EventPattern('order-created')
   async handleOrder(@Payload() message: any){
      const data = message.value;

      console.log('📥 Received order:', data);

         // 1. Create Payment
         const createPayment = await this.paymentService.createPayment({
            orderId: data.orderId,
            userId: data.userId,
            amount: data.amount
         })
      
         //2 Process Payment
         await this.paymentService.processPayment(createPayment)
   }
    
}

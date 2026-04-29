import { Inject, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './PaymentDto/CreatePayment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paymentStatus, PaymentSchema } from './payment.schema';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaymentSchema)
        private paymentRepository: Repository<PaymentSchema>,

        // @Inject('REDIS_CLIENT')
        // private redis: Redis,

        @Inject('KAFKA_SERVICE')
        private readonly kafka: ClientKafka,
    ) {}

    async createPayment(data: { orderId: string; userId: string; amount: number }) {
        const payment = this.paymentRepository.create({
            orderId: data.orderId,
            userId: data.userId,
            Amount: data.amount,
            status: paymentStatus.Pending,
        });

        return payment;
    }

    async processPayment(payment) {
        //Later will integrate with real payment gateway
        const success = true;

        payment.status = success ? 'Success' : 'Failed'

       this.kafka.emit(success ? 'payment-success' : 'payment-failed',{
            orderId: payment.orderId,
            userId: payment.userId,
            status: payment.status,   
       })
    }
}

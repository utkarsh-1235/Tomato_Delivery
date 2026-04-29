import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { paymentMethod } from "../payment.schema";

export class CreatePaymentDto{
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    // @IsEnum(paymentMethod)
    // @IsNotEmpty()
    // paymentMethod: paymentMethod

}
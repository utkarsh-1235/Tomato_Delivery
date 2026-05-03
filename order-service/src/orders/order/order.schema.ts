import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import mongoose, { Document } from "mongoose";

export type orderDocument = Order & Document;

@Schema({timestamps: true})
export class Order{
 @Prop({required: true})
 @IsString()
 @IsNotEmpty()
 userId: string;

 @Prop({type: Array, required: true})
 @IsArray()
 @IsNotEmpty()
  items: {
    productId: string,
    quantity: number;
    price: number;
  }[]

  @Prop({required: true})
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @Prop({default: 'Pending'})
  @IsString()
  @IsNotEmpty()
  status: string
}

export const orderSchema = SchemaFactory.createForClass(Order);
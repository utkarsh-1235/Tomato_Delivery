import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type orderDocument = Order & Document;

@Schema({timestamps: true})
export class Order{
 @Prop({required: true})
 userId: string;

 @Prop({type: Array, required: true})
  items: {
    productId: string,
    quantity: number;
    price: number;
  }[]

  @Prop({required: true})
  totalAmount: number;

  @Prop({default: 'Pending'})
  status: string
}

export const orderSchema = SchemaFactory.createForClass(Order);
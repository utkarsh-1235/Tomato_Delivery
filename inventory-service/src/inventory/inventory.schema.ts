import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import mongoose, {Document } from "mongoose";

export type inventoryDocument = Inventory & Document;

@Schema({timestamps: true})
export class Inventory{
 @Prop({required: true})
 @IsString()
 @IsNotEmpty()
 productId: string;

 @Prop({required: true})
 @IsString()
 @IsNotEmpty()
 restaurantId: string;

 @Prop({required: true})
 @IsString()
 @IsNotEmpty()
 productName: string;

 @Prop({required: true})
 @IsString()
 @IsNotEmpty()
 description: string;

 @Prop({required: true})
 @IsNumber()
 @IsNotEmpty()
 availableStock: number;

 @Prop({required: true})
 @IsNumber()
 @IsNotEmpty()
 reserved: number

 updatedAt: Date
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum paymentStatus{
    Pending = 'Pending',
    Success = 'Success',
    Failed = 'Failed'
}

export enum paymentMethod{
    Card = 'Card',
    Upi = 'UPI',
    Wallet = 'Wallet'
}

@Entity('payments')
export class PaymentSchema{
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column()
   userId: string;

   @Column()
   orderId: string;

   @Column()
   Amount: number;

   @Column({
    type: 'enum',
    enum: paymentStatus,
    default: paymentStatus.Pending
    })
    status: paymentStatus

    @Column({
        type: 'enum',
        enum: paymentMethod,
        default: paymentMethod.Upi
    })
    paymentMethod: paymentMethod;

    @Column()
    transactionId: string;
   
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}
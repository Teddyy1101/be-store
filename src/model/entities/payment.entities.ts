// src/payment/entities/payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entities';

export enum PaymentGateway {
  VIETQR = 'VIETQR',
  VNPAY = 'VNPAY',
  COD = 'COD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('Payment')
export class Payment {
  @PrimaryGeneratedColumn()
  paymentId: number;

  @Column()
  orderId: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({
    type: 'text',
    nullable: true,
  })
  paymentGateway: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  transactionCode: string;

  @Column({
    type: 'real',
    default: 0,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  // Thêm fields cho VietQR
  @Column({
    type: 'text',
    nullable: true,
  })
  qrCode: string; // Base64 QR code image

  @Column({
    type: 'text',
    nullable: true,
  })
  bankAccount: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  bankName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  accountName: string;
}

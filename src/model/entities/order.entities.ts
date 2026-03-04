import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entities';
import { OrderDetail } from './order-detail.entities';
import { Store } from './store.entities';
import { Payment } from './payment.entities';
import { Shipping } from './shipping.entities';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  WAITING_PICKUP = 'WAITING_PICKUP',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

@Entity('Order')
export class Order {
  @PrimaryGeneratedColumn()
  orderId: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  orderCode: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'real', default: 0 })
  totalAmount: number;

  @Column({ type: 'real', default: 0 })
  finalAmount: number;

  @Column({ type: 'text', nullable: true })
  paymentMethod: string;

  @Column({ type: 'real', nullable: true })
  shippingFee: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'text', nullable: true })
  customerAddress: string;

  @ManyToOne(() => Store, (store) => store.orders)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.DELIVERY,
  })
  orderType: OrderType;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updateAt: Date;

  @OneToMany(() => OrderDetail, (detail) => detail.order)
  orderDetails: OrderDetail[];

  @OneToOne(() => Shipping, (shipping) => shipping.order)
  shipping: Shipping;

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;
}

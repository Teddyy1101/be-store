import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entities';
import { Order } from './order.entities';

@Entity('Shipping')
export class Shipping {
  @PrimaryGeneratedColumn()
  shipId: number;

  @ManyToOne(() => Order, (order) => order.shipping, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({ type: 'text' })
  shippingType: string; // DELIVERY | PICKUP

  @Column({ type: 'real', nullable: true })
  distanceKm: number;

  @Column({ type: 'real', nullable: true })
  shippingFee: number;

  @Column({ type: 'text', nullable: true })
  estimatedTime: string;

  @Column({ type: 'datetime', nullable: true })
  deliveredAt: Date;
}

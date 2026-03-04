import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entities';
import { ProductOption } from './product-option.entities';

@Entity('OrderDetail')
export class OrderDetail {
  @PrimaryGeneratedColumn()
  detailId: number;

  @ManyToOne(() => Order, (order) => order.orderDetails)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => ProductOption)
  @JoinColumn({ name: 'optionId' })
  option: ProductOption;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'real', default: 0 })
  price: number;
}

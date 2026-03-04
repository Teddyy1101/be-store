import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entities';

@Entity('Store')
export class Store {
  @PrimaryGeneratedColumn()
  storeId: number;

  @Column({ type: 'text' })
  storeName: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'real', nullable: true })
  latitude: number;

  @Column({ type: 'real', nullable: true })
  longitude: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => Order, order => order.store)
  orders: Order[];
}

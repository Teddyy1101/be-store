import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entities';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['ORDER', 'MESSAGE', 'SYSTEM'],
  })
  type: 'ORDER' | 'MESSAGE' | 'SYSTEM';

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  // Người gửi thông báo
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderId' })
  sender?: User;

  // Người nhận thông báo
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver?: User;

  @Column({ default: false })
  isRead: boolean;

  // ID liên quan (vd: mã đơn hàng, mã sản phẩm...)
  @Column({ nullable: true })
  relatedId?: number;

  @Column({
    type: 'enum',
    enum: ['ORDER', 'REVIEW', 'PRODUCT', 'USER'],
    nullable: true,
  })
  relatedType?: 'ORDER' | 'REVIEW' | 'PRODUCT' | 'USER';

  @CreateDateColumn()
  createdAt: Date;
}

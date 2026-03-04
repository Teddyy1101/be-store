import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from './user.entities';
import { Product } from './product.entities';

@Entity('Favorite')
export class Favorite {
  @PrimaryGeneratedColumn()
  favId: number;

  // Quan hệ với User, lưu userId
  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // tạo cột userId trong bảng Favorite
  user: User;

  @Column()
  userId: number; // <-- thêm cột userId để lưu vào DB

  // Quan hệ với Product, lưu productId
  @ManyToOne(() => Product, (product) => product.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' }) // tạo cột productId trong bảng Favorite
  product: Product;

  @Column()
  productId: number; // <-- thêm cột productId để lưu vào DB

  @CreateDateColumn()
  createdAt: Date;
}

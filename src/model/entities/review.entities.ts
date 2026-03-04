import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entities';
import { User } from './user.entities';
import { ReviewImage } from './review-image.entities';

@Entity('Review')
export class Review {
  @PrimaryGeneratedColumn()
  reviewId: number;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'proId' })
  pro: Product;

  @ManyToOne(() => User, (user) => user.reviews, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Review, (review) => review.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Review;

  @OneToMany(() => Review, (review) => review.parent, {
    cascade: true,
  })
  replies: Review[];

  @OneToMany(() => ReviewImage, (image) => image.review, { 
    cascade: true,
    eager: false, // ✅ Tắt eager loading để tránh circular
  })
  images: ReviewImage[];

  @Column({ 
    type: 'int', 
    default: 0, // ✅ Default 0 = comment
  })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
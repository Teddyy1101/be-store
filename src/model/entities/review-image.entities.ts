import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Review } from './review.entities';

@Entity('ReviewImage')
export class ReviewImage {
  @PrimaryGeneratedColumn()
  imageId: number;

  @Column({ length: 500 })
  imageUrl: string;

  @ManyToOne(() => Review, (review) => review.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewId' })
  review: Review;
}

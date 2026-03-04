import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Brand } from './brand.entities';
import { Category } from './category.entities';
import { ProductImage } from './product-image.entity';
import { ProductSpecification } from './product-spec.entities';
import { ProductOption } from './product-option.entities';
import { Review } from './review.entities';
import { Favorite } from './favorite.entities';

@Entity('Product')
export class Product {
  @PrimaryGeneratedColumn()
  proId: number;

  @Column({ type: 'text' })
  proName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @ManyToOne(() => Brand, (brand) => brand.brandId, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @ManyToOne(() => Category, (category) => category.categoryId, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToOne(() => ProductSpecification, (spec) => spec.product, {
    cascade: true,
  })
  specification: ProductSpecification;

  @OneToMany(() => ProductOption, (option) => option.product, {
    cascade: true,
  })
  options: ProductOption[];

  @OneToMany(() => Review, (review) => review.pro)
  reviews: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];

  @Column({ type: 'mediumtext', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  soldCount: number;
}

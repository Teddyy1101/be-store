import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../entities/product.entities';

@Entity('ProductSpecification')
export class ProductSpecification {
  @PrimaryGeneratedColumn()
  specId: number;

  @ManyToOne(() => Product, (product) => product.specification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'proId' })
  product: Product;

  @Column({ type: 'text', nullable: true })
  os: string;

  @Column({ type: 'text', nullable: true })
  display: string;

  @Column({ type: 'text', nullable: true })
  cpu: string;

  @Column({ type: 'text', nullable: true })
  gpu: string;

  @Column({ type: 'text', nullable: true })
  ram: string;

  @Column({ type: 'text', nullable: true })
  rom: string;

  @Column({ type: 'text', nullable: true })
  cameraFront: string;

  @Column({ type: 'text', nullable: true })
  cameraRear: string;
  @Column({ type: 'text', nullable: true })
  battery: string;
  @Column({ type: 'text', nullable: true })
  weight: string;
  @Column({ type: 'text', nullable: true })
  size: string;
  @Column({ type: 'text', nullable: true })
  sim: string;
  @Column({ type: 'text', nullable: true })
  material: string;

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
}

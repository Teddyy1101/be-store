import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DiscountType = 'PERCENT' | 'AMOUNT';

@Entity('Discount')
export class Discount {
  @PrimaryGeneratedColumn()
  discountId: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['PERCENT', 'AMOUNT'] })
  discountType: DiscountType;

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  usageLimit: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'float', default: 0 })
  minOrderValue: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updateAt: Date;
}

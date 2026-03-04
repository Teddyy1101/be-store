import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Banner')
export class Banner {
  @PrimaryGeneratedColumn()
  bannerId: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  excerpt: string;

  @Column({ type: 'text', nullable: true })
  linkTarget: string;

  @Column({ type: 'text', nullable: true })
  position: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

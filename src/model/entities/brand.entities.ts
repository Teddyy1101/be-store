import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('Brand')
export class Brand {
  @PrimaryGeneratedColumn()
  brandId: number;

  @Column()
  brandName: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  brandLogo: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

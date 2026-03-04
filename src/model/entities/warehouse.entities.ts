import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductOption } from './product-option.entities';
import { Store } from './store.entities';

@Entity('Warehouse')
export class Warehouse {
  @PrimaryGeneratedColumn()
  warehouseId: number;

  @Column()
  optionId: number;

  @Column()
  storeId: number;

  @Column({ type: 'float', default: 0 })
  importPrice: number;

  @Column({ type: 'float', default: 0 })
  baseSalePrice: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastImportDate: Date;

  @ManyToOne(() => ProductOption)
  @JoinColumn({ name: 'optionId' })
  option: ProductOption;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entities';
import { ProductOption } from './product-option.entities';

@Entity('CartItem')
export class CartItem {
  @PrimaryGeneratedColumn()
  itemId: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne(() => ProductOption, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'optionId' })
  option: ProductOption;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'boolean', default: false })
  isChecked: boolean;
}

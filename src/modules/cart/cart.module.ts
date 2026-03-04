import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from '../../model/entities/cart.entities';
import { CartItem } from '../../model/entities/cart-item.entities';
import { User } from '../../model/entities/user.entities';
import { ProductOption } from '../../model/entities/product-option.entities';
import { Warehouse } from '../../model/entities/warehouse.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, User, ProductOption, Warehouse]),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}

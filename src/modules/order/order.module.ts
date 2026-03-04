import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ShippingModule } from '../shipping/shipping.module';
import { Order } from '../../model/entities/order.entities';
import { User } from '../../model/entities/user.entities';
import { NotificationModule } from '../notification/notification.module';
import { Store } from '../../model/entities/store.entities';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Store]), ShippingModule, NotificationModule, StoreModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

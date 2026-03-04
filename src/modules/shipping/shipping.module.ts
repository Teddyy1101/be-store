import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from '../../model/entities/shipping.entities';
import { Store } from '../../model/entities/store.entities';
import { Order } from '../../model/entities/order.entities';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipping, Store, Order]),
    NotificationModule,
  ],
  providers: [ShippingService],
  controllers: [ShippingController],
  exports: [ShippingService],
})
export class ShippingModule {}

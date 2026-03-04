import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetailService } from './order-detail.service';
import { OrderDetail } from '../../model/entities/order-detail.entities';
import { OrderDetailController } from './order-detail.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail])],
  providers: [OrderDetailService],
  controllers: [OrderDetailController],
  exports: [OrderDetailService],
})
export class OrderDetailModule {}

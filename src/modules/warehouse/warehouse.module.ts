import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { Warehouse } from '../../model/entities/warehouse.entities';
import { ProductOption } from '../../model/entities/product-option.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, ProductOption])],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}

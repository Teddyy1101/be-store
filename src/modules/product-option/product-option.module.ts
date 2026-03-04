import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOption } from '../../model/entities/product-option.entities';
import { Product } from '../../model/entities/product.entities';
import { ProductOptionService } from './product-option.service';
import { ProductOptionController } from './product-option.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOption, Product])],
  providers: [ProductOptionService],
  controllers: [ProductOptionController],
})
export class ProductOptionModule {}

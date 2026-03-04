import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../model/entities/product.entities';
import { ProductSpecificationService } from './product-specification.service';
import { ProductSpecificationController } from './product-specification.controller';
import { ProductSpecification } from '../../model/entities/product-spec.entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSpecification, Product])],
  providers: [ProductSpecificationService],
  controllers: [ProductSpecificationController],
})
export class ProductSpecificationModule {}

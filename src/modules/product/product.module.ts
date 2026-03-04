import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from '../../model/entities/product.entities';
import { Brand } from '../../model/entities/brand.entities';
import { Category } from '../../model/entities/category.entities';
import { ProductImage } from '../../model/entities/product-image.entity';
import { ProductSpecification } from '../../model/entities/product-spec.entities';
import { ProductOption } from '../../model/entities/product-option.entities';
@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Category, ProductImage, ProductSpecification, ProductOption])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}

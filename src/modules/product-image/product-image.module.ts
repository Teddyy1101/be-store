import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';
import { ProductImage } from '../../model/entities/product-image.entity';
import { Product } from '../../model/entities/product.entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage, Product])],
  providers: [ProductImageService],
  controllers: [ProductImageController],
})
export class ProductImageModule {}

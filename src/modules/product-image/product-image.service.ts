import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../model/entities/product.entities';
import { ProductImage } from '../../model/entities/product-image.entity';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private imageRepo: Repository<ProductImage>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findByProductId(proId: number) {
    return this.imageRepo.find({
      where: { product: { proId } },
      order: { isCover: 'DESC' },
    });
  }

  async addImage(
    proId: number,
    imageUrl: string,
    isCover = false,
  ): Promise<ProductImage> {
    const product = await this.productRepo.findOne({ where: { proId } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    // Nếu là cover, set tất cả cover khác = false
    if (isCover) {
      await this.imageRepo
        .createQueryBuilder()
        .update(ProductImage)
        .set({ isCover: false })
        .where('productId = :proId', { proId })
        .execute();
    }

    const image = this.imageRepo.create({ product, imageUrl, isCover });
    return this.imageRepo.save(image);
  }

  async removeImage(imgId: number) {
    const image = await this.imageRepo.findOne({ where: { imgId } });
    if (!image) throw new NotFoundException('Không tìm thấy ảnh');
    await this.imageRepo.remove(image);
  }
}

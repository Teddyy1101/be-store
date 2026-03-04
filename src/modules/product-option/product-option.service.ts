import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOption } from '../../model/entities/product-option.entities';
import { Product } from '../../model/entities/product.entities';
import {
  CreateProductOptionDto,
  UpdateProductOptionDto,
} from '../../model/dto/product-option.dto';

@Injectable()
export class ProductOptionService {
  constructor(
    @InjectRepository(ProductOption)
    private optionRepo: Repository<ProductOption>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<ProductOption[]> {
    return await this.optionRepo.find({ relations: ['product'] });
  }

  async findOne(id: number): Promise<ProductOption> {
    const option = await this.optionRepo.findOne({
      where: { optionId: id },
      relations: ['product'],
    });
    if (!option) throw new NotFoundException('Option not found');
    return option;
  }

  async create(dto: CreateProductOptionDto): Promise<ProductOption> {
    const product = await this.productRepo.findOne({
      where: { proId: dto.proId },
    });
    if (!product) throw new BadRequestException('Product not found');
    const option = this.optionRepo.create({ ...dto, product });
    return await this.optionRepo.save(option);
  }

  async update(
    id: number,
    dto: UpdateProductOptionDto,
  ): Promise<ProductOption> {
    const option = await this.findOne(id);
    Object.assign(option, dto);
    return await this.optionRepo.save(option);
  }

  async remove(id: number): Promise<void> {
    const option = await this.findOne(id);
    await this.optionRepo.remove(option);
  }

  async updateStatus(id: number, isActive: boolean): Promise<ProductOption> {
    const option = await this.findOne(id);
    option.isActive = isActive;
    return await this.optionRepo.save(option);
  }

  async findByProductId(proId: number): Promise<ProductOption[]> {
    const product = await this.productRepo.findOne({ where: { proId } });
    if (!product) throw new NotFoundException('Product not found');

    return await this.optionRepo.find({ where: { product: { proId } } });
  }

  async findProductByOptionId(optionId: number): Promise<Product> {
    const option = await this.optionRepo.findOne({
      where: { optionId },
      relations: ['product', 'product.category', 'product.brand', 'product.images'],
    });
    
    if (!option) {
      throw new NotFoundException(`Option with ID ${optionId} not found`);
    }
    
    if (!option.product) {
      throw new NotFoundException(`Product not found for option ID ${optionId}`);
    }
    
    return option.product;
  }
}
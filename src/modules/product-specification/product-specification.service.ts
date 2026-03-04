import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../model/entities/product.entities';
import { ProductSpecification } from '../../model/entities/product-spec.entities';
import { CreateProductSpecificationDto, UpdateProductSpecificationDto } from '../../model/dto/product-spec.dto';

@Injectable()
export class ProductSpecificationService {
  constructor(
    @InjectRepository(ProductSpecification)
    private specRepo: Repository<ProductSpecification>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<ProductSpecification[]> {
    return await this.specRepo.find({ relations: ['product'] });
  }

  async findOne(id: number): Promise<ProductSpecification> {
    const spec = await this.specRepo.findOne({ where: { specId: id }, relations: ['product'] });
    if (!spec) throw new NotFoundException('Specification not found');
    return spec;
  }

  async create(dto: CreateProductSpecificationDto): Promise<ProductSpecification> {
    const product = await this.productRepo.findOne({ where: { proId: dto.proId } });
    if (!product) throw new BadRequestException('Product not found');
    const spec = this.specRepo.create({ ...dto, product });
    return await this.specRepo.save(spec);
  }

  async update(id: number, dto: UpdateProductSpecificationDto): Promise<ProductSpecification> {
    const spec = await this.findOne(id);
    Object.assign(spec, dto);
    return await this.specRepo.save(spec);
  }

  async remove(id: number): Promise<void> {
    const spec = await this.findOne(id);
    await this.specRepo.remove(spec);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../../model/entities/product.entities';
import { Brand } from '../../model/entities/brand.entities';
import { Category } from '../../model/entities/category.entities';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../../model/dto/product.dto';
import slugify from 'slugify';
import { ProductImage } from '../../model/entities/product-image.entity';
import { ProductSpecification } from '../../model/entities/product-spec.entities';
import { ProductOption } from '../../model/entities/product-option.entities';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    @InjectRepository(ProductImage)
    private imageRepo: Repository<ProductImage>,

    @InjectRepository(ProductSpecification)
    private specRepo: Repository<ProductSpecification>,

    @InjectRepository(ProductOption)
    private optionRepo: Repository<ProductOption>,

    private dataSource: DataSource,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Product[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isDeleted = :isDeleted', { isDeleted: false });

    if (searchTerm) {
      query.andWhere(
        '(LOWER(product.proName) LIKE :search OR LOWER(product.description) LIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    const [data, total] = await query
      .orderBy('product.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(slugOrId: string | number): Promise<any> {
    let product;
    if (typeof slugOrId === 'number') {
      product = await this.productRepo.findOne({
        where: { proId: slugOrId, isDeleted: false },
        relations: ['brand', 'category', 'images'],
      });
    } else {
      product = await this.productRepo.findOne({
        where: { slug: slugOrId, isDeleted: false },
        relations: ['brand', 'category', 'images'],
      });
    }

    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    const specification = await this.specRepo.findOne({
      where: { product: { proId: product.proId } },
    });

    const options = await this.optionRepo.find({
      where: { product: { proId: product.proId }, isActive: true },
    });

    return {
      proId: product.proId,
      proName: product.proName,
      slug: product.slug,
      brand: {
        brandId: product.brand?.brandId,
        brandName: product.brand?.brandName,
      },
      category: {
        categoryId: product.category?.categoryId,
        categoryName: product.category?.categoryName,
      },
      description: product.description,
      viewCount: product.viewCount,
      soldCount: product.soldCount,
      origin: product.origin,
      warranty: product.warranty,
      images: product.images?.map((img) => ({
        imageId: img.imgId,
        imageUrl: img.imageUrl,
        isCover: img.isCover,
      })),
      specification: specification
        ? {
            specId: specification.specId,
            os: specification.os,
            display: specification.display,
            cpu: specification.cpu,
            gpu: specification.gpu,
            ram: specification.ram,
            rom: specification.rom,
            cameraFront: specification.cameraFront,
            cameraRear: specification.cameraRear,
            battery: specification.battery,
            weight: specification.weight,
            size: specification.size,
            sim: specification.sim,
            material: specification.material,
          }
        : null,
      options: options.map((o) => ({
        optionId: o.optionId,
        rom: o.rom,
        color: o.color,
        extraPrice: o.extraPrice,
      })),
    };
  }

  async create(
    dto: CreateProductDto,
    files: Express.Multer.File[],
    coverIndex: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exist = await this.productRepo.findOne({
        where: { proName: dto.proName },
      });
      if (exist) throw new BadRequestException('Tên sản phẩm đã tồn tại');

      const brand = await this.brandRepo.findOne({
        where: { brandId: dto.brandId },
      });
      if (!brand) throw new BadRequestException('Không tìm thấy thương hiệu');

      const category = await this.categoryRepo.findOne({
        where: { categoryId: dto.categoryId },
      });
      if (!category) throw new BadRequestException('Không tìm thấy danh mục');

      const productName = dto.proName || '';
      const nameWithoutAccents = productName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
      const slug = slugify(nameWithoutAccents, { lower: true, strict: true });

      const now = new Date();
      const product = queryRunner.manager.create(Product, {
        ...dto,
        slug,
        brand,
        category,
        description: dto.description,
        createdAt: now,
        updatedAt: now,
      });

      await queryRunner.manager.save(product);
      const indexCover = Number(coverIndex) || 0;

      if (files && files.length > 0) {
        const images = files.map((file, index) => {
          const image = new ProductImage();
          image.product = product;
          image.imageUrl = `/uploads/products/${file.filename}`;
          image.isCover = index === indexCover;
          return image;
        });
        await queryRunner.manager.save(ProductImage, images);
      }

      await queryRunner.commitTransaction();
      return this.findOne(product.proId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    slug: string,
    dto: UpdateProductDto,
    files?: Express.Multer.File[],
  ): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.productRepo.findOne({
        where: { slug },
        relations: ['brand', 'category', 'images'],
      });
      if (!product) throw new BadRequestException('Không tìm thấy sản phẩm');

      // Kiểm tra trùng tên (nếu có thay đổi)
      if (dto.proName && dto.proName !== product.proName) {
        const exist = await this.productRepo.findOne({
          where: { proName: dto.proName },
        });
        if (exist && exist.proId !== product.proId)
          throw new BadRequestException('Tên sản phẩm đã tồn tại');

        const nameWithoutAccents = dto.proName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        product.slug = slugify(nameWithoutAccents, {
          lower: true,
          strict: true,
        });
        product.proName = dto.proName;
      }

      // Cập nhật brand
      if (dto.brandId) {
        const brand = await this.brandRepo.findOne({
          where: { brandId: dto.brandId },
        });
        if (!brand) throw new BadRequestException('Không tìm thấy thương hiệu');
        product.brand = brand;
      }

      if (dto.categoryId) {
        const category = await this.categoryRepo.findOne({
          where: { categoryId: dto.categoryId },
        });
        if (!category) throw new BadRequestException('Không tìm thấy danh mục');
        product.category = category;
      }

      Object.assign(product, dto);
      product.updatedAt = new Date();

      await queryRunner.manager.save(product);

      if (files && files.length > 0) {
        await queryRunner.manager.delete('ProductImage', { product: product });
        const newImages = files.map((file, index) => {
          const image = new ProductImage();
          image.product = product;
          image.imageUrl = `/uploads/products/${file.filename}`;
          image.isCover = index === 0;
          return image;
        });

        await queryRunner.manager.save(ProductImage, newImages);
      }

      await queryRunner.commitTransaction();

      return await this.findOne(product.slug);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { proId: id },
      });

      if (!product) throw new BadRequestException('Không tìm thấy sản phẩm');

      // Chỉ đánh dấu sản phẩm là đã xóa
      product.isDeleted = true;
      await queryRunner.manager.save(Product, product);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async increaseView(slug: string): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { slug },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    product.viewCount += 1;
    await this.productRepo.save(product);
  }

  async changeStatus(id: number, isActive: boolean): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { proId: id, isDeleted: false },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    product.isActive = isActive;
    product.updatedAt = new Date();

    return this.productRepo.save(product);
  }

  async getByCategoryId(categoryId: number): Promise<Product[]> {
    // Kiểm tra category tồn tại
    const category = await this.categoryRepo.findOne({ where: { categoryId } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');

    // Lấy sản phẩm theo category, bao gồm brand, images và specification
    const products = await this.productRepo.find({
      where: { category: { categoryId }, isDeleted: false },
      relations: ['brand', 'images', 'specification'], // thêm 'specification' vào đây
      order: { proName: 'ASC' },
    });

    return products;
  }
}

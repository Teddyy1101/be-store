import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from '../../model/entities/brand.entities';
import { CreateBrandDto, UpdateBrandDto } from '../../model/dto/brand.dto';
import { Repository } from 'typeorm';
import slugify from 'slugify';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Brand[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.brandRepo.createQueryBuilder('brand').where('1 = 1'); // placeholder để có thể thêm andWhere

    if (searchTerm) {
      query.andWhere('LOWER(brand.brandName) LIKE :search', {
        search: `%${searchTerm}%`,
      });
    }

    const [data, total] = await query
      .orderBy('brand.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(brandId: number): Promise<Brand> {
    const brand = await this.brandRepo.findOneBy({ brandId });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    // 1. Kiểm tra tên brand trùng
    const exist = await this.brandRepo.findOne({
      where: { brandName: dto.brandName },
    });

    if (exist) {
      throw new BadRequestException('Thương hiệu đã tồn tại');
    }

    // 2. Chuyển tên sang không dấu
    const nameWithoutAccents = dto.brandName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
      .replace(/đ/g, 'd') // chuyển đ -> d
      .replace(/Đ/g, 'D'); // chuyển Đ -> D

    // 3. Tạo slug từ tên đã bỏ dấu
    const generatedSlug = slugify(nameWithoutAccents, {
      lower: true,
      strict: true, // loại bỏ ký tự lạ
      trim: true,
    });

    // 4. Kiểm tra slug trùng (nếu có)
    const slugExists = await this.brandRepo.findOne({
      where: { slug: generatedSlug },
    });

    if (slugExists) {
      throw new BadRequestException('Slug đã tồn tại, hãy đổi tên thương hiệu');
    }

    // 5. Tạo entity
    const brand = this.brandRepo.create({
      ...dto,
      slug: generatedSlug,
    });

    // 6. Lưu vào DB
    return this.brandRepo.save(brand);
  }

  async update(id: number, dto: UpdateBrandDto) {
    const brand = await this.findOne(id);
    if (dto.brandName && dto.brandName !== brand.brandName) {
      const exist = await this.brandRepo.findOne({
        where: { brandName: dto.brandName },
      });

      if (exist) {
        throw new BadRequestException('Thương hiệu đã tồn tại');
      }
    }
    Object.assign(brand, dto);
    return this.brandRepo.save(brand);
  }

  async remove(id: number) {
    const brand = await this.findOne(id);
    return this.brandRepo.remove(brand);
  }

  async checkName(name: string): Promise<boolean> {
    const exist = await this.brandRepo.findOne({
      where: { brandName: name },
    });
    return !!exist;
  }

  async updateStatus(slug: string, isActive: boolean): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { slug } });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    brand.isActive = isActive;
    return this.brandRepo.save(brand);
  }
}

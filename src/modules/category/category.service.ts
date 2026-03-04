import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../model/entities/category.entities';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../model/dto/category.dto';
import slugify from 'slugify';
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll(
    params: { page?: number; limit?: number; search?: string } = {},
  ): Promise<{ data: Category[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.categoryRepo.createQueryBuilder('category').where('1=1'); // base query

    if (searchTerm) {
      query.andWhere(
        '(LOWER(category.categoryName) LIKE :search OR LOWER(category.description) LIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    const [data, total] = await query
      .orderBy('category.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(idOrSlug: number | string): Promise<Category> {
    let category;

    if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
      // 🔹 Trường hợp là ID
      category = await this.categoryRepo.findOne({
        where: { categoryId: Number(idOrSlug) },
      });
    } else {
      // 🔹 Trường hợp là slug
      category = await this.categoryRepo.findOne({
        where: { slug: idOrSlug },
      });
    }

    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exist = await this.categoryRepo.findOne({
      where: { categoryName: dto.categoryName },
    });
    if (exist) throw new BadRequestException('Tên danh mục đã tồn tại');
    const nameWithoutAccents = dto.categoryName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
    const slug = slugify(nameWithoutAccents, { lower: true, strict: true });
    const now = new Date();
    const category = this.categoryRepo.create({
      ...dto,
      slug,
      createdAt: now,
      updatedAt: now,
    });

    return await this.categoryRepo.save(category);
  }

  async update(slug: string, dto: UpdateCategoryDto): Promise<Category> {
    const exist = await this.categoryRepo.findOne({
      where: { categoryName: dto.categoryName },
    });

    if (exist && exist.slug !== slug) {
      throw new BadRequestException('Tên danh mục đã tồn tại');
    }
    const category = await this.findOne(slug);
    if (!category) throw new BadRequestException('Không tìm thấy danh mục');
    Object.assign(category, dto);
    if (dto.categoryName) {
      const nameWithoutAccents = dto.categoryName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      category.slug = slugify(nameWithoutAccents, {
        lower: true,
        strict: true,
      });
    }
    category.updatedAt = new Date();
    return await this.categoryRepo.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);
  }

  async checkName(name: string): Promise<boolean> {
    const exist = await this.categoryRepo.findOne({
      where: { categoryName: name },
    });
    return !!exist;
  }

  async updateStatus(slug: string, isActive: boolean): Promise<Category> {
    const brand = await this.categoryRepo.findOne({ where: { slug } });
    if (!brand) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    brand.isActive = isActive;
    return this.categoryRepo.save(brand);
  }
}

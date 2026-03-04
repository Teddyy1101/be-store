import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Banner } from '../../model/entities/banner.entities';
import { CreateBannerDto, UpdateBannerDto } from '../../model/dto/banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  async findAll(
    params: { page?: number; limit?: number; search?: string } = {},
  ): Promise<{ data: Banner[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.bannerRepo.createQueryBuilder('banner').where('1=1');

    // Nếu có search → tìm theo title hoặc description
    if (searchTerm) {
      query.andWhere(
        '(LOWER(banner.title) LIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    const [data, total] = await query
      .orderBy('banner.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findActive(): Promise<Banner[]> {
    const now = new Date();
    return await this.bannerRepo.find({
      where: [
        {
          isActive: true,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { bannerId: id } });
    if (!banner) throw new NotFoundException('Không tìm thấy banner');
    return banner;
  }

  async create(dto: CreateBannerDto, imageUrl?: string): Promise<Banner> {
    const existingBanner = await this.bannerRepo.findOne({
      where: { title: dto.title },
    });

    if (existingBanner) {
      throw new BadRequestException(`Banner với tiêu đề đã tồn tại`);
    }

    const banner = this.bannerRepo.create({
      ...dto,
      imageUrl: imageUrl ?? dto.imageUrl ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.bannerRepo.save(banner);
  }

  async update(
    id: number,
    dto: UpdateBannerDto,
    imageUrl?: string,
  ): Promise<Banner> {
    const banner = await this.findOne(id);
    if (dto.title) {
      const duplicate = await this.bannerRepo.findOne({
        where: { title: dto.title },
      });

      if (duplicate && duplicate.bannerId !== id) {
        throw new BadRequestException(`Banner với tiêu đề đã tồn tại`);
      }
    }

    Object.assign(banner, dto);
    if (imageUrl) banner.imageUrl = imageUrl;
    banner.updatedAt = new Date();

    return await this.bannerRepo.save(banner);
  }

  async remove(id: number): Promise<{ message: string }> {
    const banner = await this.findOne(id);
    await this.bannerRepo.delete(id);
    return { message: `Xóa banner thành công` };
  }

  async updateStatus(bannerId: number, isActive: boolean): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { bannerId } });
    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }
    banner.isActive = isActive;
    return this.bannerRepo.save(banner);
  }
}

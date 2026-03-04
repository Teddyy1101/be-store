import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from '../../model/entities/discount.entities';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
  ) {}

  async create(data: Partial<Discount>) {
    const existing = await this.discountRepo.findOne({
      where: { code: data.code },
    });
    if (existing) {
      throw new BadRequestException(`Mã giảm giá đã tồn tại`);
    }

    const discount = this.discountRepo.create(data);
    return await this.discountRepo.save(discount);
  }

  async findAll(
    params: { page?: number; limit?: number; search?: string } = {},
  ): Promise<{ data: Discount[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.discountRepo.createQueryBuilder('discount').where('1=1');

    if (searchTerm) {
      query.andWhere(
        '(LOWER(discount.code) LIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    const [data, total] = await query
      .orderBy('discount.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number) {
    const discount = await this.discountRepo.findOne({
      where: { discountId: id },
    });
    if (!discount) throw new NotFoundException('Mã giảm giá ko tồn tại');
    return discount;
  }

  async update(id: number, data: Partial<Discount>) {
    const discount = await this.findOne(id);
    if (data.code && data.code !== discount.code) {
      const existing = await this.discountRepo.findOne({
        where: { code: data.code },
      });
      if (existing) {
        throw new BadRequestException(`Mã giảm giá đã tồn tại`);
      }
    }

    Object.assign(discount, data);
    return await this.discountRepo.save(discount);
  }

  async delete(id: number) {
    const discount = await this.findOne(id);
    return await this.discountRepo.remove(discount);
  }

  async applyDiscount(code: string, orderTotal: number) {
    const discount = await this.discountRepo.findOne({
      where: { code, isActive: true },
    });
    if (!discount) throw new NotFoundException('Mã giảm giá không hợp lệ');

    const now = new Date();
    if (now < new Date(discount.startDate) || now > new Date(discount.endDate))
      throw new NotFoundException(
        'Mã giảm giá đã hết hạn hoặc chưa có hiệu lực',
      );

    if (orderTotal < discount.minOrderValue)
      throw new NotFoundException('Đơn hàng không đủ điều kiện');

    let discountAmount = 0;

    if (discount.discountType === 'PERCENT') {
      discountAmount = (orderTotal * discount.value) / 100;
    } else if (discount.discountType === 'AMOUNT') {
      discountAmount = discount.value;
    }

    const finalPrice = Math.max(orderTotal - discountAmount, 0);

    return {
      originalPrice: orderTotal,
      discountAmount,
      finalPrice,
      discountCode: discount.code,
      type: discount.discountType,
    };
  }

  async updateStatus(discountId: number, isActive: boolean): Promise<Discount> {
    const discount = await this.discountRepo.findOne({ where: { discountId } });
    if (!discount) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    discount.isActive = isActive;
    return this.discountRepo.save(discount);
  }
}

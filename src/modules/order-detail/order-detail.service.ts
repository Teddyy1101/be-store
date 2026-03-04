import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDetailDto } from '../../model/dto/order-detail.dto';
import { OrderDetail } from '../../model/entities/order-detail.entities';

@Injectable()
export class OrderDetailService {
  constructor(
    @InjectRepository(OrderDetail)
    private orderDetailRepo: Repository<OrderDetail>,
  ) {}

  async create(dto: CreateOrderDetailDto) {
    const detail = this.orderDetailRepo.create(dto);
    return this.orderDetailRepo.save(detail);
  }

  async findAll() {
    return this.orderDetailRepo.find({
      relations: ['order', 'option'],
    });
  }

  async findByOrder(
    orderId: number,
    params: { page?: number; limit?: number; search?: string },
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;

    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.orderDetailRepo
      .createQueryBuilder('detail')
      .leftJoinAndSelect('detail.order', 'order')
      .leftJoinAndSelect('detail.option', 'option')
      .where('order.orderId = :orderId', { orderId });

    if (searchTerm) {
      query.andWhere(
        '(LOWER(option.optionName) LIKE :search OR LOWER(option.optionCode) LIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    const [details, total] = await query
      .orderBy('detail.detailId', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data: details, total };
  }
}

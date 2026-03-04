import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../model/entities/store.entities';
import { CreateStoreDto, UpdateStoreDto } from '../../model/dto/store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepo.create(dto);
    return await this.storeRepo.save(store);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Store[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.storeRepo.createQueryBuilder('store').where('1 = 1'); // để dễ andWhere

    if (searchTerm) {
      query.andWhere('LOWER(store.storeName) LIKE :search', {
        search: `%${searchTerm}%`,
      });
    }

    const [data, total] = await query
      .orderBy('store.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { storeId: id } });
    if (!store) throw new NotFoundException('Cửa hàng không tồn tại');
    return store;
  }

  async update(id: number, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    Object.assign(store, dto);
    return await this.storeRepo.save(store);
  }

  async remove(id: number): Promise<void> {
    const store = await this.findOne(id);
    await this.storeRepo.remove(store);
  }

  async toggleStatus(id: number): Promise<Store> {
    const store = await this.findOne(id);
    store.isActive = !store.isActive;
    return await this.storeRepo.save(store);
  }
}

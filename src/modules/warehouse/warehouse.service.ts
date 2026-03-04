import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../model/entities/warehouse.entities';
import { CreateWarehouseDto } from '../../model/dto/warehouse.dto';
import { ProductOption } from '../../model/entities/product-option.entities';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,

    @InjectRepository(ProductOption)
    private readonly optionRepo: Repository<ProductOption>,
  ) {}

  // Lấy toàn bộ danh sách hàng trong kho
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Warehouse[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    // Build query
    const query = this.warehouseRepo
      .createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.option', 'option')
      .leftJoinAndSelect('option.product', 'product')
      .leftJoinAndSelect('warehouse.store', 'store');

    if (searchTerm) {
      query.andWhere('LOWER(product.proName) LIKE :search', {
        search: `%${searchTerm}%`,
      });
    }

    const [data, total] = await query
      .skip(offset)
      .take(limit)
      .orderBy('warehouse.lastImportDate', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  // Tìm hàng trong kho theo option + store (nếu có)
  async findByOption(optionId: number, storeId: number) {
    return await this.warehouseRepo.findOne({
      where: { optionId, storeId },
      relations: ['option', 'store'],
    });
  }

  // Cập nhật số lượng (tăng/giảm)
  async updateQuantity(optionId: number, storeId: number, delta: number) {
    const item = await this.findByOption(optionId, storeId);
    if (!item) throw new NotFoundException('Không tìm thấy hàng trong kho');

    const newQty = item.quantity + delta;
    if (newQty < 0) throw new BadRequestException('Không đủ hàng trong kho');

    item.quantity = newQty;
    item.lastImportDate = new Date();
    return await this.warehouseRepo.save(item);
  }

  // Nhập kho (tự tạo mới nếu chưa có)
  async importStock(dto: CreateWarehouseDto) {
    // Kiểm tra optionId có tồn tại không
    const option = await this.optionRepo.findOne({
      where: { optionId: dto.optionId },
      relations: ['product'],
    });
    if (!option)
      throw new NotFoundException('Không tìm thấy tùy chọn sản phẩm');

    // Kiểm tra trong kho có sẵn chưa
    let item = await this.findByOption(dto.optionId, dto.storeId);

    if (!item) {
      // Nếu chưa có → tạo mới
      item = this.warehouseRepo.create({
        optionId: dto.optionId,
        storeId: dto.storeId,
        quantity: dto.quantity,
        importPrice: dto.importPrice,
        baseSalePrice: dto.baseSalePrice,
        lastImportDate: new Date(),
      });
    } else {
      // Nếu đã có → cộng dồn số lượng
      item.quantity += dto.quantity;
      item.importPrice = dto.importPrice ?? item.importPrice;
      item.baseSalePrice = dto.baseSalePrice ?? item.baseSalePrice;
      item.lastImportDate = new Date();
    }

    return await this.warehouseRepo.save(item);
  }

  async findByOptionId(optionId: number) {
    return await this.warehouseRepo.findOne({
      where: { optionId },
      relations: ['option', 'store'],
    });
  }
  async findStockByProductId(productId: number, storeId?: number) {
    const query = this.warehouseRepo
      .createQueryBuilder('warehouse')
      .leftJoin('warehouse.option', 'option')
      .leftJoin('option.product', 'product')
      .leftJoinAndSelect('warehouse.store', 'store')
      .select([
        'warehouse.warehouseId AS "warehouseId"',
        'warehouse.optionId AS "optionId"',
        'warehouse.storeId AS "storeId"',
        'warehouse.importPrice AS "importPrice"',
        'warehouse.baseSalePrice AS "baseSalePrice"',
        'warehouse.quantity AS "quantity"',
        'warehouse.lastImportDate AS "lastImportDate"',
        'option.rom AS "rom"',
        'option.color AS "color"',

        // Store
        'store.storeId AS "storeId"',
        'store.storeName AS "storeName"',
      ])
      .where('product.proId = :productId', { productId });

    if (storeId) {
      query.andWhere('warehouse.storeId = :storeId', { storeId });
    }

    return await query.getRawMany(); // getRawMany trả về các alias rõ ràng
  }
}

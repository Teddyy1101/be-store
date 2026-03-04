import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  OrderStatus,
  OrderType,
} from '../../model/entities/order.entities';
import { User } from '../../model/entities/user.entities';
import { ShippingService } from '../shipping/shipping.service';
import { CreateOrderDto, UpdateOrderDto } from '../../model/dto/order.dto';
import { NotificationService } from '../notification/notification.service';
import { Store } from '../../model/entities/store.entities';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly shippingService: ShippingService,
    private readonly notificationService: NotificationService,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  // 🧾 Tạo đơn hàng mới
  async create(dto: CreateOrderDto) {
    const user = await this.userRepo.findOne({ where: { userId: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const store = await this.storeRepo.findOne({
      where: { storeId: dto.storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    // Tạo mã đơn hàng tự động
    const countToday = await this.orderRepo
      .createQueryBuilder('order')
      .where('DATE(order.createdAt) = CURDATE()')
      .getCount();

    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const code = `ORD-${datePart}-${(countToday + 1).toString().padStart(4, '0')}`;

    const order = this.orderRepo.create({
      user, // Bỏ ?? undefined vì user đã được check not null ở trên
      orderCode: code,
      orderType: dto.orderType ?? OrderType.DELIVERY,
      totalAmount: dto.totalAmount,
      finalAmount: dto.finalAmount ?? dto.totalAmount,
      customerAddress: dto.customerAddress,
      note: dto.note ?? '',
      store: store,
      status: dto.status ?? OrderStatus.PENDING,
      paymentMethod: dto.paymentMethod ?? '',
    });

    await this.orderRepo.save(order);

    // Nếu là giao hàng thì tạo shipping
    if (dto.orderType === OrderType.DELIVERY) {
      // Gắn phí ship
      order.shippingFee = 0;
      await this.orderRepo.save(order);
    }

    // Gửi thông báo
    await this.notificationService.create({
      type: 'ORDER',
      title: `Đơn hàng mới #${order.orderCode}`,
      content: `${user.fullName} vừa đặt một đơn hàng mới.`,
      senderId: user.userId,
      receiverId: 1, // admin?
      relatedId: order.orderId,
      relatedType: 'ORDER',
    });

    // Trả về order đầy đủ (có thể populate thêm nếu bạn muốn)
    return order;
  }

  async findAll(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      orderType?: string;
      dateFrom?: string; // yyyy-mm-dd
      dateTo?: string; // yyyy-mm-dd
    } = {},
  ): Promise<{ data: Order[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.shipping', 'shipping')
      // Join đến bảng payment thông qua orderId
      .leftJoinAndSelect('order.payment', 'payment')
      // Hoặc nếu relation chưa có, dùng cách này:
      // .leftJoinAndSelect('payment', 'payment', 'payment.orderId = order.id')
      .where('1=1');

    // Filter theo search term
    if (searchTerm) {
      query.andWhere(
        `(LOWER(order.orderCode) LIKE :search 
      OR LOWER(user.fullName) LIKE :search)`,
        { search: `%${searchTerm}%` },
      );
    }

    // Filter theo status
    if (params.status && params.status !== 'all') {
      query.andWhere('order.status = :status', { status: params.status });
    }

    // Filter theo orderType
    if (params.orderType && params.orderType !== 'all') {
      query.andWhere('order.orderType = :orderType', {
        orderType: params.orderType,
      });
    }

    // Filter theo khoảng ngày
    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      query.andWhere('order.createdAt >= :fromDate', { fromDate });
    }

    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      toDate.setHours(23, 59, 59, 999);
      query.andWhere('order.createdAt <= :toDate', { toDate });
    }

    const [data, total] = await query
      .orderBy('order.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  findOne(id: number) {
    return this.orderRepo.findOne({
      where: { orderId: id },
      relations: ['user', 'shipping', 'payment'],
    });
  }

  // ⚙️ Cập nhật trạng thái đơn hàng
  async updateStatus(id: number, dto: UpdateOrderDto) {
    const order = await this.orderRepo.findOne({
      where: { orderId: id },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    Object.assign(order, dto);
    await this.orderRepo.save(order);

    await this.notificationService.create({
      type: 'ORDER',
      title: `Trạng thái đơn hàng #${order.orderCode}`,
      content: `Đơn hàng của bạn đã được cập nhật sang trạng thái: ${order.status}`,
      senderId: 1, // admin
      receiverId: order.user.userId,
      relatedId: order.orderId,
      relatedType: 'ORDER',
    });

    return order;
  }

  remove(id: number) {
    return this.orderRepo.delete(id);
  }

  async getSoldQuantityByProduct(productId: number) {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .innerJoin('order.orderDetails', 'detail')
      .innerJoin('detail.option', 'option')
      .innerJoin('option.product', 'product')
      .select('product.proId', 'proId')
      .addSelect('product.proName', 'proName')
      .addSelect('SUM(detail.quantity)', 'soldQuantity')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('product.proId = :productId', { productId })
      .groupBy('product.proId')
      .addGroupBy('product.proName')
      .getRawOne();

    // Nếu không tìm thấy, lấy thông tin sản phẩm và set soldQuantity = 0
    if (!result) {
      const product = await this.orderRepo.manager
        .createQueryBuilder()
        .select('proId', 'proId')
        .addSelect('proName', 'proName')
        .from('Product', 'product')
        .where('proId = :productId', { productId })
        .getRawOne();

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      return {
        proId: product.proId,
        proName: product.proName,
        soldQuantity: '0',
      };
    }

    return result;
  }

  async findByUser(
    userId: number,
    params: { page?: number; limit?: number; search?: string } = {},
  ): Promise<{ data: Order[]; total: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const searchTerm = params.search?.trim().toLowerCase() || '';

    const query = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.shipping', 'shipping')
      .leftJoinAndSelect('order.payment', 'payment')
      .where('user.userId = :userId', { userId });

    if (searchTerm) {
      query.andWhere(
        `(LOWER(order.orderCode) LIKE :search 
        OR LOWER(order.status) LIKE :search)`,
        { search: `%${searchTerm}%` },
      );
    }

    const [data, total] = await query
      .orderBy('order.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }
}

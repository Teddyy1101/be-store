import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipping } from '../../model/entities/shipping.entities';
import { Store } from '../../model/entities/store.entities';
import { Order } from '../../model/entities/order.entities';
import {
  CreateShippingDto,
  UpdateShippingDto,
} from '../../model/dto/shipping.dto';
import axios from 'axios';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private readonly shippingRepo: Repository<Shipping>,

    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  // 🚛 Tính phí và thời gian giao hàng
  async calculateShipping(storeId: number, customerAddress: string) {
    const store = await this.storeRepo.findOne({ where: { storeId } });
    if (!store) throw new NotFoundException('Không tìm thấy cửa hàng');

    // Lấy toạ độ khách hàng qua Nominatim
    const geoRes = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customerAddress)}`,
    );
    if (!geoRes.data.length)
      throw new NotFoundException('Không tìm thấy địa chỉ khách hàng');

    const { lat, lon } = geoRes.data[0];

    // Gọi OpenRouteService để tính quãng đường
    const routeRes = await axios.get(
      `https://api.openrouteservice.org/v2/directions/driving-car`,
      {
        params: {
          api_key: process.env.ORS_API_KEY,
          start: `${store.longitude},${store.latitude}`,
          end: `${lon},${lat}`,
        },
      },
    );

    const distanceKm =
      routeRes.data.features[0].properties.summary.distance / 1000;
    const shippingFee = Math.min(Math.max(15000, distanceKm * 5000), 50000);
    const estimatedTime = `${Math.ceil((distanceKm / 40) * 60)} phút`;

    return { distanceKm, shippingFee, estimatedTime };
  }

  async create(dto: CreateShippingDto) {
    const order = await this.orderRepo.findOne({
      where: { orderId: dto.orderId },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    let distanceKm = 0;
    let shippingFee = 0;
    let estimatedTime = '0 phút';

    if (dto.shippingType === 'DELIVERY') {
      const calc = await this.calculateShipping(
        dto.storeId,
        dto.customerAddress!,
      );
      distanceKm = calc.distanceKm;
      shippingFee = calc.shippingFee;
      estimatedTime = calc.estimatedTime;
    }

    const shipping = this.shippingRepo.create({
      order,
      store: { storeId: dto.storeId } as Store,
      shippingType: dto.shippingType,
      distanceKm,
      shippingFee,
      estimatedTime,
    });

    order.shippingFee = shippingFee;
    await this.orderRepo.save(order);

    await this.notificationService.create({
      type: 'ORDER',
      title: `Đơn hàng #${order.orderId} đã ${order.status}`,
      content: `Trạng thái đơn hàng của bạn đã chuyển sang "${order.status}".`,
      senderId: 1, // admin
      receiverId: order.user.userId,
      relatedId: order.orderId,
      relatedType: 'ORDER',
    });

    this.notificationGateway.sendToUser(order.user.userId, {
      title: `Đơn hàng #${order.orderId}`,
      content: `Trạng thái: ${order.status}`,
    });

    return this.shippingRepo.save(shipping);
  }

  // ⚙️ Cập nhật trạng thái giao hàng
  async update(id: number, dto: UpdateShippingDto) {
    const shipping = await this.shippingRepo.findOne({
      where: { shipId: id },
      relations: ['order', 'order.user'],
    });
    if (!shipping)
      throw new NotFoundException('Không tìm thấy thông tin giao hàng');

    Object.assign(shipping, dto);
    await this.shippingRepo.save(shipping);

    const order = shipping.order;
    const user = order.user;

    // 🔔 Gửi thông báo cho người dùng khi trạng thái vận chuyển thay đổi
    await this.notificationService.create({
      type: 'ORDER',
      title: `Đơn hàng #${order.orderCode} đã ${order.status}`,
      content: `Trạng thái giao hàng của bạn đã chuyển sang "${order.status}".`,
      senderId: 1, // admin
      receiverId: user.userId,
      relatedId: order.orderId,
      relatedType: 'ORDER',
    });

    // realtime gửi cho user
    this.notificationGateway.sendToUser(user.userId, {
      title: `Đơn hàng #${order.orderCode}`,
      content: `Trạng thái giao hàng: ${order.status}`,
    });

    return shipping;
  }

  findAll() {
    return this.shippingRepo.find({ relations: ['store', 'order'] });
  }

  findOne(id: number) {
    return this.shippingRepo.findOne({
      where: { shipId: id },
      relations: ['store', 'order'],
    });
  }

  remove(id: number) {
    return this.shippingRepo.delete(id);
  }
}

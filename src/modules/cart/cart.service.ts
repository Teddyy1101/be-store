import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../model/entities/warehouse.entities';
import { Cart } from '../../model/entities/cart.entities';
import { CartItem } from '../../model/entities/cart-item.entities';
import { User } from '../../model/entities/user.entities';
import { ProductOption } from '../../model/entities/product-option.entities';
import { AddToCartDto } from '../../model/dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ProductOption)
    private readonly optionRepo: Repository<ProductOption>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  // ✅ Thêm sản phẩm vào giỏ
  async addToCart(userId: number, dto: AddToCartDto) {
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    let cart = await this.cartRepo.findOne({
      where: { user: { userId } },
      relations: ['items', 'items.option'],
    });

    if (!cart) {
      cart = this.cartRepo.create({ user });
      cart = await this.cartRepo.save(cart);
    }

    const option = await this.optionRepo.findOne({
      where: { optionId: dto.optionId },
    });
    if (!option)
      throw new NotFoundException('Không tìm thấy tùy chọn sản phẩm');

    let item = cart.items?.find((i) => i.option.optionId === dto.optionId);

    if (item) {
      item.quantity += dto.quantity;
    } else {
      item = this.cartItemRepo.create({
        cart,
        option,
        quantity: dto.quantity,
      });
    }

    await this.cartItemRepo.save(item);
    const total = await this.updateCartTotal(cart.cartId);

    return {
      message: 'Đã thêm sản phẩm vào giỏ',
      cartId: cart.cartId,
      total,
    };
  }

  // ✅ Lấy giỏ hàng theo user (kèm tổng tiền)
  async getCart(userId: number) {
    const cart = await this.cartRepo.findOne({
      where: { user: { userId } },
      relations: ['items', 'items.option', 'items.option.product'],
    });
    if (!cart) throw new NotFoundException('Giỏ hàng trống');

    const total = await this.calculateCartTotal(cart.cartId);

    return { ...cart, total };
  }

  // ✅ Cập nhật trạng thái check của 1 item
  async updateItemCheck(userId: number, itemId: number, isChecked: boolean) {
    // Tìm item trực tiếp thay vì qua cart
    const item = await this.cartItemRepo.findOne({
      where: {
        itemId,
        cart: { user: { userId } },
      },
      relations: ['cart', 'cart.user'],
    });

    if (!item) throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ');

    item.isChecked = isChecked;
    await this.cartItemRepo.save(item);

    return {
      message: 'Đã cập nhật trạng thái sản phẩm',
      itemId,
      isChecked,
    };
  }

  // ✅ Cập nhật trạng thái check của tất cả items
  async updateAllItemsCheck(userId: number, isChecked: boolean) {
    const cart = await this.cartRepo.findOne({
      where: { user: { userId } },
      relations: ['items'],
    });
    if (!cart) throw new NotFoundException('Không tìm thấy giỏ hàng');

    // Cập nhật tất cả items
    for (const item of cart.items) {
      item.isChecked = isChecked;
    }

    await this.cartItemRepo.save(cart.items);

    return {
      message: `Đã ${isChecked ? 'chọn' : 'bỏ chọn'} tất cả sản phẩm`,
      count: cart.items.length,
      isChecked,
    };
  }

  // ✅ Xóa sản phẩm khỏi giỏ
  async removeItem(userId: number, itemId: number) {
    const item = await this.cartItemRepo.findOne({
      where: {
        itemId,
        cart: { user: { userId } },
      },
      relations: ['cart', 'cart.user'],
    });

    if (!item) throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ');

    const cartId = item.cart.cartId;

    // Xóa item
    await this.cartItemRepo.remove(item);

    // Cập nhật tổng tiền
    const total = await this.updateCartTotal(cartId);

    return {
      message: 'Đã xóa sản phẩm khỏi giỏ',
      itemId,
      total,
    };
  }

  // ✅ Xóa toàn bộ giỏ
  async clearCart(userId: number) {
    const cart = await this.cartRepo.findOne({
      where: { user: { userId } },
      relations: ['items'],
    });
    if (!cart) throw new NotFoundException('Không tìm thấy giỏ hàng');

    await this.cartItemRepo.remove(cart.items);
    return { message: 'Đã xóa toàn bộ giỏ hàng' };
  }

  private async calculateCartTotal(cartId: number): Promise<number> {
    const cart = await this.cartRepo.findOne({
      where: { cartId },
      relations: ['items', 'items.option'],
    });
    if (!cart) return 0;

    let total = 0;

    for (const item of cart.items) {
      const warehouse = await this.warehouseRepo.findOne({
        where: { option: { optionId: item.option.optionId } },
      });
      const price = warehouse?.baseSalePrice || 0;
      total += price * item.quantity;
    }

    return total;
  }

  private async updateCartTotal(cartId: number): Promise<number> {
    const total = await this.calculateCartTotal(cartId);
    return total;
  }
}

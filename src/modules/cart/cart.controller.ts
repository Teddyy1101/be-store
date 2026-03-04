import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { AddToCartDto } from '../../model/dto/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    const userId = req.user.userId;
    return this.cartService.addToCart(userId, dto);
  }

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.userId);
  }

  // ✅ Cập nhật trạng thái check của tất cả items (phải đặt TRƯỚC :itemId)
  @Patch('check-all')
  updateAllItemsCheck(@Req() req, @Body('isChecked') isChecked: boolean) {
    return this.cartService.updateAllItemsCheck(req.user.userId, isChecked);
  }

  @Patch(':itemId')
  updateQuantity(
    @Req() req,
    @Param('itemId') itemId: number,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(req.user.userId, itemId, quantity);
  }

  // ✅ Cập nhật trạng thái check của 1 item
  @Patch(':itemId/check')
  updateItemCheck(
    @Req() req,
    @Param('itemId') itemId: number,
    @Body('isChecked') isChecked: boolean,
  ) {
    return this.cartService.updateItemCheck(req.user.userId, itemId, isChecked);
  }

  @Delete(':itemId')
  removeItem(@Req() req, @Param('itemId') itemId: number) {
    return this.cartService.removeItem(req.user.userId, itemId);
  }

  @Delete()
  clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}

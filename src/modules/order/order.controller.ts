import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
  UseGuards,
  Req,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { Roles } from '../../common/decorator/roles.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from '../../model/dto/order.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    const userId = req.user.userId;
    const orderDto = {
      ...dto,
      userId,
    };

    return await this.orderService.create(orderDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    const params = {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
      status: query.status,
      orderType: query.orderType,
      dateFrom: query.dateFrom, // yyyy-mm-dd
      dateTo: query.dateTo, // yyyy-mm-dd
    };

    const result = await this.orderService.findAll(params);

    return {
      orders: result.data,
      total: result.total,
      page: params.page || 1,
      limit: params.limit || 10,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: number, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.orderService.remove(id);
  }

  @Get('sold-quantity/:productId')
  async getSoldQuantity(@Param('productId', ParseIntPipe) productId: number) {
    const result = await this.orderService.getSoldQuantityByProduct(productId);

    if (!result) {
      throw new NotFoundException(
        `Sản phẩm không tồn tại hoặc chưa có đơn hàng hoàn thành`,
      );
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/me')
  async getMyOrders(
    @Req() req,
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const userId = req.user.userId;

    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;
    const search = query.search?.trim() || '';

    return await this.orderService.findByUser(userId, { page, limit, search });
  }
}

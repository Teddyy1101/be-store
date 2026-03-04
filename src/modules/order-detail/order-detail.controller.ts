import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrderDetailService } from './order-detail.service';
import { CreateOrderDetailDto } from '../../model/dto/order-detail.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('order-detail')
@Controller('order-detail')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateOrderDetailDto) {
    return this.orderDetailService.create(dto);
  }

  @Get()
  async findAll() {
    return this.orderDetailService.findAll();
  }

  @Get('order/:orderId')
  async findByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;
    const search = query.search?.trim() || '';

    return await this.orderDetailService.findByOrder(orderId, {
      page,
      limit,
      search,
    });
  }
}

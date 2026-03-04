import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from '../../model/dto/warehouse.dto';
import { Roles } from '../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guard/roles.guard';

@ApiTags('warehouses')
@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async findAll(
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;
    const search = query.search?.trim() || '';

    return this.warehouseService.findAll({ page, limit, search });
  }
  @Patch('update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateQty(
    @Query('optionId') optionId: number,
    @Query('storeId') storeId: number,
    @Query('delta') delta: number,
  ) {
    return this.warehouseService.updateQuantity(optionId, storeId, delta);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async importStock(@Body() dto: CreateWarehouseDto) {
    return await this.warehouseService.importStock(dto);
  }

  @Get('by-option')
  async getWarehouseByOption(@Query('optionId') optionId: string) {
    return this.warehouseService.findByOptionId(Number(optionId));
  }

  @Get('product/:productId')
  async getStockByProductId(
    @Param('productId') productId: number,
    @Query('storeId') storeId?: number,
  ) {
    return await this.warehouseService.findStockByProductId(
      productId,
      storeId ? Number(storeId) : undefined,
    );
  }
}

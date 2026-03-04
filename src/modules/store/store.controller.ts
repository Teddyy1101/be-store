import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto, UpdateStoreDto } from '../../model/dto/store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  create(@Body() dto: CreateStoreDto) {
    return this.storeService.create(dto);
  }

  @Get()
  async findAll(
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;

    const search = query.search?.trim() || '';

    return this.storeService.findAll({ page, limit, search });
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateStoreDto) {
    return this.storeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.storeService.remove(id);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: number) {
    return this.storeService.toggleStatus(id);
  }
}

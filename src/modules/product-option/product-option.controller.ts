import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductOptionService } from './product-option.service';
import {
  CreateProductOptionDto,
  UpdateProductOptionDto,
} from '../../model/dto/product-option.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('product-options')
@Controller('product-options')
export class ProductOptionController {
  constructor(private readonly optionService: ProductOptionService) {}

  @Get()
  findAll() {
    return this.optionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.optionService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductOptionDto) {
    return this.optionService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: number, @Body() dto: UpdateProductOptionDto) {
    return this.optionService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: number) {
    return this.optionService.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: number, @Body('isActive') isActive: boolean) {
    return this.optionService.updateStatus(id, isActive);
  }

  @Get('product/:id')
  async getByProductId(@Param('id', ParseIntPipe) id: number) {
    return this.optionService.findByProductId(id);
  }

  @Get(':id/product')
  async getProductByOptionId(@Param('id', ParseIntPipe) id: number) {
    return this.optionService.findProductByOptionId(id);
  }
}
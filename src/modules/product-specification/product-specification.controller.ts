import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProductSpecificationService } from './product-specification.service';
import {
  CreateProductSpecificationDto,
  UpdateProductSpecificationDto,
} from '../../model/dto/product-spec.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('product-specifications')
@Controller('product-specification')
export class ProductSpecificationController {
  constructor(private readonly specService: ProductSpecificationService) {}

  @Get()
  findAll() {
    return this.specService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.specService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductSpecificationDto) {
    return this.specService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: number, @Body() dto: UpdateProductSpecificationDto) {
    return this.specService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: number) {
    return this.specService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CreateProductImageDto } from '../../model/dto/product-image.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('product-images')
@Controller('product-image')
export class ProductImageController {
  constructor(private readonly imageService: ProductImageService) {}

  @Get(':proId')
  async findByProduct(@Param('proId', ParseIntPipe) proId: number) {
    return this.imageService.findByProductId(proId);
  }

  @Post(':proId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async create(
    @Param('proId', ParseIntPipe) proId: number,
    @Body() dto: { imageUrl: string; isCover?: boolean },
  ) {
    const { imageUrl, isCover = false } = dto;
    return this.imageService.addImage(proId, imageUrl, isCover);
  }

  @Delete(':imgId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async removeImage(@Param('imgId', ParseIntPipe) imgId: number) {
    await this.imageService.removeImage(imgId);
    return { message: 'Image deleted successfully' };
  }
}

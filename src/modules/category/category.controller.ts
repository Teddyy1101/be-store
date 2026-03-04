import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../model/dto/category.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;
    const search = query.search?.trim() || '';

    return this.categoryService.findAll({ page, limit, search });
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string | number) {
    return this.categoryService.findOne(idOrSlug);
  }

  @Get('check-name')
  async checkName(@Query('name') name: string) {
    const exists = await this.categoryService.checkName(name);
    return { exists };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':slug')
  update(@Param('slug') slug: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(slug, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.categoryService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':slug/status')
  async updateStatus(
    @Param('slug') slug: string,
    @Body('isActive') isActive: boolean,
  ) {
    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean');
    }
    return this.categoryService.updateStatus(slug, isActive);
  }
}

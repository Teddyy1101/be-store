import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UploadedFile,
  Req,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../../model/dto/product.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;
    const search = query.search?.trim() || '';

    return await this.productService.findAll({
      page,
      limit,
      search,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return await this.productService.findOne(slug);
  }

  @Post(':slug/view')
  async increaseView(@Param('slug') slug: string) {
    await this.productService.increaseView(slug);
    return { message: 'View count increased' };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    try {
      const coverIndex = (req.body as any).coverIndex;
      return await this.productService.create(dto, files, coverIndex);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, uniqueSuffix + ext);
        },
      }),
    }),
  )
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return await this.productService.update(slug, dto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: number) {
    await this.productService.remove(id);
    return { message: 'Product deleted successfully' };
  }

  @Patch(':id/status')
  async changeStatus(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    return this.productService.changeStatus(id, dto.isActive!);
  }

  @Get('category/:categoryId')
  async getByCategoryId(@Param('categoryId', ParseIntPipe) categoryId: number) {
    const products = await this.productService.getByCategoryId(categoryId);
    return {
      success: true,
      data: products,
    };
  }
}

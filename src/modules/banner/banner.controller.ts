import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  Patch,
  ParseBoolPipe,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from '../../model/dto/banner.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('banners')
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async findAll(
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;
    const search = query.search?.trim() || '';

    return this.bannerService.findAll({ page, limit, search });
  }

  @Get('active')
  findActive() {
    return this.bannerService.findActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/banners',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @Body('isActive', ParseBoolPipe) isActive: boolean, 
    @Body() dto: CreateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    dto.isActive = isActive;
    const imageUrl = file ? `/uploads/banners/${file.filename}` : undefined;
    return this.bannerService.create(dto, imageUrl);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/banners',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: number,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateBannerDto,
  ) {
    dto.isActive = isActive;
    if (file) {
      dto.imageUrl = `/uploads/banners/${file.filename}`;
    }
    return await this.bannerService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':bannerId/status')
  async updateStatus(
    @Param('bannerId', ParseIntPipe) bannerId: number,
    @Body('isActive') isActive: boolean,
  ) {
    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean');
    }
    return this.bannerService.updateStatus(bannerId, isActive);
  }
}

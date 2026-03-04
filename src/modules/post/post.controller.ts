import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
  BadRequestException,
  Patch,
  ParseBoolPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from '../../model/dto/post.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async findAll(
    @Query() query: { page?: string; limit?: string; search?: string },
  ) {
    const page = query.page ? Math.max(1, parseInt(query.page)) : 1;

    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit)))
      : 10;

    const search = query.search?.trim() || '';

    return await this.postService.findAll({
      page,
      limit,
      search,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.postService.findOne(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body('isActive', ParseBoolPipe) isActive: boolean,
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    dto.isActive = isActive;

    const thumbnailUrl = file ? `/uploads/posts/${file.filename}` : undefined;
    return this.postService.create(dto, thumbnailUrl);
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('slug') slug: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    dto.isActive = isActive;
    const thumbnailUrl = file ? `/uploads/posts/${file.filename}` : undefined;
    return this.postService.update(slug, dto, thumbnailUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.postService.remove(id);
  }

  @Patch(':id/status')
  async changeStatus(@Param('id') id: number, @Body() dto: UpdatePostDto) {
    return this.postService.changeStatus(id, dto.isActive!);
  }
}

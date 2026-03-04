import {
  Controller,
  Post,
  Delete,
  Get,
  Put,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { CreateReviewDto, UpdateReviewDto } from '../../model/dto/review.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/reviews',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() dto: CreateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any, // ✅ Thêm @Req()
  ) {
    const user = req.user; // ✅ Lấy user từ JWT

    const imageUrls =
      files?.map((file) => `/uploads/reviews/${file.filename}`) || [];
    dto.imageUrls = imageUrls;

    // ✅ Truyền userId từ JWT vào service
    return this.reviewService.create({
      ...dto,
      userId: user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/reviews',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const user = req.user;
    const imageUrls =
      files?.map((file) => `/uploads/reviews/${file.filename}`) || [];
    dto.imageUrls = imageUrls;
    return this.reviewService.update(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: any) {
    const user = req.user;
    const isAdmin = user.role === 'admin';
    return this.reviewService.deleteReview(user.userId, id, isAdmin);
  }

  @Get('product/:proId')
  async getByProduct(@Param('proId') proId: number) {
    return this.reviewService.getReviewsByProduct(proId);
  }

  @Get('rating/:proId')
  async getRating(@Param('proId') proId: number) {
    return this.reviewService.getRatingSummary(proId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-purchase/:proId')
  async checkPurchase(@Param('proId') proId: number, @Req() req: any) {
    const user = req.user;
    return this.reviewService.checkPurchaseStatus(user.userId, proId);
  }
}

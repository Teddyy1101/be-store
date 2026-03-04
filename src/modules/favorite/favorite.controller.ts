import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from '../../model/dto/favorite.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('favorites')
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addFavorite(@Req() req, @Body() dto: CreateFavoriteDto) {
    const userId = req.user.userId;
    return this.favoriteService.addFavorite(userId, dto);
  }

  @Delete(':proId')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(
    @Req() req,
    @Param('proId', ParseIntPipe) proId: number,
  ) {
    const userId = req.user.userId;
    return this.favoriteService.removeFavorite(userId, proId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFavorites(@Req() req) {
    const userId = req.user.userId; 
    return this.favoriteService.getFavoritesByUser(userId);
  }

  @Get('check/:userId/:proId')
  @UseGuards(JwtAuthGuard)
  async checkFavorite(
    @Param('userId') userId: number,
    @Param('proId') proId: number,
  ) {
    return this.favoriteService.isFavorite(Number(userId), Number(proId));
  }
}

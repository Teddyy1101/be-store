import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../model/entities/favorite.entities';
import { CreateFavoriteDto } from '../../model/dto/favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  async addFavorite(userId: number, dto: CreateFavoriteDto) {
    const existing = await this.favoriteRepo.findOne({
      where: {
        user: { userId },
        product: { proId: dto.proId },
      },
      relations: ['product'], // chỉ lấy product
    });

    if (existing) {
      throw new BadRequestException('Sản phẩm đã có trong danh sách yêu thích');
    }
    const favorite = this.favoriteRepo.create({
      user: { userId },
      product: { proId: dto.proId },
    });

    const savedFavorite = await this.favoriteRepo.save(favorite);
    const result = await this.favoriteRepo.findOne({
      where: { favId: savedFavorite.favId },
      relations: ['product'],
    });

    return {
      userId,
      product: result!.product,
    };
  }

  async removeFavorite(userId: number, proId: number) {
    const favorite = await this.favoriteRepo.findOne({
      where: {
        user: { userId },
        product: { proId },
      },
    });

    if (!favorite)
      throw new BadRequestException(
        'Không tìm thấy sản phẩm trong danh sách yêu thích',
      );

    await this.favoriteRepo.remove(favorite);
    return { message: 'Đã xóa khỏi danh sách yêu thích' };
  }

  async getFavoritesByUser(userId: number) {
    const favorites = await this.favoriteRepo.find({
      where: { user: { userId } },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
    return favorites.map((fav) => fav.product);
  }

  async isFavorite(userId: number, proId: number) {
    const fav = await this.favoriteRepo.findOne({
      where: { user: { userId }, product: { proId } },
    });
    return { isFavorite: !!fav };
  }
}

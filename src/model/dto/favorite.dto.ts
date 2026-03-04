import { IsInt } from 'class-validator';

export class CreateFavoriteDto {
  @IsInt()
  userId: number;

  @IsInt()
  proId: number;
}
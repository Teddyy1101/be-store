import { IsInt, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  optionId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsInt()
  userId?: number;
}
export class UpdateCartItemDto extends AddToCartDto {}
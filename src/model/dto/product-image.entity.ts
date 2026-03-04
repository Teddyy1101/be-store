import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductImageDto {
  @IsString({ message: 'imageUrl phải là chuỗi' })
  imageUrl: string;

  @IsBoolean({ message: 'isCover phải là boolean' })
  @IsOptional()
  isCover?: boolean = false;
}
